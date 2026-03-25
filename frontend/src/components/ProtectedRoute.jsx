import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = [], allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const rolesList = requiredRoles.length > 0 ? requiredRoles : allowedRoles;

  // Loading spinner
  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '80vh', flexDirection: 'column', gap: '1.5rem',
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', padding: '2rem'
      }}>
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          <div style={{
            position: 'absolute', width: '80px', height: '80px',
            border: '6px solid #e5e7eb', borderTopColor: '#16a34a',
            borderRadius: '50%', animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', fontSize: '2rem'
          }}>🔐</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#111827', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Verifying Access</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Please wait while we check your credentials...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: 'Please log in to access this page' }}
      />
    );
  }

  // Role-based access
  const roleDenied =
    (requiredRole && user.role !== requiredRole && user.role !== 'admin') ||
    (rolesList.length > 0 && !rolesList.includes(user.role) && user.role !== 'admin');

  if (roleDenied) {
    const rolesText = requiredRole ? requiredRole : rolesList.join(', ');
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center'
      }}>
        <div style={{
          width: '120px', height: '120px',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '4rem', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)'
        }}>🚫</div>
        <div>
          <h2 style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px' }}>
            You don't have the required permissions to access this page. Required role(s): <strong style={{ color: '#ef4444' }}>{rolesText}</strong>
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 163, 74, 0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)'; }}
        >← Go Back</button>
      </div>
    );
  }

  // Deactivated account
  if (user.isActive === false) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center'
      }}>
        <div style={{
          width: '120px', height: '120px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '4rem', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.2)'
        }}>⚠️</div>
        <div>
          <h2 style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Account Deactivated</h2>
          <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px' }}>
            Your account has been deactivated. Please contact support for assistance.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 163, 74, 0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)'; }}
        >Go to Home</button>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;
