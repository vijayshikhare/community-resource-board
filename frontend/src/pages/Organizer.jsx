import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import useRealtimeRefresh from '../hooks/useRealtimeRefresh';

const Organizer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    if (!user) return;
    if (!['organizer', 'admin'].includes(user.role)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setError('');
      const res = await api.get('/api/resources/my');
      setResources(res.data.resources || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your resources.');
    } finally {
      if (initialLoading) setInitialLoading(false);
    }
  };

  useRealtimeRefresh(fetchData, {
    intervalMs: 10000,
    enabled: Boolean(user && ['organizer', 'admin'].includes(user.role)),
    runOnMount: true,
  });

  const stats = useMemo(() => ({
    total: resources.length,
    active: resources.filter((r) => r.status === 'active' || r.isActive).length,
    draft: resources.filter((r) => (r.status || 'draft') === 'draft').length,
    applications: resources.reduce((sum, r) => sum + (r.applicationCount || r.applicationsCount || 0), 0),
  }), [resources]);

  const visibleResources = useMemo(() => {
    if (filter === 'all') return resources;
    return resources.filter((resource) => (resource.status || 'draft') === filter);
  }, [resources, filter]);

  const toggleStatus = async (resource) => {
    const nextStatus = (resource.status || 'draft') === 'active' ? 'draft' : 'active';
    try {
      setBusyId(resource._id);
      await api.patch(`/api/resources/${resource._id}`, { status: nextStatus });
      setResources((prev) => prev.map((r) => (r._id === resource._id ? { ...r, status: nextStatus } : r)));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update resource status.');
    } finally {
      setBusyId('');
    }
  };

  const deleteResource = async (resource) => {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
    try {
      setBusyId(resource._id);
      await api.delete(`/api/resources/${resource._id}`);
      setResources((prev) => prev.filter((r) => r._id !== resource._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to delete resource.');
    } finally {
      setBusyId('');
    }
  };

  const submitAppeal = async (resource) => {
    const reason = window.prompt(`Submit appeal for \"${resource.title}\". Provide valid reason:`)?.trim();
    if (!reason) return;

    try {
      setBusyId(resource._id);
      const response = await api.patch(`/api/resources/${resource._id}/appeal`, { reason });
      const updated = response.data.resource;
      setResources((prev) => prev.map((r) => (r._id === resource._id ? updated : r)));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to submit appeal.');
    } finally {
      setBusyId('');
    }
  };

  if (!user) {
    return (
      <main>
        <div className="container flex-center" style={{ minHeight: '55vh' }}>
          <div className="loading"></div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container">
        <section className="section hero-shell">
          <p className="muted-badge">Organizer workspace</p>
          <div className="flex-between" style={{ marginTop: '0.8rem', gap: '0.7rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ marginBottom: '0.3rem' }}>Manage your resources</h1>
              <p style={{ marginBottom: 0 }}>Create, update, and review application-ready opportunities.</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/create-resource')}>Create resource</button>
          </div>
        </section>

        {error && (
          <section className="section card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
          </section>
        )}

        <section className="section">
          <div className="grid grid-4">
            {[
              { label: 'Resources', value: stats.total },
              { label: 'Active', value: stats.active },
              { label: 'Draft', value: stats.draft },
              { label: 'Applications', value: stats.applications },
            ].map((item) => (
              <article key={item.label} className="stat-tile">
                <p className="stat-value">{item.value}</p>
                <p style={{ margin: 0, color: 'var(--text-500)', fontWeight: 700 }}>{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="flex-between" style={{ marginBottom: '0.8rem', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h2 style={{ marginBottom: 0 }}>Your resources</h2>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              {['all', 'active', 'draft'].map((value) => (
                <button
                  key={value}
                  className={filter === value ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ padding: '0.48rem 0.95rem' }}
                  onClick={() => setFilter(value)}
                >
                  {value}
                </button>
              ))}
              <button className="btn btn-secondary" onClick={() => navigate('/applications/review')}>Review applications</button>
            </div>
          </div>

          {initialLoading ? (
            <div className="flex-center" style={{ minHeight: '30vh' }}><div className="loading"></div></div>
          ) : visibleResources.length === 0 ? (
            <div className="card text-center" style={{ padding: '2rem' }}>
              <h3>No resources in this view</h3>
              <p>Create a new resource to start receiving applications.</p>
              <button className="btn btn-primary" onClick={() => navigate('/create-resource')}>Create resource</button>
            </div>
          ) : (
            <div className="grid grid-3 animate-fadeIn">
              {visibleResources.map((resource) => {
                const isTerminated = resource.policyEnforcement?.isTerminated === true;
                const status = isTerminated ? 'terminated' : (resource.status || 'draft');
                const appealStatus = resource.policyEnforcement?.organizerAppeal?.status || 'none';
                return (
                  <article key={resource._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div className="flex-between" style={{ gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span className="status-chip" style={{ background: status === 'active' ? 'rgba(16,185,129,0.15)' : status === 'terminated' ? 'rgba(239,68,68,0.14)' : 'rgba(245,158,11,0.16)', color: status === 'active' ? '#065f46' : status === 'terminated' ? '#b91c1c' : '#92400e', textTransform: 'capitalize' }}>
                        {status}
                      </span>
                      <span style={{ color: 'var(--text-500)', fontSize: '0.84rem' }}>
                        {(resource.applicationCount || resource.applicationsCount || 0)} applications
                      </span>
                    </div>

                    <h3 style={{ marginBottom: '0.15rem', fontSize: '1.05rem' }}>{resource.title}</h3>
                    <p style={{ marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                      {(resource.description || '').slice(0, 120)}{(resource.description || '').length > 120 ? '...' : ''}
                    </p>
                    {isTerminated && (
                      <div className="card" style={{ padding: '0.65rem', borderColor: 'rgba(239,68,68,0.3)' }}>
                        <p style={{ marginBottom: '0.3rem', color: '#b91c1c', fontWeight: 700 }}>Terminated by admin</p>
                        <p style={{ marginBottom: '0.3rem', fontSize: '0.86rem' }}>{resource.policyEnforcement?.terminationReason || 'No reason provided'}</p>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-500)', textTransform: 'capitalize' }}>Appeal: {appealStatus}</p>
                      </div>
                    )}

                    <div className="action-row">
                      <button className="btn btn-secondary" style={{ padding: '0.46rem 0.8rem' }} onClick={() => navigate(`/resource/${resource._id}`)}>View</button>
                      <button className="btn btn-secondary" style={{ padding: '0.46rem 0.8rem' }} onClick={() => navigate(`/edit-resource/${resource._id}`)}>Edit</button>
                      <button className="btn btn-secondary" style={{ padding: '0.46rem 0.8rem' }} onClick={() => navigate(`/resource/${resource._id}/applications`)}>Applications</button>
                    </div>

                    <div className="action-row">
                      {!isTerminated ? (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.46rem 0.8rem' }}
                          disabled={busyId === resource._id}
                          onClick={() => toggleStatus(resource)}
                        >
                          {status === 'active' ? 'Set draft' : 'Publish'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.46rem 0.8rem' }}
                          disabled={busyId === resource._id || appealStatus === 'pending'}
                          onClick={() => submitAppeal(resource)}
                        >
                          {appealStatus === 'pending' ? 'Appeal pending' : 'Submit appeal'}
                        </button>
                      )}
                      <button
                        className="danger-btn"
                        disabled={busyId === resource._id}
                        onClick={() => deleteResource(resource)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Organizer;
