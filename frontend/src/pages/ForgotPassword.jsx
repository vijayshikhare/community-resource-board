import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiHelpers } from '../services/api';

const RESEND_COOLDOWN_SECONDS = 45;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const startCooldown = () => {
    setCooldownRemaining(RESEND_COOLDOWN_SECONDS);

    const intervalId = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await apiHelpers.requestPasswordReset(email.trim());
      setMessage(response.message || 'If this email is registered, a reset link has been sent.');
      startCooldown();
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
            <p className="muted-badge" style={{ marginBottom: '0.8rem' }}>Password recovery</p>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', marginBottom: '0.3rem' }}>Forgot password?</h1>
            <p style={{ marginBottom: '1.2rem' }}>Enter your email and we will send a secure reset link.</p>

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
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onSubmit({ preventDefault: () => {} })}
                disabled={loading || !email.trim() || cooldownRemaining > 0}
                style={{ width: '100%' }}
              >
                {cooldownRemaining > 0 ? `Resend available in ${cooldownRemaining}s` : 'Resend email'}
              </button>
            </div>

            <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.92rem' }}>
              Remembered your password? <Link to="/login">Back to login</Link>
            </p>
          </article>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;
