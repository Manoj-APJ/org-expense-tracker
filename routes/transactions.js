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

// Admin: Get pending transactions
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, o.name as organization_name, u.name as user_name, u.email as user_email
      FROM transactions t
      JOIN organizations o ON t.organization_id = o.id
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'pending'
      ORDER BY t.created_at DESC
    `);

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve transaction
router.post('/approve/:transactionId', authenticateToken, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { transactionId } = req.params;

    // Get transaction details
    const transResult = await client.query(
      'SELECT * FROM transactions WHERE id = $1 AND status = $2',
      [transactionId, 'pending']
    );

    if (transResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found or already processed' });
    }

    const transaction = transResult.rows[0];

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

// Admin: Reject transaction
router.post('/reject/:transactionId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const result = await pool.query(
      'UPDATE transactions SET status = $1 WHERE id = $2 AND status = $3 RETURNING *',
      ['rejected', transactionId, 'pending']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found or already processed' });
    }

    res.json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

