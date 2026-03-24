import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useRealtimeRefresh from '../hooks/useRealtimeRefresh';

const getResumeUrl = (application) => {
  if (!application) return '';

  if (application.resumeUrl) {
    if (application.resumeUrl.startsWith('http')) return application.resumeUrl;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBase}${application.resumeUrl}`;
  }

  if (application.resume && typeof application.resume === 'string') {
    return application.resume;
  }

  if (application.resume?.filename) {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBase}/uploads/resumes/${application.resume.filename}`;
  }

  return '';
};

const getResumeFileName = (application) => {
  if (application?.resume?.originalName) return application.resume.originalName;
  if (application?.resume?.filename) return application.resume.filename;
  return 'resume';
};

const ApplicationsReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: resourceId } = useParams();

  const [applications, setApplications] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    if (!user) return;
    if (!['organizer', 'admin'].includes(user.role)) {
      navigate('/dashboard');
    }
  }, [navigate, user]);

  const fetchApplications = async () => {
    try {
      setError('');
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (resourceId) params.set('resourceId', resourceId);

      const response = await api.get(`/api/applications/organizer?${params.toString()}`);
      setApplications(response.data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications.');
    } finally {
      if (initialLoading) setInitialLoading(false);
    }
  };

  useRealtimeRefresh(fetchApplications, {
    intervalMs: 10000,
    enabled: Boolean(user && ['organizer', 'admin'].includes(user.role)),
    runOnMount: true,
  });

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications]);

  const updateStatus = async (id, status) => {
    try {
      setBusyId(id);
      await api.patch(`/api/applications/${id}/status`, { status });
      setApplications((prev) => prev.map((item) => (item._id === id ? { ...item, status } : item)));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update application.');
    } finally {
      setBusyId('');
    }
  };

  const canDecideApplication = user?.role === 'organizer';

  const chipStyle = (status) => {
    if (status === 'accepted') return { background: 'rgba(16,185,129,0.15)', color: '#065f46' };
    if (status === 'rejected') return { background: 'rgba(239,68,68,0.14)', color: '#b91c1c' };
    if (status === 'reviewed') return { background: 'rgba(2,132,199,0.14)', color: '#0c4a6e' };
    return { background: 'rgba(245,158,11,0.16)', color: '#92400e' };
  };

  return (
    <main>
      <div className="container">
        <section className="section hero-shell">
          <button className="btn btn-secondary" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/organizer')} style={{ marginBottom: '0.8rem' }}>
            {user?.role === 'admin' ? 'Back to admin console' : 'Back to organizer'}
          </button>
          <h1 style={{ marginBottom: '0.3rem' }}>Applications review</h1>
          <p style={{ marginBottom: 0 }}>
            {canDecideApplication
              ? 'Review incoming applications and keep statuses up to date.'
              : 'View all applications in read-only mode. Only resource organizers can accept or reject.'}
          </p>
        </section>

        {error && (
          <section className="section card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
          </section>
        )}

        <section className="section">
          <div className="grid grid-4">
            {[
              { label: 'Total', value: stats.total },
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
          <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: '0.8rem' }}>
            {['pending', 'reviewed', 'accepted', 'rejected', 'all'].map((value) => (
              <button key={value} className={filter === value ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setFilter(value)} style={{ padding: '0.48rem 0.95rem' }}>
                {value}
              </button>
            ))}
          </div>

          {initialLoading ? (
            <div className="flex-center" style={{ minHeight: '30vh' }}><div className="loading"></div></div>
          ) : applications.length === 0 ? (
            <div className="card">No applications found in this view.</div>
          ) : (
            <div className="grid" style={{ gap: '0.8rem' }}>
              {applications.map((item) => (
                (() => {
                  const resumeUrl = getResumeUrl(item);
                  const resumeFileName = getResumeFileName(item);
                  return (
                <article key={item._id} className="card" style={{ padding: '1rem' }}>
                  <div className="mobile-stack" style={{ gap: '0.7rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ marginBottom: '0.25rem', fontSize: '1.02rem' }}>{item.resource?.title || 'Resource'}</h3>
                      <p style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        Applicant: {item.user?.name || 'Unknown'} ({item.user?.email || 'No email'})
                      </p>
                      <p style={{ marginBottom: '0.25rem', fontSize: '0.86rem' }}>Phone: {item.phone || 'N/A'}</p>
                      <p style={{ marginBottom: 0, fontSize: '0.86rem' }}>{item.coverLetter || 'No cover letter provided.'}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.45rem', width: '100%' }}>
                      <span className="status-chip" style={{ ...chipStyle(item.status), textTransform: 'capitalize' }}>
                        {item.status || 'pending'}
                      </span>
                      {resumeUrl && (
                        <div className="action-row">
                          <a className="btn btn-secondary" style={{ padding: '0.42rem 0.7rem' }} href={resumeUrl} target="_blank" rel="noreferrer">
                            Open resume
                          </a>
                          <a className="btn btn-secondary" style={{ padding: '0.42rem 0.7rem' }} href={resumeUrl} download={resumeFileName}>
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {item.status === 'pending' && canDecideApplication && (
                    <div className="action-row" style={{ marginTop: '0.7rem' }}>
                      <button className="btn btn-secondary" disabled={busyId === item._id} onClick={() => updateStatus(item._id, 'reviewed')}>Mark reviewed</button>
                      <button className="btn btn-primary" disabled={busyId === item._id} onClick={() => updateStatus(item._id, 'accepted')}>Accept</button>
                      <button className="danger-btn" disabled={busyId === item._id} onClick={() => updateStatus(item._id, 'rejected')}>Reject</button>
                    </div>
                  )}
                </article>
                  );
                })()
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ApplicationsReview;
