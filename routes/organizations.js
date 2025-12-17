const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get user's organization
router.get('/my-organization', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, om.status as membership_status
      FROM organizations o
      JOIN organization_members om ON o.id = om.organization_id
      WHERE om.user_id = $1 AND om.status = 'approved'
      LIMIT 1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.json({ organization: null });
    }

    res.json({ organization: result.rows[0] });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create organization
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, initialBalance } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create organization
      const orgResult = await client.query(
        'INSERT INTO organizations (name, balance, created_by) VALUES ($1, $2, $3) RETURNING *',
        [name, initialBalance || 0, req.user.id]
      );

      const organization = orgResult.rows[0];

      // Add creator as approved member
      await client.query(
        'INSERT INTO organization_members (organization_id, user_id, status, approved_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        [organization.id, req.user.id, 'approved']
      );

      await client.query('COMMIT');

      res.status(201).json({ organization });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request to join organization
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Check if organization exists
    const orgCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [organizationId]);
    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if already a member
    const memberCheck = await pool.query(
      'SELECT id, status FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [organizationId, req.user.id]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Already a member or pending request exists' });
    }

    // Create membership request
    const result = await pool.query(
      'INSERT INTO organization_members (organization_id, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [organizationId, req.user.id, 'pending']
    );

    res.status(201).json({ membership: result.rows[0] });
  } catch (error) {
    console.error('Join organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List all organizations (for joining)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.name, o.balance, o.created_at,
             CASE WHEN om.user_id IS NOT NULL THEN om.status ELSE NULL END as membership_status
      FROM organizations o
      LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json({ organizations: result.rows });
  } catch (error) {
    console.error('List organizations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get pending membership requests
router.get('/pending-memberships', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT om.id, om.organization_id, om.user_id, om.requested_at,
             o.name as organization_name,
             u.name as user_name, u.email as user_email
      FROM organization_members om
      JOIN organizations o ON om.organization_id = o.id
      JOIN users u ON om.user_id = u.id
      WHERE om.status = 'pending'
      ORDER BY om.requested_at DESC
    `);

    res.json({ memberships: result.rows });
  } catch (error) {
    console.error('Get pending memberships error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve membership
router.post('/approve-membership/:membershipId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { membershipId } = req.params;

    const result = await pool.query(
      'UPDATE organization_members SET status = $1, approved_at = CURRENT_TIMESTAMP WHERE id = $2 AND status = $3 RETURNING *',
      ['approved', membershipId, 'pending']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership request not found or already processed' });
    }

    res.json({ membership: result.rows[0] });
  } catch (error) {
    console.error('Approve membership error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Reject membership
router.post('/reject-membership/:membershipId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { membershipId } = req.params;

    const result = await pool.query(
      'UPDATE organization_members SET status = $1 WHERE id = $2 AND status = $3 RETURNING *',
      ['rejected', membershipId, 'pending']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership request not found or already processed' });
    }

    res.json({ membership: result.rows[0] });
  } catch (error) {
    console.error('Reject membership error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Set organization balance
router.post('/set-balance/:organizationId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { balance } = req.body;

    if (balance === undefined || balance === null) {
      return res.status(400).json({ error: 'Balance is required' });
    }

    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      return res.status(400).json({ error: 'Balance must be a valid non-negative number' });
    }

    const result = await pool.query(
      'UPDATE organizations SET balance = $1 WHERE id = $2 RETURNING *',
      [balanceNum, organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ organization: result.rows[0] });
  } catch (error) {
    console.error('Set balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

