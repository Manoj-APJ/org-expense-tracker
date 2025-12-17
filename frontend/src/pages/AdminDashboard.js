import React, { useState, useEffect } from 'react';
import { getPendingMemberships, approveMembership, rejectMembership, getPendingTransactions, approveTransaction, rejectTransaction, listOrganizations, setOrganizationBalance } from '../services/api';

function AdminDashboard({ user, onLogout }) {
  const [pendingMemberships, setPendingMemberships] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSetBalance, setShowSetBalance] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membershipsData, transactionsData, orgsData] = await Promise.all([
        getPendingMemberships(),
        getPendingTransactions(),
        listOrganizations()
      ]);
      setPendingMemberships(membershipsData.memberships);
      setPendingTransactions(transactionsData.transactions);
      setOrganizations(orgsData.organizations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMembership = async (membershipId) => {
    setError('');
    setSuccess('');
    try {
      await approveMembership(membershipId);
      setSuccess('Membership approved successfully!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectMembership = async (membershipId) => {
    setError('');
    setSuccess('');
    try {
      await rejectMembership(membershipId);
      setSuccess('Membership rejected.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveTransaction = async (transactionId) => {
    setError('');
    setSuccess('');
    try {
      await approveTransaction(transactionId);
      setSuccess('Transaction approved successfully!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectTransaction = async (transactionId) => {
    setError('');
    setSuccess('');
    try {
      await rejectTransaction(transactionId);
      setSuccess('Transaction rejected.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetBalance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await setOrganizationBalance(selectedOrgId, parseFloat(newBalance));
      setSuccess('Balance updated successfully!');
      setShowSetBalance(false);
      setSelectedOrgId('');
      setNewBalance('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <span>Welcome, {user.name}</span>
            <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
        {success && <div className="success" style={{ marginBottom: '16px' }}>{success}</div>}

        {/* Set Organization Balance */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Organization Balance Management</h2>
          {!showSetBalance ? (
            <button className="btn btn-primary" onClick={() => setShowSetBalance(true)}>
              Set Organization Balance
            </button>
          ) : (
            <form onSubmit={handleSetBalance}>
              <div className="form-group">
                <label>Select Organization</label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  required
                >
                  <option value="">Select an organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} (Current: ${parseFloat(org.balance || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>New Balance</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">Update Balance</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowSetBalance(false); setSelectedOrgId(''); setNewBalance(''); }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Pending Memberships */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Pending Membership Requests</h2>
          {pendingMemberships.length === 0 ? (
            <div className="empty-state">No pending membership requests</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Organization</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingMemberships.map((membership) => (
                  <tr key={membership.id}>
                    <td>{membership.user_name}</td>
                    <td>{membership.user_email}</td>
                    <td>{membership.organization_name}</td>
                    <td>{new Date(membership.requested_at).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-success"
                          onClick={() => handleApproveMembership(membership.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRejectMembership(membership.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pending Transactions */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Pending Transactions</h2>
          {pendingTransactions.length === 0 ? (
            <div className="empty-state">No pending transactions</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>User</th>
                  <th>Organization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>{transaction.type}</td>
                    <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.user_name}</td>
                    <td>{transaction.organization_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-success"
                          onClick={() => handleApproveTransaction(transaction.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRejectTransaction(transaction.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

