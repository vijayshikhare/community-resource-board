# Development Setup

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account

## Install

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## Environment Files

Backend: copy backend/.env.example to backend/.env
Frontend: copy frontend/.env.example to frontend/.env

## Run Locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

## Useful Commands

Backend:
- npm run dev
- npm start
- node --check src/routes/auth.js

Frontend:
- npm start
- npm run build
- npm test

## Debugging Tips

- Check browser console and network tab for API errors
- Verify token exists for protected routes
- Confirm CORS_ORIGINS and FRONTEND_URL are correct
- Confirm REACT_APP_API_URL points to backend origin only
