import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiHelpers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiHelpers.getResourceById(id);
        setResource(data.resource || data);
      } catch (err) {
        setError(apiHelpers.getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <main>
        <div className="container flex-center" style={{ minHeight: '55vh' }}>
          <div className="loading"></div>
        </div>
      </main>
    );
  }

  if (!resource) {
    return (
      <main>
        <div className="container section card text-center">
          <h2>Resource unavailable</h2>
          <p>{error || 'The requested resource could not be loaded.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/search')}>Back to search</button>
        </div>
      </main>
    );
  }

  const deadline = resource.deadline ? new Date(resource.deadline).toLocaleDateString() : 'No deadline specified';

  const terminateResource = async () => {
    const reason = window.prompt(`Terminate resource \"${resource.title}\". Provide reason:`)?.trim();
    if (!reason) return;

    if (!window.confirm(`Confirm termination for \"${resource.title}\"?`)) return;

    try {
      await api.patch(`/api/resources/${id}/terminate`, { reason });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to terminate resource.');
    }
  };

  return (
    <main>
      <div className="container">
        <section className="section">
          <button className="btn btn-secondary" onClick={() => navigate('/search')}>
            Back to resources
          </button>
        </section>

        {error && (
          <section className="section card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
          </section>
        )}

        <section className="section grid grid-3" style={{ alignItems: 'start' }}>
          <article className="card" style={{ gridColumn: 'span 2' }}>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              <span className="status-chip" style={{ background: 'rgba(14,165,164,0.14)', color: '#0f766e' }}>{resource.type || 'Resource'}</span>
              {resource.featured && <span className="status-chip" style={{ background: 'rgba(249,115,22,0.16)', color: '#c2410c' }}>Featured</span>}
            </div>

            <h1 style={{ marginBottom: '0.35rem' }}>{resource.title}</h1>
            <p style={{ marginBottom: '0.7rem' }}>{resource.organization || resource.organizerName || 'Community resource board'}</p>

            <div className="grid grid-2" style={{ gap: '0.6rem', marginBottom: '0.9rem' }}>
              <div className="card" style={{ padding: '0.75rem', background: 'rgba(14,165,164,0.08)' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-500)' }}>Location</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{resource.location?.type || resource.location || 'Flexible'}</p>
              </div>
              <div className="card" style={{ padding: '0.75rem', background: 'rgba(2,132,199,0.08)' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-500)' }}>Deadline</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{deadline}</p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.25rem' }}>Description</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{resource.description || 'No description available.'}</p>

            {resource.eligibility && (
              <>
                <h2 style={{ fontSize: '1.25rem', marginTop: '0.8rem' }}>Eligibility</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{resource.eligibility}</p>
              </>
            )}

            {resource.benefits && (
              <>
                <h2 style={{ fontSize: '1.25rem', marginTop: '0.8rem' }}>Benefits</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{resource.benefits}</p>
              </>
            )}

            {resource.applicationProcess && (
              <>
                <h2 style={{ fontSize: '1.25rem', marginTop: '0.8rem' }}>Application process</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{resource.applicationProcess}</p>
              </>
            )}
          </article>

          <aside className="card" style={{ position: 'sticky', top: '90px' }}>
            <h3 style={{ marginBottom: '0.7rem' }}>Take action</h3>
            {user?.role === 'user' && (
              <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.6rem' }} onClick={() => navigate(`/resource/${id}/apply`)}>
                Apply now
              </button>
            )}
            {user?.role === 'admin' && (
              <button className="danger-btn" style={{ width: '100%', marginBottom: '0.6rem' }} onClick={terminateResource}>
                Terminate resource
              </button>
            )}
            {resource.link && (
              <a href={resource.link} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.6rem' }}>
                Official link
              </a>
            )}
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => navigate(user?.role === 'admin' ? '/admin' : user?.role === 'organizer' ? '/organizer' : '/dashboard')}
            >
              {user?.role === 'admin' ? 'Open admin console' : user?.role === 'organizer' ? 'Open organizer dashboard' : 'Open dashboard'}
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default ResourceDetail;
