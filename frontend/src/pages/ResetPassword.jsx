import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiHelpers } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiHelpers.resetPassword({ token, newPassword });
      setMessage(response.message || 'Password has been reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(apiHelpers.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="container">
        <section className="section" style={{ display: 'flex', justifyContent: 'center' }}>
          <article className="card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
            <p className="muted-badge" style={{ marginBottom: '0.8rem' }}>Secure reset</p>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', marginBottom: '0.3rem' }}>Set new password</h1>
            <p style={{ marginBottom: '1.2rem' }}>Choose a strong password to secure your account.</p>

            {error && (
              <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.45)', padding: '0.8rem' }}>
                <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
              </div>
            )}

            {message && (
              <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(16,185,129,0.45)', padding: '0.8rem' }}>
                <p style={{ margin: 0, color: '#065f46', fontWeight: 700 }}>{message}</p>
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>

            <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.92rem' }}>
              Back to <Link to="/login">login</Link>
            </p>
          </article>
        </section>
      </div>
    </main>
  );
};

export default ResetPassword;
