# Organization Income & Expense Tracking System

A full-stack application for tracking organizational income and expenses with role-based access control.

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- RESTful APIs

### Frontend
- React.js
- React Router
- Basic CSS (no heavy UI libraries)

## Features

### Roles
- **Admin**: Manages organization memberships, approves/rejects transactions, sets organization balances
- **User**: Creates/joins organizations, submits transactions, views own transactions

### Core Functionality
- User authentication (register/login)
- Organization management (create/join with approval workflow)
- Transaction submission (income/expense)
- Admin approval system for memberships and transactions
- Organization balance tracking

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=org_expense_tracker
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-this-in-production
```

3. Initialize the database:
```bash
npm run init-db
```

This will:
- Create all necessary tables
- Set up indexes
- Create a default admin user:
  - Email: `admin@example.com`
  - Password: `admin123`

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Database Schema

### Tables

1. **users**
   - id (SERIAL PRIMARY KEY)
   - email (VARCHAR, UNIQUE)
   - password_hash (VARCHAR)
   - name (VARCHAR)
   - role (VARCHAR) - 'admin' or 'user'
   - created_at (TIMESTAMP)

2. **organizations**
   - id (SERIAL PRIMARY KEY)
   - name (VARCHAR)
   - balance (DECIMAL)
   - created_by (INTEGER, REFERENCES users)
   - created_at (TIMESTAMP)

3. **organization_members**
   - id (SERIAL PRIMARY KEY)
   - organization_id (INTEGER, REFERENCES organizations)
   - user_id (INTEGER, REFERENCES users)
   - status (VARCHAR) - 'pending', 'approved', 'rejected'
   - requested_at (TIMESTAMP)
   - approved_at (TIMESTAMP)
   - UNIQUE(organization_id, user_id)

4. **transactions**
   - id (SERIAL PRIMARY KEY)
   - organization_id (INTEGER, REFERENCES organizations)
   - user_id (INTEGER, REFERENCES users)
   - type (VARCHAR) - 'income' or 'expense'
   - amount (DECIMAL)
   - description (VARCHAR)
   - date (DATE)
   - status (VARCHAR) - 'pending', 'approved', 'rejected'
   - created_at (TIMESTAMP)
   - approved_at (TIMESTAMP)
   - approved_by (INTEGER, REFERENCES users)

## Usage

### Default Admin Account
- Email: `admin@example.com`
- Password: `admin123`

### User Workflow

1. **Register/Login**: Create an account or login with existing credentials
2. **Create or Join Organization**: 
   - Create a new organization (automatically approved)
   - Or request to join an existing organization (requires admin approval)
3. **Submit Transactions**: Once approved as a member, submit income or expense transactions
4. **View Transactions**: See all your submitted transactions and their approval status

### Admin Workflow

1. **Login**: Use admin credentials to access admin dashboard
2. **Manage Memberships**: Approve or reject organization membership requests
3. **Manage Transactions**: Approve or reject pending transactions (updates organization balance)
4. **Set Balance**: Manually set organization balance if needed

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoint documentation.

## Project Structure

```
OrgExpenseTracker/
├── config/
│   └── database.js          # Database connection configuration
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── organizations.js     # Organization management routes
│   └── transactions.js      # Transaction management routes
├── scripts/
│   └── init-db.js          # Database initialization script
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/          # React page components
│   │   ├── services/       # API service functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json
├── server.js                # Express server entry point
├── package.json
└── README.md
```

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Role-based access control on backend routes
- SQL injection protection via parameterized queries
- CORS enabled for frontend-backend communication

## Development Notes

- The frontend proxy is configured to forward requests to `http://localhost:5000`
- JWT tokens are stored in localStorage
- All API endpoints require authentication except `/api/auth/register` and `/api/auth/login`
- Admin routes require the `requireAdmin` middleware

## License

ISC

