# 🌱 Community Resource Board

[![GitHub stars](https://img.shields.io/github/stars/vijayshikhare/community-resource-board?style=social)](https://github.com/vijayshikhare/community-resource-board/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/vijayshikhare/community-resource-board?style=social)](https://github.com/vijayshikhare/community-resource-board/network)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-atlas-green.svg)](https://www.mongodb.com/)
[![Deploy Status](https://img.shields.io/badge/frontend-deployed%20on%20netlify-blue)](https://communityresourceboard.netlify.app)
[![Backend Status](https://img.shields.io/badge/backend-deployed%20on%20render-blue)](https://community-resource-board-api.onrender.com)

> **A production-ready MERN full-stack platform for publishing community resources, managing applications, and coordinating workflows with role-based access control.**

Empower communities with a platform that connects those seeking resources with those offering them. Perfect for nonprofits, educational institutions, local organizations, and community centers.

**[🚀 Live Demo](https://communityresourceboard.netlify.app)** • **[📚 Full Docs](docs/)** • **[🐛 Report Bug](https://github.com/vijayshikhare/community-resource-board/issues)** • **[✨ Request Feature](https://github.com/vijayshikhare/community-resource-board/issues)**

## 📚 Table of Contents

- [Problem & Solution](#-problem--solution)
- [Key Features](#-key-features)
- [Why Star This Repo](#-why-star-this-repo)
- [Support and Follow](#-support-and-follow)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Production Deployment](#-production-deployment)
- [Core API Routes](#core-api-routes)
- [Role Matrix](#role-matrix)
- [GitHub About Setup](#-github-about-setup)
- [Releases](#-releases)
- [Packages](#-packages)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🔎 Keywords

community resource board, mern stack project, react express mongodb app, role based access control, jwt authentication, full stack open source project, netlify render deployment, community platform, volunteer opportunity platform, resource management system

## 🌟 Why Star This Repo

If this project helps you learn or ship faster, starring it helps more developers discover practical open-source MERN projects.

- ✅ Real production deployment (Netlify + Render + MongoDB Atlas)
- ✅ Portfolio-grade architecture (Auth, RBAC, CRUD, dashboards)
- ✅ Security-focused implementation (JWT, role checks, admin controls)
- ✅ Beginner-to-advanced learning path in one codebase
- ✅ Active maintenance and documentation updates

## ❤️ Support and Follow

### Help this project grow

1. ⭐ Star this repository: https://github.com/vijayshikhare/community-resource-board
2. 👤 Follow the maintainer: https://github.com/vijayshikhare
3. 🍴 Fork and build your version
4. 🐛 Open quality issues and feature ideas
5. 🔁 Share with your dev network (LinkedIn, X, Discord, Reddit)

### Share post template

```text
Built with this open-source MERN platform:
Community Resource Board

Live demo: https://communityresourceboard.netlify.app
Code: https://github.com/vijayshikhare/community-resource-board

Great reference for JWT auth, RBAC, dashboard flows, and deployment.
If useful, give it a star ⭐
```

## 🎯 Problem & Solution

**The Problem:** Communities struggle to efficiently share resources, coordinate opportunities, and manage applications. Traditional solutions are expensive, complex to deploy, or require significant technical expertise.

**The Solution:** Community Resource Board provides an affordable, easy-to-deploy platform that works out of the box. Deploy on free tiers (Netlify + Render + MongoDB Atlas) and start serving your community within minutes.

## ✨ Key Features

- **👥 Role-Based Access Control** - Three role levels (User, Organizer, Admin) with granular permissions
- **🔐 Secure Authentication** - JWT tokens, bcryptjs hashing, Google OAuth 2.0, password reset flows
- **📋 Resource Lifecycle** - Create, edit, publish, and manage resources with draft/active states
- **📝 Application Management** - Workflow-based application tracking (Pending → Reviewed → Accepted/Rejected)
- **👤 Profile Management** - User profiles with database-backed avatar storage
- **⚡ Real-Time Dashboards** - Live stat refreshes for applications and resources
- **🌐 Fully Responsive Design** - Desktop, tablet, and mobile-friendly interface
- **📱 Production-Grade Security** - CORS protection, rate limiting, input validation, helmet headers
- **🚀 One-Click Deployment** - Pre-configured for Netlify & Render with free tier support
- **🔍 Full-Text Search** - Find resources by title, description, and category
- **📊 Admin Analytics** - Track user engagement, resource performance, and application metrics
- **♿ Accessibility-First** - WCAG-compliant components and keyboard navigation

## 📊 Why Developers Love This Project

- **Production-Ready:** Not a tutorial project—used and tested in real environments
- **Full-Stack Practice:** Complete MERN stack for portfolio building
- **Best Practices:** Security, performance optimization, code structure, and deployment strategies
- **Free to Deploy:** Zero infrastructure costs with generous free tiers
- **Well-Documented:** Comprehensive README, setup guides, and code comments
- **Active Development:** Regular updates and security patches

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                       │
│    Hosted on Netlify (communityresourceboard.netlify.app)   │
│    ├── Components (Header, Navbar, Footer, Cards)           │
│    ├── Pages (Home, Dashboard, Resources, Applications)     │
│    ├── Context API (Authentication & State)                 │
│    └── Axios (HTTP Client with Auth Interceptors)           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    (REST API calls)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│    Hosted on Render (community-resource-board-api...)       │
│    ├── Routes (Auth, Resources, Applications, Users)        │
│    ├── Controllers (Business Logic)                         │
│    ├── Middleware (JWT Auth, Role Check, Error Handler)     │
│    ├── Models (User, Resource, Application)                 │
│    └── Utils (Token, Validators)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                   (Mongoose queries)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│            Database (MongoDB Atlas M0)                       │
│    Cloud-hosted, free tier, secure connection               │
│    ├── Users (Email, Role, Profile, Avatar)                 │
│    ├── Resources (Title, Desc, Category, Status)            │
│    └── Applications (Status, User, Resource, Timestamp)     │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 18.x |
| **React Router** | Client-side Navigation | 6.x |
| **Axios** | HTTP Client | Latest |
| **Context API** | State Management | Built-in |
| **CSS3** | Styling | Modern |
| **Google OAuth** | Social Authentication | 2.0 |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime Environment | 18+ LTS |
| **Express.js** | API Framework | 4.x |
| **MongoDB/Mongoose** | Database & ODM | M0 Atlas |
| **JWT (jsonwebtoken)** | Token Authentication | Latest |
| **bcryptjs** | Password Hashing | Latest |
| **Helmet** | Security Headers | Latest |
| **Express Rate Limit** | DDoS Protection | Latest |

### DevOps & Deployment
| Platform | Purpose | Tier |
|----------|---------|------|
| **Netlify** | Frontend Hosting | Free |
| **Render** | Backend Hosting | Free |
| **MongoDB Atlas** | Database Hosting | M0 (Free) |
| **GitHub** | Version Control | Free |

## 📁 Project Structure

```
community-resource-board/
├── README.md                           # You are here
├── CONTRIBUTING.md                     # Contribution guidelines
├── CODE_OF_CONDUCT.md                  # Community standards
├── LICENSE                             # MIT License
├── SECURITY.md                         # Security policy
├── CHANGELOG.md                        # Release notes
│
├── docs/                               # Documentation
│   ├── API.md                          # API reference
│   ├── DEPLOYMENT.md                   # Deployment guides
│   ├── DEVELOPMENT.md                  # Development setup
│   └── ARCHITECTURE.md                 # System architecture
│
├── frontend/                           # React Application
│   ├── public/
│   │   ├── index.html
│   │   └── _redirects                  # Netlify routing
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ResourceCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminConsole.jsx
│   │   │   └── [More pages...]
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Global Auth State
│   │   ├── services/
│   │   │   └── api.js                  # Axios instance
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── App.css
│   ├── package.json
│   └── .env.example
│
└── backend/                            # Express Server
    ├── src/
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── userController.js
    │   │   ├── resourceController.js
    │   │   └── applicationController.js
    │   ├── middlewares/
    │   │   ├── auth.js                 # JWT verification
    │   │   ├── roleMiddleware.js       # Role-based access
    │   │   └── errorHandler.js
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── Resource.js
    │   │   └── Application.js
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── users.js
    │   │   ├── resources.js
    │   │   └── applications.js
    │   ├── utils/
    │   │   └── token.js
    │   ├── server.js
    │   └── seed.js
    ├── package.json
    ├── .env.example
    └── dropUsernameIndex.js            # DB maintenance
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas Account** (Free M0 cluster, [Setup Guide](https://www.mongodb.com/cloud/atlas/register))
- **Git** ([Download](https://git-scm.com/))
- **Google OAuth Credentials** (Optional, for social login)

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/vijayshikhare/community-resource-board.git
cd community-resource-board

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# MONGODB_URI=your_mongodb_atlas_connection_string
# JWT_SECRET=your_secret_key_here
# GOOGLE_CLIENT_ID=your_google_client_id
```

**Full Backend .env Template:**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRES_IN=30d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
FRONTEND_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Invite Codes (for role assignment)
ORGANIZER_INVITE_CODE=ORGANIZER2024
# Note: ADMIN_INVITE_CODE no longer used in public registration
# Admin accounts created via secret backend endpoint only

# Email (Optional - for password reset)
EMAIL_SERVICE=gmail
EMAIL_FROM=your_email@gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Deployment
NETLIFY_SITE_NAME=communityresourceboard
```

**Run Backend:**
```bash
npm run dev
# Backend starts at http://localhost:5000
```

### 3️⃣ Frontend Setup

```bash
cd frontend

# Create .env file
cp .env.example .env

# Edit .env:
# REACT_APP_API_URL=http://localhost:5000
# REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

**Full Frontend .env Template:**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**Run Frontend:**
```bash
npm start
# Frontend opens at http://localhost:3000
```

### 4️⃣ Access the Application

| Role | Email | Login | Features |
|------|-------|-------|----------|
| **User** | user@example.com | Use your email | Browse & apply for resources |
| **Organizer** | organizer@example.com | Use invite code `ORGANIZER2024` | Create & manage resources |
| **Admin** | Contact backend admin | Secret endpoint | Manage users & enforce policies |

> 💡 **Tip:** Use the seed script to populate test data:
> ```bash
> cd backend && npm run seed
> ```

---

## 🌐 Production Deployment

### Live URLs
- **Frontend Live:** https://communityresourceboard.netlify.app
- **Backend Live:** https://community-resource-board-api.onrender.com
- **API Health Check:** https://community-resource-board-api.onrender.com/health

### Deployment Platforms
Our platform is deployed on industry-standard free tiers:
- **Frontend:** Netlify (Auto-deploy from GitHub)
- **Backend:** Render (Auto-deploy from GitHub)
- **Database:** MongoDB Atlas (M0 Free Cloud Instance)

### Netlify (Frontend)

**Deployment Steps:**
1. Go to [Netlify](https://app.netlify.com) and sign in with GitHub
2. Click "New site from Git" and select this repository
3. Set build settings:
  - **Base directory:** `frontend`
  - **Build command:** `npm run build`
  - **Publish directory:** `build`
4. Add environment variables:
  ```
  REACT_APP_API_URL=https://community-resource-board-api.onrender.com
  REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
  ```
5. Click "Deploy"

**Details:**
- Automatic redeploy on GitHub commits
- Free SSL certificate included
- CDN for fast global delivery

### Render (Backend)

**Deployment Steps:**
1. Go to [Render](https://dashboard.render.com) and sign up
2. Click "New+" → "Web Service"
3. Connect your GitHub repository
4. Set deployment settings:
  - **Name:** `community-resource-board-api`
  - **Root directory:** `backend`
  - **Build command:** `npm install`
  - **Start command:** `npm start`
5. Add environment variables:
  ```
  MONGODB_URI=your_mongodb_atlas_uri
  JWT_SECRET=your_jwt_secret_key
  NODE_ENV=production
  FRONTEND_URL=https://communityresourceboard.netlify.app
  CORS_ORIGINS=https://communityresourceboard.netlify.app
  GOOGLE_CLIENT_ID=your_google_client_id
  ORGANIZER_INVITE_CODE=ORGANIZER2024
  EMAIL_SERVICE=gmail
  EMAIL_FROM=your_email@gmail.com
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_app_password
  NETLIFY_SITE_NAME=communityresourceboard
  ```
6. Click "Create Web Service"

**Details:**
- Automatic redeploy on GitHub commits
- Free tier includes 750 hours/month
- Health checks to ensure uptime

### MongoDB Atlas

**Setup Steps:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create an M0 cluster (free)
4. Add a database user (username/password)
5. Whitelist your IP address
6. Click "Connect" and copy connection string
7. Replace placeholders in connection string and add to backend .env

**Connection String Format:**
```
mongodb+srv://username:password@clustername.mongodb.net/dbname?retryWrites=true&w=majority
```

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

## 📌 GitHub About Setup

To avoid "No description, website, or topics provided", configure these in GitHub repo settings:

- Description:
  - Production-ready MERN community platform with JWT auth, RBAC, resource workflows, and free-tier deployment support.
- Website:
  - https://communityresourceboard.netlify.app
- Topics:
  - community-resource-board, mern, react, nodejs, express, mongodb, jwt, rbac, fullstack, open-source, netlify, render

Ready copy/paste file:
- See `docs/GITHUB_ABOUT_SETUP.md`

## 🚀 Releases

No releases yet? Publish your first one from GitHub:

1. Open repository "Releases".
2. Click "Draft a new release".
3. Tag version: `v1.1.0`
4. Title: `v1.1.0 - Security and Growth Upgrade`
5. Paste notes from `docs/RELEASE_v1.1.0.md`
6. Publish release.

This improves trust, changelog visibility, and star conversion.

## 📦 Packages

This repository is an application (not an npm library), so package publishing is optional.

Best options:
- Keep "No packages published" (totally fine for app repos).
- Or publish Docker images later via GitHub Container Registry for backend/frontend deployment artifacts.

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
