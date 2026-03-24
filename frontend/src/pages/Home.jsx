import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import useRealtimeRefresh from '../hooks/useRealtimeRefresh';

const stats = [
  { label: 'Learners onboarded', value: '10K+' },
  { label: 'Open opportunities', value: '250+' },
  { label: 'Partner organizers', value: '120+' },
  { label: 'Placement success', value: '95%' },
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [feedMode, setFeedMode] = useState('featured');

  const getApplyDestination = (resourceId) => {
    if (!user) return '/login';
    if (user.role === 'user') return `/resource/${resourceId}/apply`;
    if (user.role === 'organizer') return '/organizer';
    if (user.role === 'admin') return '/admin';
    return '/dashboard';
  };

  const fetchFeatured = async () => {
    try {
      const featuredRes = await api.get('/api/resources/featured');
      const featuredList = featuredRes.data.resources || [];

      if (featuredList.length > 0) {
        setResources(featuredList);
        setFeedMode('featured');
      } else {
        const fallbackRes = await api.get('/api/resources', {
          params: { status: 'active', limit: 6, sort: '-createdAt' },
        });
        setResources(fallbackRes.data.resources || []);
        setFeedMode('latest');
      }

      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setResources([]);
      setError('Unable to load featured resources right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  useRealtimeRefresh(fetchFeatured, { intervalMs: 8000, enabled: true, runOnMount: true });

  return (
    <main>
      <div className="container">
        <section className="section hero-shell animate-fadeInUp">
          <span className="muted-badge">Career-first learning hub</span>
          <h1 style={{ marginTop: '0.9rem' }}>Find resources that move your career forward.</h1>
          <p style={{ maxWidth: '760px', fontSize: '1rem' }}>
            Discover curated opportunities, apply in minutes, and track progress in a professional workspace built for students, organizers, and growing communities.
          </p>
          <div className="flex gap" style={{ flexWrap: 'wrap', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/search')}>
              Explore Resources
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/register')}>
              Create Free Account
            </button>
          </div>
        </section>

        <section className="section">
          <div className="grid grid-4">
            {stats.map((item) => (
              <article key={item.label} className="stat-tile">
                <p className="stat-value">{item.value}</p>
                <p style={{ margin: 0, color: 'var(--text-500)', fontWeight: 600 }}>{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="flex-between" style={{ marginBottom: '0.9rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ marginBottom: '0.35rem' }}>
                {feedMode === 'featured' ? 'Featured Opportunities' : 'Latest Opportunities'}
              </h2>
              <p style={{ marginBottom: 0 }}>
                Fresh picks from active community organizers
                {lastUpdated ? ` · Updated at ${lastUpdated.toLocaleTimeString()}` : ''}
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/search')}>
              View All
            </button>
          </div>

          {error && (
            <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <p style={{ margin: 0, color: '#b91c1c', fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex-center" style={{ padding: '2rem 0' }}>
              <div className="loading" aria-label="Loading featured resources"></div>
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-3">
              {resources.map((resource) => (
                <article key={resource._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                    {resource.type && (
                      <span className="status-chip" style={{ background: 'rgba(14,165,164,0.14)', color: '#0f766e' }}>
                        {resource.type}
                      </span>
                    )}
                    {resource.featured && (
                      <span className="status-chip" style={{ background: 'rgba(249,115,22,0.15)', color: '#c2410c' }}>
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 style={{ marginBottom: 0, fontSize: '1.08rem' }}>{resource.title}</h3>
                  <p style={{ marginBottom: 0, fontSize: '0.92rem' }}>
                    {resource.description?.slice(0, 130) || 'No description available.'}
                    {resource.description?.length > 130 ? '...' : ''}
                  </p>

                  <div className="flex gap" style={{ flexWrap: 'wrap', color: 'var(--text-500)', fontSize: '0.85rem' }}>
                    {resource.location && <span>{resource.location?.type || resource.location}</span>}
                    {resource.deadline && <span>Deadline: {new Date(resource.deadline).toLocaleDateString()}</span>}
                  </div>

                  <div className="action-row" style={{ marginTop: '0.2rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/resource/${resource._id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(getApplyDestination(resource._id))}
                    >
                      {user?.role === 'admin' ? 'Open Admin' : user?.role === 'organizer' ? 'Open Organizer' : 'Apply'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '2rem' }}>
              <h3>No opportunities available right now</h3>
              <p>Check again soon for newly posted opportunities.</p>
            </div>
          )}
        </section>

        <section className="section card" style={{ padding: '1.6rem', background: 'linear-gradient(135deg, rgba(14,165,164,0.12), rgba(249,115,22,0.1))' }}>
          <h2 style={{ marginBottom: '0.35rem' }}>How it works</h2>
          <div className="grid grid-3" style={{ marginTop: '0.6rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>1. Discover</h3>
              <p style={{ marginBottom: 0 }}>Search by category, location, and type to find opportunities relevant to your goals.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>2. Apply</h3>
              <p style={{ marginBottom: 0 }}>Submit applications with your resume and details in one streamlined form.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>3. Track</h3>
              <p style={{ marginBottom: 0 }}>Monitor status updates directly from your dashboard and stay informed in real time.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
