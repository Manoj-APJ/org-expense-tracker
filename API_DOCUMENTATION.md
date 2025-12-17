# API Documentation

Base URL: `http://localhost:5000/api`

All endpoints except `/auth/register` and `/auth/login` require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Authentication Endpoints

### Register
- **POST** `/auth/register`
- **Description**: Register a new user
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
  ```

### Login
- **POST** `/auth/login`
- **Description**: Login and get JWT token
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
  ```

### Get Current User
- **GET** `/auth/me`
- **Description**: Get current authenticated user info
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
  ```

## Organization Endpoints

### Get My Organization
- **GET** `/organizations/my-organization`
- **Description**: Get the organization the user is an approved member of
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "organization": {
      "id": 1,
      "name": "My Org",
      "balance": "1000.00",
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "membership_status": "approved"
    }
  }
  ```
  Returns `{ "organization": null }` if user is not a member

### Create Organization
- **POST** `/organizations/create`
- **Description**: Create a new organization (user becomes approved member)
- **Headers**: Authorization required
- **Body**:
  ```json
  {
    "name": "My Organization",
    "initialBalance": 0
  }
  ```
- **Response**:
  ```json
  {
    "organization": {
      "id": 1,
      "name": "My Organization",
      "balance": "0.00",
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### List All Organizations
- **GET** `/organizations/list`
- **Description**: List all organizations with membership status for current user
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "organizations": [
      {
        "id": 1,
        "name": "Org 1",
        "balance": "1000.00",
        "created_at": "2024-01-01T00:00:00.000Z",
        "membership_status": "pending"
      }
    ]
  }
  ```

### Request to Join Organization
- **POST** `/organizations/join`
- **Description**: Request to join an organization (creates pending membership)
- **Headers**: Authorization required
- **Body**:
  ```json
  {
    "organizationId": 1
  }
  ```
- **Response**:
  ```json
  {
    "membership": {
      "id": 1,
      "organization_id": 1,
      "user_id": 2,
      "status": "pending",
      "requested_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Get Pending Memberships (Admin Only)
- **GET** `/organizations/pending-memberships`
- **Description**: Get all pending organization membership requests
- **Headers**: Authorization required (Admin role)
- **Response**:
  ```json
  {
    "memberships": [
      {
        "id": 1,
        "organization_id": 1,
        "user_id": 2,
        "requested_at": "2024-01-01T00:00:00.000Z",
        "organization_name": "My Org",
        "user_name": "John Doe",
        "user_email": "john@example.com"
      }
    ]
  }
  ```

### Approve Membership (Admin Only)
- **POST** `/organizations/approve-membership/:membershipId`
- **Description**: Approve a pending membership request
- **Headers**: Authorization required (Admin role)
- **Response**:
  ```json
  {
    "membership": {
      "id": 1,
      "organization_id": 1,
      "user_id": 2,
      "status": "approved",
      "approved_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Reject Membership (Admin Only)
- **POST** `/organizations/reject-membership/:membershipId`
- **Description**: Reject a pending membership request
- **Headers**: Authorization required (Admin role)
- **Response**:
  ```json
  {
    "membership": {
      "id": 1,
      "organization_id": 1,
      "user_id": 2,
      "status": "rejected"
    }
  }
  ```

### Set Organization Balance (Admin Only)
- **POST** `/organizations/set-balance/:organizationId`
- **Description**: Set the balance of an organization
- **Headers**: Authorization required (Admin role)
- **Body**:
  ```json
  {
    "balance": 5000.00
  }
  ```
- **Response**:
  ```json
  {
    "organization": {
      "id": 1,
      "name": "My Org",
      "balance": "5000.00",
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

## Transaction Endpoints

### Submit Transaction
- **POST** `/transactions/submit`
- **Description**: Submit an income or expense transaction (requires approved membership)
- **Headers**: Authorization required
- **Body**:
  ```json
  {
    "organizationId": 1,
    "type": "income",
    "amount": 1000.00,
    "description": "Monthly revenue",
    "date": "2024-01-15"
  }
  ```
- **Response**:
  ```json
  {
    "transaction": {
      "id": 1,
      "organization_id": 1,
      "user_id": 2,
      "type": "income",
      "amount": "1000.00",
      "description": "Monthly revenue",
      "date": "2024-01-15",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Get My Transactions
- **GET** `/transactions/my-transactions`
- **Description**: Get all transactions submitted by the current user
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "transactions": [
      {
        "id": 1,
        "organization_id": 1,
        "user_id": 2,
        "type": "income",
        "amount": "1000.00",
        "description": "Monthly revenue",
        "date": "2024-01-15",
        "status": "approved",
        "created_at": "2024-01-01T00:00:00.000Z",
        "approved_at": "2024-01-01T01:00:00.000Z",
        "approved_by": 1,
        "organization_name": "My Org"
      }
    ]
  }
  ```

### Get Pending Transactions (Admin Only)
- **GET** `/transactions/pending`
- **Description**: Get all pending transactions
- **Headers**: Authorization required (Admin role)
- **Response**:
  ```json
  {
    "transactions": [
      {
        "id": 1,
        "organization_id": 1,
        "user_id": 2,
        "type": "income",
        "amount": "1000.00",
        "description": "Monthly revenue",
        "date": "2024-01-15",
        "status": "pending",
        "created_at": "2024-01-01T00:00:00.000Z",
        "organization_name": "My Org",
        "user_name": "John Doe",
        "user_email": "john@example.com"
      }
    ]
  }
  ```

### Approve Transaction (Admin Only)
- **POST** `/transactions/approve/:transactionId`
- **Description**: Approve a pending transaction (updates organization balance)
- **Headers**: Authorization required (Admin role)
- **Response**:
  ```json
  {
    "transaction": {
      "id": 1,
      "organization_id": 1,
      "user_id": 2,
      "type": "income",
      "amount": "1000.00",
      "description": "Monthly revenue",
      "date": "2024-01-15",
      "status": "approved",
      "created_at": "2024-01-01T00:00:00.000Z",
      "approved_at": "2024-01-01T01:00:00.000Z",
      "approved_by": 1
    }
  }
  ```
- **Note**: Approving an income transaction adds to balance, approving an expense subtracts from balance

### Reject Transaction (Admin Only)
- **POST** `/transactions/reject/:transactionId`
- **Description**: Reject a pending transaction (does not update balance)
- **Headers**: Authorization required (Admin role)
- **Response**:
  ```json
  {
    "transaction": {
      "id": 1,
      "organization_id": 1,
      "user_id": 2,
      "type": "income",
      "amount": "1000.00",
      "description": "Monthly revenue",
      "date": "2024-01-15",
      "status": "rejected",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Health Check

### Health Check
- **GET** `/api/health`
- **Description**: Check if the API is running
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

