# API Documentation

Base URL (Production): https://community-resource-board-api.onrender.com

## Authentication

Most protected endpoints require:
- Header: Authorization: Bearer <jwt_token>

## Health

- GET /health
  - Returns server status

## Auth

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

## Users

- GET /api/users/profile
- PUT /api/users/profile
- PUT /api/users/profile/photo
- PUT /api/users/change-password
- DELETE /api/users/account

### Admin-only

- GET /api/users/admin/stats
- GET /api/users/admin/users
- PATCH /api/users/admin/users/:id/role
- PATCH /api/users/admin/users/:id/status
- POST /api/users/admin/create-admin

## Resources

- GET /api/resources
- GET /api/resources/:id
- POST /api/resources
- PUT /api/resources/:id
- DELETE /api/resources/:id

## Applications

- POST /api/applications
- GET /api/applications/my
- GET /api/applications/organizer
- PATCH /api/applications/:id/status

## Common Status Codes

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error
