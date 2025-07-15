# QuickArt Backend API

This is the Next.js backend API for the QuickArt e-commerce application. It provides authentication and user management functionality.

## Features

- ✅ JWT Authentication with HTTP-only cookies
- ✅ Password hashing with bcryptjs
- ✅ User registration and login
- ✅ Role-based access control (user/admin)
- ✅ Protected admin routes
- ✅ Beautiful Tailwind CSS styling
- ✅ Mock database (in-memory)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Backend API: http://localhost:3000
   - Login page: http://localhost:3000/login
   - Signup page: http://localhost:3000/signup

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/me` - Get current user info
- `POST /api/logout` - Logout user

### Admin
- `GET /api/admin` - Admin-only protected route

## Test Users

### Admin User
- Email: `admin@example.com`
- Password: `adminpass`
- Role: `admin`

### Create New Users
- Use the signup page to create new user accounts
- All new users get the `user` role by default

## Frontend Integration

Your React frontend is now connected to this backend:

1. **AuthContext** - Updated to use the Next.js API
2. **Signin/Signup pages** - Connected to backend authentication
3. **Navbar** - Shows user status and logout functionality

## How It Works

1. **Registration:** Users sign up → password is hashed → JWT token created → stored in HTTP-only cookie
2. **Login:** Users sign in → password verified → JWT token created → stored in HTTP-only cookie
3. **Authentication:** JWT token is automatically sent with requests via cookies
4. **Role-based Access:** Admin routes check for admin role in JWT token
5. **Logout:** JWT cookie is cleared

## Security Features

- ✅ HTTP-only cookies (prevents XSS)
- ✅ Password hashing with bcryptjs
- ✅ JWT token expiration (1 day)
- ✅ Role-based authorization
- ✅ SameSite cookie policy

## Development

- **Mock Database:** Uses in-memory array (resets on server restart)
- **JWT Secret:** Hardcoded for demo (use environment variables in production)
- **CORS:** Configured for localhost:3000 (React frontend)

## Production Considerations

1. Use environment variables for JWT secret
2. Implement a real database (PostgreSQL, MongoDB, etc.)
3. Add rate limiting
4. Add input validation
5. Use HTTPS in production
6. Implement refresh tokens
