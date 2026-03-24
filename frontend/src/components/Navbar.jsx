import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const accountLinks = useMemo(() => {
    if (!user) return [];

    if (user.role === 'user') {
      return [
        { to: '/profile', label: 'Edit Profile' },
        { to: '/dashboard', label: 'My Dashboard' },
        { to: '/search', label: 'Find Resources' },
      ];
    }

    if (user.role === 'organizer') {
      return [
        { to: '/profile', label: 'Edit Profile' },
        { to: '/organizer', label: 'Organizer Dashboard' },
        { to: '/create-resource', label: 'Create Resource' },
        { to: '/applications/review', label: 'Review Applications' },
      ];
    }

    if (user.role === 'admin') {
      return [
        { to: '/profile', label: 'Edit Profile' },
        { to: '/admin', label: 'Admin Console' },
        { to: '/admin/policy-enforcement', label: 'Policy' },
        { to: '/create-resource', label: 'Create Resource' },
        { to: '/applications/review', label: 'Manage Applications' },
      ];
    }

    return [];
  }, [user]);

  const links = useMemo(() => {
    const items = [{ to: '/', label: 'Home' }];

    if (user) {
      items.push({ to: '/search', label: 'Resources' });
      if (user.role === 'user') {
        items.push({ to: '/dashboard', label: 'Dashboard' });
      }
      if (['organizer', 'admin'].includes(user.role)) {
        items.push({ to: user.role === 'admin' ? '/admin' : '/organizer', label: user.role === 'admin' ? 'Admin' : 'Organizer' });
      }
    }

    return items;
  }, [user]);

  const profileImageUrl = useMemo(() => {
    if (!user?.profileImage) return '';
    if (user.profileImage.startsWith('http')) return user.profileImage;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBase}${user.profileImage}`;
  }, [user?.profileImage]);

  return (
    <nav className={`top-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-shell">
        <NavLink to="/" className="brand" aria-label="Community Resource Board Home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" className="brand-mark-svg" role="img" aria-label="CRB logo mark">
              <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#brandGradient)" />
              <path d="M15 18h8a4 4 0 0 1 0 8h-8z" fill="#ffffff" opacity="0.92" />
              <path d="M25 18h6a4 4 0 0 1 0 8h-6z" fill="#ffffff" opacity="0.75" />
              <path d="M15 30h16" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="brandGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0ea5a4" />
                  <stop offset="1" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="brand-copy">
            <span className="brand-text">Community Resource Board</span>
            <span className="brand-subtext">Career Resource Hub</span>
          </span>
        </NavLink>

        <div className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="nav-actions">
            {user ? (
              <div className="account-menu" ref={accountMenuRef}>
                <button
                  className="account-trigger"
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-expanded={accountOpen}
                  aria-label="Open account menu"
                >
                  <span className="account-avatar" style={{ overflow: 'hidden' }}>
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      (user.name || user.username || 'U').charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="account-meta">
                    <span className="account-name">{user.username || user.name || 'User'}</span>
                    <span className="account-role">{user.role || 'user'}</span>
                  </span>
                  <span className="account-caret">{accountOpen ? '▲' : '▼'}</span>
                </button>

                {accountOpen && (
                  <div className="account-dropdown">
                    {accountLinks.map((item) => (
                      <NavLink key={item.to} to={item.to} className="account-dropdown-link">
                        {item.label}
                      </NavLink>
                    ))}
                    <button className="account-dropdown-logout" onClick={logout} type="button">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className="ghost-btn">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-primary">
                  Join Free
                </NavLink>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? 'X' : 'Menu'}
        </button>
      </div>

      <div className={`container mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <NavLink
            key={`mobile-${link.to}`}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}

        {user ? (
          <>
            <div className="user-pill">{user.username || user.name || 'User'} ({user.role || 'user'})</div>
            {accountLinks.map((item) => (
              <NavLink key={`mobile-account-${item.to}`} to={item.to} className="nav-link">
                {item.label}
              </NavLink>
            ))}
            <button type="button" className="danger-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="ghost-btn">
              Login
            </NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Join Free
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
