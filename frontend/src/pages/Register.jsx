import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loginWithGoogle, error, setError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLocalError('');

    if (!name.trim()) return setLocalError('Full name is required.');
    if (!email.trim()) return setLocalError('Email is required.');
    if (password.length < 6) return setLocalError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setLocalError('Passwords do not match.');
    if (!agree) return setLocalError('Please accept terms to continue.');

    setLoading(true);
    try {
      const result = await register(name, email, password, inviteCode, username);
      if (!result.success) {
        setLocalError(result.error || 'Registration failed.');
        return;
      }

      const role = result.user?.role;
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'organizer') {
        navigate('/organizer', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      setLocalError('Registration failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (response) => {
    if (!response?.credential) {
      setLocalError('Google sign up failed. Please try again.');
      return;
    }
    setLoading(true);
    const result = await loginWithGoogle(response.credential);
    if (!result.success) {
      setLocalError(result.error || 'Google sign up failed.');
    }
    setLoading(false);
  };

  return (
    <main>
      <div className="container">
        <section className="section" style={{ display: 'flex', justifyContent: 'center' }}>
          <article className="card" style={{ width: '100%', maxWidth: '560px', padding: '1.5rem' }}>
            <p className="muted-badge" style={{ marginBottom: '0.8rem' }}>Fast onboarding</p>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', marginBottom: '0.3rem' }}>Create your account</h1>
            <p style={{ marginBottom: '1.2rem' }}>Set up your profile and start applying to opportunities.</p>

            {(error || localError) && (
              <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.45)', padding: '0.8rem' }}>
                <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{localError || error}</p>
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="grid grid-2" style={{ gap: '0.7rem' }}>
                <div className="form-group">
                  <label htmlFor="name">Full name</label>
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username (optional)</label>
                  <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="grid grid-2" style={{ gap: '0.7rem' }}>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="inviteCode">Invite code (optional)</label>
                <input id="inviteCode" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Organizer invite code only" />
                <p style={{ marginTop: '0.3rem', fontSize: '0.82rem', color: 'var(--text-500)' }}>Only organizer invite codes are accepted. Admin accounts are created separately.</p>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: '16px', height: '16px', marginTop: '3px' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-700)' }}>I agree to the platform terms and responsible use policy.</span>
              </label>

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ height: '1px', flex: 1, background: 'var(--surface-200)' }}></div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-500)' }}>or sign up with</span>
              <div style={{ height: '1px', flex: 1, background: 'var(--surface-200)' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <GoogleLogin onSuccess={onGoogleSuccess} onError={() => setLocalError('Google sign up failed. Please try again.')} />
            </div>

            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.92rem' }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </article>
        </section>
      </div>
    </main>
  );
};

export default Register;
