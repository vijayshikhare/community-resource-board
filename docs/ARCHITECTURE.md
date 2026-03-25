# Architecture

Community Resource Board uses a classic MERN architecture.

## Layers

1. Frontend (React)
- Page routing and protected routes
- Auth state managed with Context API
- API calls through centralized service

2. Backend (Node.js/Express)
- REST routes for auth, users, resources, applications
- Middleware for auth, role checks, and error handling
- Controllers for business logic

3. Database (MongoDB)
- User, Resource, and Application models
- Mongoose ODM and schema validation

## Security Model

- JWT authentication for protected routes
- Role-based access control: user, organizer, admin
- Public registration cannot create admin accounts
- Admin account creation is backend-only and admin-gated

## Deployment Topology

- Frontend hosted on Netlify
- Backend hosted on Render
- MongoDB Atlas as managed database

## Data Flow

1. User action in frontend
2. Axios request to backend API
3. Backend validates auth and role
4. Controller performs DB operations
5. Response returned and UI updates
