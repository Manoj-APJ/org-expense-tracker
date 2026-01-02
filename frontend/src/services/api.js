const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text);
    if (text.startsWith('<!DOCTYPE html>')) {
      throw new Error(`Server returned HTML instead of JSON. This often happens if the API route is incorrect or the proxy failed. (URL: ${response.url})`);
    }
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }
  return data;
};

// Auth APIs
export const register = async (email, password, name) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password, name }),
  });
  const data = await handleResponse(response);
  localStorage.setItem('token', data.token);
  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(response);
  localStorage.setItem('token', data.token);
  return data;
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Organization APIs
export const getMyOrganization = async () => {
  const response = await fetch(`${API_BASE_URL}/organizations/my-organization`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createOrganization = async (name, initialBalance) => {
  const response = await fetch(`${API_BASE_URL}/organizations/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, initialBalance }),
  });
  return handleResponse(response);
};

export const listOrganizations = async () => {
  const response = await fetch(`${API_BASE_URL}/organizations/list`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const joinOrganization = async (organizationId) => {
  const response = await fetch(`${API_BASE_URL}/organizations/join`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ organizationId }),
  });
  return handleResponse(response);
};

export const getPendingMemberships = async () => {
  const response = await fetch(`${API_BASE_URL}/organizations/pending-memberships`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const approveMembership = async (membershipId) => {
  const response = await fetch(`${API_BASE_URL}/organizations/approve-membership/${membershipId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const rejectMembership = async (membershipId) => {
  const response = await fetch(`${API_BASE_URL}/organizations/reject-membership/${membershipId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const setOrganizationBalance = async (organizationId, balance) => {
  const response = await fetch(`${API_BASE_URL}/organizations/set-balance/${organizationId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ balance }),
  });
  return handleResponse(response);
};

// Transaction APIs
export const submitTransaction = async (organizationId, type, amount, description, date) => {
  const response = await fetch(`${API_BASE_URL}/transactions/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ organizationId, type, amount, description, date }),
  });
  return handleResponse(response);
};

export const getMyTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions/my-transactions`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAllTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions/org-transactions`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getPendingTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions/pending`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const approveTransaction = async (transactionId) => {
  const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/approve`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const rejectTransaction = async (transactionId) => {
  const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/reject`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

