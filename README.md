# Drone Management System - Authentication Service

## Overview
This service handles all authentication and authorization for the Drone Management System. It provides secure user authentication, role-based access control (RBAC), and OAuth integration with popular providers.

## Features
- 🔐 User Authentication
  - Email/Password login
  - Multi-Factor Authentication (MFA)
  - OAuth 2.0 Integration (Google, GitHub)
  - JWT-based token management
  - Password recovery and reset

- 👥 User Management
  - User registration and profile management
  - Role-based access control
  - User permissions management
  - Account verification

- 🔑 Security Features
  - Password hashing with bcrypt
  - Rate limiting
  - Session management
  - Secure token handling

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Redis (for session management)
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aman-kano/auth.git
cd auth
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the service:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

All API endpoints are versioned with the prefix `/api/v1/`. Here are the available endpoints:

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### OAuth Endpoints
- `GET /api/v1/auth/oauth/google` - Google OAuth login
- `GET /api/v1/auth/oauth/github` - GitHub OAuth login
- `GET /api/v1/auth/oauth/callback` - OAuth callback handler

### User Management Endpoints
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `GET /api/v1/users` - List users (admin only)
- `GET /api/v1/users/:id` - Get user by ID (admin only)
- `PUT /api/v1/users/:id` - Update user (admin only)
- `DELETE /api/v1/users/:id` - Delete user (admin only)

### API Versioning Policy
- Current version: v1
- Version format: `/api/v{version}/`
- Breaking changes will be released in new versions
- Previous versions will be maintained for at least 6 months after a new version is released

## Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/drone_auth"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email"
SMTP_PASS="your-password"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## Development

### Running Tests
```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Style
```bash
# Format code
npm run format

# Lint code
npm run lint
```

## Contributing
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support
For support, please contact the development team or create an issue in the repository. 