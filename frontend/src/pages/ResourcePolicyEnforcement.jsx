import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useRealtimeRefresh from '../hooks/useRealtimeRefresh';

const ResourcePolicyEnforcement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchResources = async () => {
    try {
      setError('');
      const response = await api.get('/api/resources/admin/all');
      setResources(response.data.resources || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources for policy enforcement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useRealtimeRefresh(fetchResources, {
    intervalMs: 10000,
    enabled: Boolean(user && user.role === 'admin'),
    runOnMount: true,
  });

  const visibleResources = useMemo(() => {
    if (filter === 'all') return resources;
    if (filter === 'terminated') return resources.filter((item) => item.policyEnforcement?.isTerminated === true);
    if (filter === 'active') return resources.filter((item) => item.policyEnforcement?.isTerminated !== true);
    if (filter === 'appeals') {
      return resources.filter(
        (item) => item.policyEnforcement?.isTerminated && item.policyEnforcement?.organizerAppeal?.status === 'pending'
      );
    }
    return resources;
  }, [resources, filter]);

  const terminateResource = async (resource) => {
    const reason = window.prompt(`Terminate resource \"${resource.title}\". Provide reason:`)?.trim();
    if (!reason) return;

    if (!window.confirm(`Confirm termination for \"${resource.title}\"?`)) return;

    try {
      setBusyId(resource._id);
      const res = await api.patch(`/api/resources/${resource._id}/terminate`, { reason });
      const updated = res.data.resource;
      setResources((prev) => prev.map((item) => (item._id === resource._id ? updated : item)));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to terminate resource.');
    } finally {
      setBusyId('');
    }
  };

  const reissueResource = async (resource) => {
    const adminResponse = window.prompt(`Reissue resource \"${resource.title}\". Optional admin note:`)?.trim() || '';

    try {
      setBusyId(resource._id);
      const res = await api.patch(`/api/resources/${resource._id}/reissue`, { adminResponse });
      const updated = res.data.resource;
      setResources((prev) => prev.map((item) => (item._id === resource._id ? updated : item)));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to reissue resource.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <main>
      <div className="container">
        <section className="section hero-shell">
          <button className="btn btn-secondary" onClick={() => navigate('/admin')} style={{ marginBottom: '0.8rem' }}>
            Back to admin
          </button>
          <p className="muted-badge">Policy controls</p>
          <h1 style={{ marginBottom: '0.3rem' }}>Resource policy enforcement</h1>
          <p style={{ marginBottom: 0 }}>Review all resources one by one, terminate with reason, and reissue after organizer appeal.</p>
        </section>

        {error && (
          <section className="section card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
          </section>
        )}

        <section className="section">
          <div className="admin-filter-bar">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'terminated', label: 'Terminated' },
              { key: 'appeals', label: 'Pending appeals' },
            ].map((item) => (
              <button
                key={item.key}
                className={filter === item.key ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="section flex-center" style={{ minHeight: '40vh' }}>
            <div className="loading"></div>
          </section>
        ) : visibleResources.length === 0 ? (
          <section className="section card text-center" style={{ padding: '1.6rem' }}>
            <p style={{ margin: 0 }}>No resources found in this view.</p>
          </section>
        ) : (
          <section className="section">
            <div className="grid grid-3">
              {visibleResources.map((resource) => {
                const isTerminated = resource.policyEnforcement?.isTerminated === true;
                const appeal = resource.policyEnforcement?.organizerAppeal || {};

                return (
                  <article key={resource._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <div className="flex-between" style={{ gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span className="status-chip" style={{ textTransform: 'capitalize', background: isTerminated ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.15)', color: isTerminated ? '#b91c1c' : '#065f46' }}>
                        {isTerminated ? 'terminated' : (resource.status || 'active')}
                      </span>
                      <span style={{ color: 'var(--text-500)', fontSize: '0.82rem' }}>
                        by {resource.organizer?.name || resource.organizerName || 'Organizer'}
                      </span>
                    </div>

                    <h3 style={{ marginBottom: '0.15rem', fontSize: '1.03rem' }}>{resource.title}</h3>
                    <p style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      {(resource.description || '').slice(0, 120)}{(resource.description || '').length > 120 ? '...' : ''}
                    </p>

                    {isTerminated && (
                      <div className="card" style={{ padding: '0.6rem', borderColor: 'rgba(239,68,68,0.32)' }}>
                        <p style={{ marginBottom: '0.2rem', color: '#b91c1c', fontWeight: 700 }}>Termination reason</p>
                        <p style={{ marginBottom: '0.25rem', fontSize: '0.86rem' }}>{resource.policyEnforcement?.terminationReason || 'No reason provided'}</p>
                        {appeal.reason && (
                          <>
                            <p style={{ marginBottom: '0.2rem', color: '#0c4a6e', fontWeight: 700 }}>Organizer appeal</p>
                            <p style={{ marginBottom: '0.25rem', fontSize: '0.84rem' }}>{appeal.reason}</p>
                          </>
                        )}
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-500)', textTransform: 'capitalize' }}>
                          Appeal status: {appeal.status || 'none'}
                        </p>
                      </div>
                    )}

                    {!isTerminated && (
                      <button
                        className="danger-btn"
                        disabled={busyId === resource._id}
                        onClick={() => terminateResource(resource)}
                      >
                        {busyId === resource._id ? 'Processing...' : 'Terminate resource'}
                      </button>
                    )}

                    {isTerminated && appeal.status === 'pending' && (
                      <button
                        className="btn btn-primary"
                        disabled={busyId === resource._id}
                        onClick={() => reissueResource(resource)}
                      >
                        {busyId === resource._id ? 'Processing...' : 'Reissue resource'}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ResourcePolicyEnforcement;
