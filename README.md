# 🌐 Community Resource Board – Full-Stack MERN Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Frontend: Netlify](https://img.shields.io/badge/Frontend-Netlify-brightgreen)](https://community-resource-board.netlify.app)
[![Backend: Render](https://img.shields.io/badge/Backend-Render-blue)](https://community-resource-board-api.onrender.com)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-green)](https://www.mongodb.com/atlas)
[![GitHub Repo stars](https://img.shields.io/github/stars/vijayshikhare/community-resource-board?style=social)](https://github.com/vijayshikhare/community-resource-board)

Welcome to **Community Resource Board** – a comprehensive, full-stack MERN (MongoDB, Express, React, Node.js) application designed to empower communities by facilitating resource sharing, opportunity applications, and collaborative management. Whether you're a user seeking resources, an organizer posting opportunities, or an admin overseeing the platform, this app streamlines it all with secure authentication, role-based access, and intuitive workflows.

🚀 **Live Demo**:  
- **Frontend**: [https://community-resource-board.netlify.app](https://community-resource-board.netlify.app)  
- **Backend API**: [https://community-resource-board-api.onrender.com/health](https://community-resource-board-api.onrender.com/health)  

📱 **Demo Credentials** (for testing):  
- **Admin**: Email: `admin@example.com` | Password: `admin123` (register with invite code "ADMIN2024").  
- **Organizer**: Email: `organizer@example.com` | Password: `org123` (invite code "ORGANIZER2024").  
- **User**: Register freely with any email/password (default role: user).

---

## 👨‍💻 About the Project

Community Resource Board is a dynamic platform for community-driven resource discovery and management. Users can browse and apply for resources (e.g., jobs, events, learning materials), while organizers and admins create, review, and manage content. Built with security in mind (JWT auth, bcrypt hashing), it's scalable for real-world use.

**Key Goals**:
- Secure, role-based authentication (user/organizer/admin).
- Seamless resource creation, application submission, and status tracking.
- Responsive, user-friendly interface with error handling and loading states.
- Production-ready deployment on free tiers (Netlify, Render, MongoDB Atlas).

This project showcases full-stack development skills, from API design to UI/UX.

---

## ✨ Features

- **Authentication & Authorization**: JWT-based login/register with invite codes for roles. Auto-logout on token expiry.
- **Role-Based Dashboards**: 
  - **Users**: Browse resources, submit/withdraw applications.
  - **Organizers**: Create/edit resources, review applications.
  - **Admins**: Full access, including user/profile management.
- **Resource Management**: POST/GET/PUT/DELETE resources with validation (title, description, skills).
- **Application Workflow**: Submit applications, update status (pending/approved/rejected), track history.
- **Profile Features**: Update profile, change password, upload resume/image.
- **Responsive UI**: Mobile-first design with animations, loading spinners, and error toasts.
- **Security**: Password hashing, token protection, input validation, CORS.
- **Monitoring**: Health check endpoint (`/health`), detailed logging.

| Feature | User | Organizer | Admin |
|---------|------|-----------|-------|
| Register/Login | ✅ | ✅ | ✅ |
| Browse/Apply Resources | ✅ | ✅ | ✅ |
| Create/Edit Resources | ❌ | ✅ | ✅ |
| Submit/Withdraw Applications | ✅ | ❌ | ✅ |
| Review Applications | ❌ | ✅ | ✅ |
| Manage Profiles | ✅ (Own) | ✅ (Own) | ✅ (All) |

---

## 🛠️ Tech Stack

### Backend
- **Node.js & Express.js**: RESTful API server.
- **MongoDB & Mongoose**: Schema-based NoSQL database.
- **JWT (jsonwebtoken)**: Token-based authentication.
- **bcryptjs**: Secure password hashing.
- **CORS**: Cross-origin request handling.

### Frontend
- **React.js**: Component-based UI with hooks.
- **React Router**: Client-side routing.
- **Axios**: HTTP client with interceptors for auth/errors.
- **React Context**: Global state for auth/user.
- **Bootstrap/CSS**: Responsive styling and components.

### Deployment & Tools
- **Netlify**: Frontend static hosting with auto-deploys.
- **Render**: Backend serverless hosting (free tier).
- **MongoDB Atlas**: Cloud database (free M0 cluster).
- **GitHub Actions**: CI/CD pipeline.
- **dotenv**: Environment variable management.

---

## 📁 Project Structure

```
community-resource-board/
├── backend/                          # Node/Express backend
│   ├── src/
│   │   ├── controllers/              # Business logic (authController.js, userController.js)
│   │   ├── models/                   # DB schemas (User.js, Application.js, Resource.js)
│   │   ├── middlewares/              # Auth middleware (auth.js)
│   │   ├── routes/                   # API routes (auth.js, users.js, resources.js, applications.js)
│   │   └── server.js                 # Main server (CORS, DB connect, routes)
│   ├── .env                          # Env vars (MONGODB_URI, JWT_SECRET)
│   └── package.json                  # Backend deps
├── frontend/                         # React frontend
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── components/               # Reusable UI (Navbar.js, Footer.js, ProtectedRoute.js)
│   │   ├── context/                  # State management (AuthContext.js)
│   │   ├── pages/                    # Views (Home.js, Login.js, Register.js, Dashboard.js)
│   │   ├── services/                 # API client (api.js)
│   │   └── utils/                    # Helpers
│   ├── .env                          # REACT_APP_API_URL
│   └── package.json                  # Frontend deps
├── .gitignore                        # Ignore node_modules, .env
├── netlify.toml                      # Netlify build config (optional)
└── README.md                         # This file
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- Git
- MongoDB Atlas account (free cluster)

### Backend Setup
1. Clone repo:
   ```
   git clone https://github.com/vijayshikhare/community-resource-board.git
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create `.env`:
   ```
   MONGODB_URI=mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/communitydb?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=development
   PORT=5000
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ORGANIZER_INVITE_CODE=your-organizer-invite-code
   ADMIN_INVITE_CODE=your-admin-invite-code
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```
4. Start server:
   ```
   npm start
   ```
   - Expected: "🚀 Server running on port 5000" & "✅ MongoDB Connected Successfully".

### Frontend Setup
1. In project root:
   ```
   cd frontend
   npm install
   ```
2. Create `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
3. Start dev server:
   ```
   npm start
   ```
   - Opens `http://localhost:3000`.

### Local Testing
- Register: `/register` (use "ADMIN2024" invite for admin role).
- Login: `/login` → Redirect to dashboard.
- Create resource: Organizer dashboard.
- Health check: `http://localhost:5000/health`.

---

## 🌍 Deployment Guide

### Frontend (Netlify – Free Static Hosting)
1. Connect GitHub repo to [Netlify](https://netlify.com).
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
   - Env var: `REACT_APP_API_URL=https://community-resource-board-api.onrender.com/`
3. Deploy: Auto on Git push.

### Backend (Render – Free Node Hosting)
1. Connect GitHub repo to [Render](https://render.com) (root dir: `backend`).
2. Build command: `npm install`
3. Start command: `npm start`
4. Env vars: MONGODB_URI, JWT_SECRET, NODE_ENV=production.
5. Deploy: Auto on Git push.

### Database (MongoDB Atlas – Free Tier)
1. Create M0 cluster at [MongoDB Atlas](https://mongodb.com/atlas).
2. Network Access: Add 0.0.0.0/0 (whitelist all IPs).
3. Use connection string in MONGODB_URI.

**Live Links**:
- Frontend: [https://community-resource-board.netlify.app](https://community-resource-board.netlify.app)
- Backend: [https://community-resource-board-api.onrender.com/health](https://community-resource-board-api.onrender.com/health)

---

## 📖 API Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/auth/register` | Register user (invite code for role) | No | Public |
| POST | `/api/auth/login` | Login user | No | Public |
| GET | `/api/users/profile` | Get profile | Yes | All |
| PUT | `/api/users/profile` | Update profile | Yes | All |
| PUT | `/api/users/change-password` | Change password | Yes | All |
| DELETE | `/api/users/account` | Delete account | Yes | All |
| GET | `/api/resources` | Get resources | No | Public |
| POST | `/api/resources` | Create resource | Yes | Organizer/Admin |
| GET | `/api/applications/my` | Get my applications | Yes | User |
| POST | `/api/applications` | Submit application | Yes | User |
| GET | `/api/applications/organizer` | Get organizer applications | Yes | Organizer/Admin |
| PATCH | `/api/applications/:id/status` | Update application status | Yes | Organizer/Admin |

**Health**: GET `/health` (no auth).

---

## 📱 Usage Guide

1. **Registration**: `/register` → Fill form, optional invite code for role.
2. **Login**: `/login` → Credentials → Role-based dashboard.
3. **User Dashboard**: Browse resources, apply.
4. **Organizer Dashboard**: Create resources, review applications.
5. **Admin Dashboard**: Manage users/resources.

---

## 🤝 Contributing

1. Fork the repo.
2. Create branch: `git checkout -b feature/your-feature`.
3. Commit: `git commit -m "Add feature"`.
4. Push: `git push origin feature/your-feature`.
5. Pull Request to `main`.

**Guidelines**: ESLint, test changes, update README.

---

## 📄 License

MIT License – see [LICENSE](LICENSE).

---

## 📞 Contact

**Vijay Shikhare** – Full Stack Developer.

- Email: vijayshikhareteam@gmail.com
- LinkedIn: [linkedin.com/in/vijayshikhare](https://linkedin.com/in/vijayshikhare)
- GitHub: [github.com/vijayshikhare](https://github.com/vijayshikhare)

Issues? Open a GitHub issue.

---

## 🔑 SEO Keywords

`community resource board`, `MERN app`, `resource sharing platform`, `job application tracker`, `role-based dashboard`, `JWT auth MERN`, `MongoDB Express React Node`, `free deployment guide`, `Netlify Render tutorial`, `full stack community app`.

---

## 🌐 Popular Tags

`#MERNStack` `#FullStack` `#ReactJS` `#NodeJS` `#MongoDB` `#ExpressJS` `#JWTAuth` `#Netlify` `#Render` `#CommunityApp` `#ResourcePlatform` `#ApplicationSystem`

---

✨ *Built with passion – star the repo if useful!* **Vijay Shikhare**

