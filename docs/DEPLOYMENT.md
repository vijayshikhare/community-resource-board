# Deployment Guide

## Frontend (Netlify)

Settings:
- Base directory: frontend
- Build command: npm run build
- Publish directory: build

Environment variables:
- REACT_APP_API_URL=https://community-resource-board-api.onrender.com
- REACT_APP_GOOGLE_CLIENT_ID=<your_google_client_id>

## Backend (Render)

Settings:
- Root directory: backend
- Build command: npm install
- Start command: npm start

Environment variables:
- NODE_ENV=production
- MONGODB_URI=<mongodb_atlas_uri>
- JWT_SECRET=<secure_random_secret>
- JWT_EXPIRES_IN=30d
- FRONTEND_URL=https://communityresourceboard.netlify.app
- CORS_ORIGINS=https://communityresourceboard.netlify.app
- ORGANIZER_INVITE_CODE=<organizer_code>
- GOOGLE_CLIENT_ID=<your_google_client_id>

Optional email variables:
- EMAIL_SERVICE
- EMAIL_FROM
- EMAIL_USER
- EMAIL_PASS

## Database (MongoDB Atlas)

- Create M0 cluster
- Create DB user
- Add network access rules
- Copy connection string into MONGODB_URI

## Post-deploy Checks

- GET /health returns 200
- Register/login works
- Resource CRUD works for organizer
- Admin dashboard loads for admin role
