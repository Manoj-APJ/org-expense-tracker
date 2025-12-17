import React, { useState, useEffect } from 'react';
import { getMyOrganization, createOrganization, listOrganizations, joinOrganization, submitTransaction, getMyTransactions } from '../services/api';

function Dashboard({ user, onLogout }) {
  const [organization, setOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showJoinOrg, setShowJoinOrg] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  
  // Form states
  const [orgName, setOrgName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [transactionType, setTransactionType] = useState('income');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgData, orgsData, transData] = await Promise.all([
        getMyOrganization(),
        listOrganizations(),
        getMyTransactions()
      ]);
      setOrganization(orgData.organization);
      setOrganizations(orgsData.organizations);
      setTransactions(transData.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createOrganization(orgName, initialBalance ? parseFloat(initialBalance) : 0);
      setSuccess('Organization created successfully!');
      setShowCreateOrg(false);
      setOrgName('');
      setInitialBalance('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinOrganization = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await joinOrganization(selectedOrgId);
      setSuccess('Join request submitted! Waiting for admin approval.');
      setShowJoinOrg(false);
      setSelectedOrgId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!organization) {
      setError('You must be a member of an organization to submit transactions');
      return;
    }
    try {
      await submitTransaction(
        organization.id,
        transactionType,
        parseFloat(transactionAmount),
        transactionDescription,
        transactionDate
      );
      setSuccess('Transaction submitted successfully! Waiting for admin approval.');
      setShowTransactionForm(false);
      setTransactionAmount('');
      setTransactionDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge badge-pending">Pending</span>,
      approved: <span className="badge badge-approved">Approved</span>,
      rejected: <span className="badge badge-rejected">Rejected</span>
    };
    return badges[status] || status;
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Expense Tracker</h1>
          <div className="header-actions">
            <span>Welcome, {user.name}</span>
            <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
        {success && <div className="success" style={{ marginBottom: '16px' }}>{success}</div>}

        {/* Organization Section */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Organization</h2>
          {organization ? (
            <div>
              <p><strong>Name:</strong> {organization.name}</p>
              <p><strong>Balance:</strong> ${parseFloat(organization.balance || 0).toFixed(2)}</p>
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '16px', color: '#666' }}>You are not a member of any organization yet.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => { setShowCreateOrg(true); setShowJoinOrg(false); }}>
                  Create Organization
                </button>
                <button className="btn btn-secondary" onClick={() => { setShowJoinOrg(true); setShowCreateOrg(false); }}>
                  Join Organization
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Organization Form */}
        {showCreateOrg && (
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Create Organization</h3>
            <form onSubmit={handleCreateOrganization}>
              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Initial Balance (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateOrg(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Join Organization Form */}
        {showJoinOrg && (
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Join Organization</h3>
            <form onSubmit={handleJoinOrganization}>
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
                      {org.name} {org.membership_status ? `(${org.membership_status})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">Request to Join</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowJoinOrg(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Transaction Submission */}
        {organization && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>Submit Transaction</h2>
            {!showTransactionForm ? (
              <button className="btn btn-primary" onClick={() => setShowTransactionForm(true)}>
                Submit Income/Expense
              </button>
            ) : (
              <form onSubmit={handleSubmitTransaction}>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    required
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">Submit</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTransactionForm(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* My Transactions */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>My Transactions</h2>
          {transactions.length === 0 ? (
            <div className="empty-state">No transactions yet</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Organization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                    <td>${parseFloat(t.amount).toFixed(2)}</td>
                    <td>{t.description}</td>
                    <td>{t.organization_name}</td>
                    <td>{getStatusBadge(t.status)}</td>
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

export default Dashboard;

