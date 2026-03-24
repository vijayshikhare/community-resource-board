import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; // ✅ Import your global styles

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Organizer from './pages/Organizer';
import AdminConsole from './pages/AdminConsole';
import ResourcePolicyEnforcement from './pages/ResourcePolicyEnforcement';
import CreateResource from './pages/CreateResource';
import EditResource from './pages/EditResource';
import ResourceDetail from './pages/ResourceDetail';
import ApplicationsReview from './pages/ApplicationsReview';
import AllApplications from './pages/AllApplications';
import ApplicationForm from './pages/ApplicationForm';
import SearchResources from './pages/SearchResources'; // ✅ Changed to pages folder
import Profile from './pages/Profile';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <div className="app">
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User Dashboard - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Search/Browse Resources - Protected */}
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchResources />
            </ProtectedRoute>
          }
        />

        {/* Resource Detail - Protected */}
        <Route
          path="/resource/:id"
          element={
            <ProtectedRoute>
              <ResourceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resource/:id/apply"
          element={
            <ProtectedRoute>
              <ApplicationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/:id"
          element={
            <ProtectedRoute>
              <ResourceDetail />
            </ProtectedRoute>
          }
        />

        {/* Organizer/Admin Routes */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <Organizer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminConsole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/policy-enforcement"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ResourcePolicyEnforcement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-resource"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <CreateResource />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-resource/:id"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EditResource />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/review"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <ApplicationsReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <AllApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resource/:id/applications"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <ApplicationsReview />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;