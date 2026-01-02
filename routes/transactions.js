const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Submit transaction
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { organizationId, type, amount, description, date } = req.body;

    if (!organizationId || !type || !amount || !description || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be income or expense' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Verify user is approved member of organization
    const memberCheck = await pool.query(
      'SELECT id FROM organization_members WHERE organization_id = $1 AND user_id = $2 AND status = $3',
      [organizationId, req.user.id, 'approved']
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must be an approved member of this organization' });
    }

    // Create transaction
    const result = await pool.query(
      'INSERT INTO transactions (organization_id, user_id, type, amount, description, date, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [organizationId, req.user.id, type, amountNum, description, date, 'pending']
    );

    res.status(201).json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Submit transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's transactions
router.get('/my-transactions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, o.name as organization_name
      FROM transactions t
      JOIN organizations o ON t.organization_id = o.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
    `, [req.user.id]);

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all transactions for the user's organization
router.get('/org-transactions', authenticateToken, async (req, res) => {
  console.log('GET /api/transactions/org-transactions hit by user:', req.user.id);
  try {
    // First, find the organization the user belongs to
    const orgResult = await pool.query(`
      SELECT organization_id FROM organization_members 
      WHERE user_id = $1 AND status = 'approved' 
      LIMIT 1
    `, [req.user.id]);

    if (orgResult.rows.length === 0) {
      return res.json({ transactions: [] });
    }

    const organizationId = orgResult.rows[0].organization_id;

    const result = await pool.query(`
      SELECT t.*, u.name as user_name, o.name as organization_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN organizations o ON t.organization_id = o.id
      WHERE t.organization_id = $1
      ORDER BY t.date DESC, t.created_at DESC
    `, [organizationId]);

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get organization transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin/Creator: Get pending transactions
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT t.*, o.name as organization_name, u.name as user_name, u.email as user_email
      FROM transactions t
      JOIN organizations o ON t.organization_id = o.id
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'pending'
    `;
    let params = [];

    // If not global admin, only show pending transactions for organizations they created
    if (req.user.role !== 'admin') {
      query += ` AND o.created_by = $1`;
      params.push(req.user.id);
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve transaction (Creator or Admin only)
router.patch('/:transactionId/approve', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { transactionId } = req.params;

    // Get transaction details and org creator info
    const transResult = await client.query(`
      SELECT t.*, o.created_by as org_creator
      FROM transactions t
      JOIN organizations o ON t.organization_id = o.id
      WHERE t.id = $1
    `, [transactionId]);

    if (transResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transResult.rows[0];

    // Authorization check: Must be global admin OR organization creator
    if (req.user.role !== 'admin' && transaction.org_creator !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Only the organization creator can approve transactions' });
    }

    if (transaction.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // Update transaction status
    await client.query(
      'UPDATE transactions SET status = $1, approved_at = CURRENT_TIMESTAMP, approved_by = $2 WHERE id = $3',
      ['approved', req.user.id, transactionId]
    );

    // Update organization balance
    if (transaction.type === 'income') {
      await client.query(
        'UPDATE organizations SET balance = balance + $1 WHERE id = $2',
        [transaction.amount, transaction.organization_id]
      );
    } else if (transaction.type === 'expense') {
      await client.query(
        'UPDATE organizations SET balance = balance - $1 WHERE id = $2',
        [transaction.amount, transaction.organization_id]
      );
    }

    await client.query('COMMIT');

    // Get updated transaction
    const updatedResult = await client.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
    res.json({ transaction: updatedResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Approve transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Reject transaction (Creator or Admin only)
router.patch('/:transactionId/reject', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Get transaction details and org creator info
    const transResult = await pool.query(`
      SELECT t.*, o.created_by as org_creator
      FROM transactions t
      JOIN organizations o ON t.organization_id = o.id
      WHERE t.id = $1
    `, [transactionId]);

    if (transResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transResult.rows[0];

    // Authorization check
    if (req.user.role !== 'admin' && transaction.org_creator !== req.user.id) {
      return res.status(403).json({ error: 'Only the organization creator can reject transactions' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    const result = await pool.query(
      'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
      ['rejected', transactionId]
    );

    res.json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Keep old POST endpoints for backward compatibility but use same logic
router.post('/approve/:transactionId', authenticateToken, async (req, res) => {
  res.redirect(307, `/api/transactions/${req.params.transactionId}/approve`);
});

router.post('/reject/:transactionId', authenticateToken, async (req, res) => {
  res.redirect(307, `/api/transactions/${req.params.transactionId}/reject`);
});

module.exports = router;

