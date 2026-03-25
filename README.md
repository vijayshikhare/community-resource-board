# Community Resource Board

A production-ready MERN platform to publish community opportunities, accept applications, and manage workflows across user, organizer, and admin roles.

[Live Frontend](https://communityresourceboard.netlify.app) | [API Health](https://community-resource-board-api.onrender.com/health) | [Repository](https://github.com/vijayshikhare/community-resource-board)

## Why This Project
Community Resource Board helps teams launch a practical resource marketplace quickly:
- Users can discover and apply to resources.
- Organizers can publish resources and review applications.
- Admins can enforce platform policy and manage accounts.
- The stack is deployable on free tiers (Netlify + Render + MongoDB Atlas).

## Key Features
- Secure authentication with JWT and role-based access control.
- Real-time style refresh loops for dashboards and review pages.
- Resource lifecycle management (create, edit, active/draft control).
- Application status workflow (pending, reviewed, accepted, rejected).
- Profile management with database-backed avatar storage.
- Production-safe CORS, rate-limiting, and health endpoints.

## Architecture
- Frontend: React, React Router, Context API, Axios.
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs.
- Database: MongoDB Atlas.
- Hosting: Netlify (frontend), Render (backend).

## Tech Stack
- React 18
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Axios

## Monorepo Structure
```text
community-resource-board/
  backend/
    src/
      controllers/
      middlewares/
      models/
      routes/
      utils/
      server.js
  frontend/
    src/
      components/
      context/
      pages/
      services/
      utils/
  README.md
```

## Quick Start (Local)
### 1. Clone
```bash
git clone https://github.com/vijayshikhare/community-resource-board.git
cd community-resource-board
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create backend .env:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

CORS_ORIGINS=http://localhost:3000,http://localhost:5173
FRONTEND_URL=http://localhost:3000
NETLIFY_SITE_NAME=communityresourceboard

ORGANIZER_INVITE_CODE=ORGANIZER2024
ADMIN_INVITE_CODE=ADMIN2024

EMAIL_SERVICE=gmail
EMAIL_FROM=
EMAIL_USER=
EMAIL_PASS=
GOOGLE_CLIENT_ID=
```

Run backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create frontend .env:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=
```

Run frontend:
```bash
npm start
```

Frontend runs at http://localhost:3000

## Production URLs
- Frontend: https://communityresourceboard.netlify.app
- Backend: https://community-resource-board-api.onrender.com
- Health: https://community-resource-board-api.onrender.com/health

## Deployment Guide
### Netlify (Frontend)
- Base directory: frontend
- Build command: npm run build
- Publish directory: build
- Environment variable:
  - REACT_APP_API_URL=https://community-resource-board-api.onrender.com

### Render (Backend)
- Root directory: backend
- Build command: npm install
- Start command: npm start
- Required environment variables:
  - MONGODB_URI
  - JWT_SECRET
  - NODE_ENV=production
  - FRONTEND_URL=https://communityresourceboard.netlify.app
  - NETLIFY_SITE_NAME=communityresourceboard

## Core API Routes
- POST /api/auth/register
- POST /api/auth/login
- GET /api/users/profile
- PUT /api/users/profile
- PUT /api/users/profile/photo
- PUT /api/users/change-password
- GET /api/resources
- POST /api/resources
- GET /api/applications/my
- GET /api/applications/organizer
- PATCH /api/applications/:id/status
- GET /health

## Role Matrix
- User: browse/apply resources, manage own profile.
- Organizer: all user actions + create resources + review applications.
- Admin: all organizer actions + policy and user management.

## Troubleshooting
- CORS error in browser:
  - Check FRONTEND_URL and NETLIFY_SITE_NAME in backend env.
  - Confirm frontend domain is https://communityresourceboard.netlify.app.
- 401 Unauthorized:
  - Ensure token exists in localStorage and is not expired.
- Avatar upload fails:
  - Use JPG/PNG/WEBP and keep file size practical.
  - Verify backend is running with JSON body limits enabled.
- Empty dashboard stats:
  - Confirm API URL is backend root (no /api suffix).

## Scripts
### Backend
- npm run dev
- npm start

### Frontend
- npm start
- npm run build
- npm test

## Startup Roadmap
- Add email notifications for application status updates.
- Add analytics dashboard (resource conversion funnel).
- Add audit logs for admin actions.
- Add e2e tests and CI quality gates.
- Add image optimization pipeline for profile photos.

## Contributing
1. Fork the repository.
2. Create a branch.
3. Make changes with clear commits.
4. Open a pull request.

## Contact
- GitHub: https://github.com/vijayshikhare
- LinkedIn: https://linkedin.com/in/vijayshikhare

Built for practical community impact with a deployment-first mindset.
