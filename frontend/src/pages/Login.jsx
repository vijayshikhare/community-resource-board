import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loginWithGoogle, error, setError, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    if (user.role === 'organizer') {
      navigate('/organizer', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (response) => {
    if (!response?.credential) {
      setError('Google sign in failed. Please try again.');
      return;
    }

    setLoading(true);
    const result = await loginWithGoogle(response.credential);
    if (!result.success) {
      setError(result.error || 'Google sign in failed.');
    }
    setLoading(false);
  };

  return (
    <main>
      <div className="container">
        <section className="section" style={{ display: 'flex', justifyContent: 'center' }}>
          <article className="card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
            <p className="muted-badge" style={{ marginBottom: '0.8rem' }}>Secure access</p>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', marginBottom: '0.3rem' }}>Welcome back</h1>
            <p style={{ marginBottom: '1.2rem' }}>Sign in to continue managing resources and applications.</p>

            {error && (
              <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.45)', padding: '0.8rem' }}>
                <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
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

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <div style={{ textAlign: 'right', marginTop: '0.45rem' }}>
                  <Link to="/forgot-password" style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ height: '1px', flex: 1, background: 'var(--surface-200)' }}></div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-500)' }}>or continue with</span>
              <div style={{ height: '1px', flex: 1, background: 'var(--surface-200)' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <GoogleLogin onSuccess={onGoogleSuccess} onError={() => setError('Google sign in failed. Please try again.')} />
            </div>

            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.92rem' }}>
              New to the platform? <Link to="/register">Create account</Link>
            </p>
          </article>
        </section>
      </div>
    </main>
  );
};

export default Login;
