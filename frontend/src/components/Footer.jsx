import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <section className="footer-brand-panel">
            <div className="brand" style={{ marginBottom: '0.8rem' }}>
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48" className="brand-mark-svg" role="img" aria-label="CRB logo mark">
                  <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#footerBrandGradient)" />
                  <path d="M15 18h8a4 4 0 0 1 0 8h-8z" fill="#ffffff" opacity="0.92" />
                  <path d="M25 18h6a4 4 0 0 1 0 8h-6z" fill="#ffffff" opacity="0.75" />
                  <path d="M15 30h16" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="footerBrandGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
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
            </div>
            <p className="footer-summary">
              A professional platform to publish, discover, and manage career opportunities with secure workflows for learners, organizers, and administrators.
            </p>
            <p className="footer-meta">Trusted by learners and community organizers</p>
          </section>

          <section>
            <h4 className="footer-title">Navigation</h4>
            <Link className="footer-link" to="/">Home</Link>
            <Link className="footer-link" to="/search">Resources</Link>
            <Link className="footer-link" to="/dashboard">Dashboard</Link>
          </section>

          <section>
            <h4 className="footer-title">Account</h4>
            <Link className="footer-link" to="/login">Login</Link>
            <Link className="footer-link" to="/register">Register</Link>
            <Link className="footer-link" to="/profile">Profile</Link>
          </section>

          <section>
            <h4 className="footer-title">Contact</h4>
            <a className="footer-link" href="mailto:vijayshikhareteam@gmail.com">vijayshikhareteam@gmail.com</a>
            <a className="footer-link" href="https://github.com/vijayshikhare" target="_blank" rel="noreferrer">GitHub Profile</a>
            <span className="footer-link" style={{ color: 'var(--text-500)' }}>Built for learners and organizers</span>
          </section>
        </div>

        <div className="footer-bottom">
          <span>Copyright {year} Community Resource Board. All rights reserved.</span>
          <span>Built with secure role-based access and policy enforcement.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
