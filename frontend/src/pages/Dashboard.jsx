import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiHelpers } from '../services/api';
import useRealtimeRefresh from '../hooks/useRealtimeRefresh';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    if (user?.role === 'organizer') {
      navigate('/organizer', { replace: true });
    }
  }, [navigate, user]);

  const fetchData = async () => {
    try {
      setError('');

      const apps = await apiHelpers.getMyApplications();
      setApplications(apps.applications || []);

      try {
        const featured = await apiHelpers.getFeaturedResources();
        setRecommended((featured.resources || []).slice(0, 3));
      } catch {
        const list = await apiHelpers.getAllResources({ limit: 3 });
        setRecommended(list.resources || []);
      }
    } catch (err) {
      const msg = apiHelpers.getErrorMessage(err);
      setError(msg);
      if (apiHelpers.isAuthError(err)) {
        logout();
        navigate('/login');
      }
    } finally {
      if (initialLoading) setInitialLoading(false);
    }
  };

  useRealtimeRefresh(fetchData, {
    intervalMs: 10000,
    enabled: Boolean(user && user.role === 'user'),
    runOnMount: true,
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const statusTone = (status) => {
    if (status === 'accepted') return { bg: 'rgba(16,185,129,0.16)', color: '#065f46' };
    if (status === 'rejected') return { bg: 'rgba(239,68,68,0.14)', color: '#b91c1c' };
    return { bg: 'rgba(245,158,11,0.18)', color: '#92400e' };
  };

  if (initialLoading) {
    return (
      <main>
        <div className="container flex-center" style={{ minHeight: '55vh' }}>
          <div className="loading" aria-label="Loading dashboard"></div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container">
        <section className="section hero-shell">
          <p className="muted-badge">Your activity center</p>
          <h1 style={{ marginTop: '0.9rem', marginBottom: '0.25rem' }}>Hello, {user?.name || 'Learner'}</h1>
          <p style={{ marginBottom: 0 }}>Track your applications, discover opportunities, and stay updated in one place.</p>
        </section>

        {error && (
          <section className="section card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
          </section>
        )}

        <section className="section">
          <div className="grid grid-4">
            {[
              { label: 'Applications', value: stats.total },
              { label: 'Pending', value: stats.pending },
              { label: 'Accepted', value: stats.accepted },
              { label: 'Rejected', value: stats.rejected },
            ].map((item) => (
              <article key={item.label} className="stat-tile">
                <p className="stat-value">{item.value}</p>
                <p style={{ margin: 0, color: 'var(--text-500)', fontWeight: 700 }}>{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="flex-between" style={{ gap: '0.9rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
            <h2 style={{ marginBottom: 0 }}>Recent applications</h2>
            <button className="btn btn-secondary" onClick={() => navigate('/search')}>Find new resources</button>
          </div>

          {applications.length === 0 ? (
            <div className="card text-center" style={{ padding: '2rem' }}>
              <h3>No applications yet</h3>
              <p>Start by exploring currently open resources.</p>
              <button className="btn btn-primary" onClick={() => navigate('/search')}>Browse resources</button>
            </div>
          ) : (
            <div className="grid" style={{ gap: '0.8rem' }}>
              {applications.slice(0, 6).map((item) => {
                const tone = statusTone(item.status);
                return (
                  <article key={item._id} className="card" style={{ padding: '1rem' }}>
                    <div className="flex-between" style={{ gap: '0.7rem', flexWrap: 'wrap' }}>
                      <div>
                        <h3 style={{ marginBottom: '0.25rem', fontSize: '1.03rem' }}>{item.resource?.title || 'Resource'}</h3>
                        <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>
                          Applied on {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="status-chip" style={{ background: tone.bg, color: tone.color, textTransform: 'capitalize' }}>
                        {item.status || 'pending'}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {recommended.length > 0 && (
          <section className="section">
            <div className="flex-between" style={{ marginBottom: '0.8rem', gap: '0.7rem', flexWrap: 'wrap' }}>
              <h2 style={{ marginBottom: 0 }}>Recommended resources</h2>
              <button className="btn btn-secondary" onClick={() => navigate('/search')}>View all</button>
            </div>

            <div className="grid grid-3">
              {recommended.map((resource) => (
                <article key={resource._id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/resource/${resource._id}`)}>
                  <h3 style={{ fontSize: '1.03rem', marginBottom: '0.3rem' }}>{resource.title}</h3>
                  <p style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    {(resource.description || '').slice(0, 110)}{(resource.description || '').length > 110 ? '...' : ''}
                  </p>
                  <span className="status-chip" style={{ background: 'rgba(14,165,164,0.14)', color: '#0f766e' }}>
                    {resource.type || 'Resource'}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
