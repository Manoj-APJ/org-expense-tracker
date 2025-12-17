# Quick Setup Guide

## Step-by-Step Setup

### 1. Install PostgreSQL
Make sure PostgreSQL is installed and running on your system.

### 2. Create Database
```sql
CREATE DATABASE org_expense_tracker;
```

### 3. Backend Setup

```bash
# Install backend dependencies
npm install

# Create .env file (copy from .env.example or create manually)
# Set your database credentials and JWT secret

# Initialize database
npm run init-db

# Start backend server
npm start
# or for development
npm run dev
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start frontend development server
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 6. Default Admin Login

- Email: `admin@example.com`
- Password: `admin123`

## Environment Variables

Create a `.env` file in the root directory with:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=org_expense_tracker
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-secret-key-change-this-in-production
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `org_expense_tracker` exists

### Port Already in Use
- Change `PORT` in `.env` for backend
- Frontend uses port 3000 by default (change in `frontend/package.json` if needed)

### Module Not Found Errors
- Run `npm install` in both root and `frontend` directories
- Delete `node_modules` and reinstall if issues persist

