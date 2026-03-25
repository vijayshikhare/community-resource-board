import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useRealtimeRefresh from '../hooks/useRealtimeRefresh';

const AdminConsole = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  const fetchAdminData = async () => {
    try {
      setError('');
      const [statsRes, usersRes, resourcesRes] = await Promise.all([
        api.get('/api/users/admin/stats'),
        api.get('/api/users/admin/users'),
        api.get('/api/resources/admin/all'),
      ]);

      setStats(statsRes.data.stats || null);
      setUsers(usersRes.data.users || []);
      setResources(resourcesRes.data.resources || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.');
    } finally {
      if (initialLoading) setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useRealtimeRefresh(fetchAdminData, {
    intervalMs: 10000,
    enabled: Boolean(user && user.role === 'admin'),
    runOnMount: true,
  });

  const visibleUsers = useMemo(() => {
    if (userFilter === 'all') return users;
    if (userFilter === 'active') return users.filter((user) => user.isActive !== false);
    if (userFilter === 'inactive') return users.filter((user) => user.isActive === false);
    return users.filter((user) => user.role === userFilter);
  }, [users, userFilter]);

  const changeRole = async (userId, role) => {
    try {
      setBusyId(userId);
      const res = await api.patch(`/api/users/admin/users/${userId}/role`, { role });
      const updated = res.data.user;
      setUsers((prev) => prev.map((item) => (item._id === userId ? updated : item)));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update user role.');
    } finally {
      setBusyId('');
    }
  };

  const toggleStatus = async (user) => {
    const nextStatus = user.isActive === false;
    try {
      setBusyId(user._id);
      const res = await api.patch(`/api/users/admin/users/${user._id}/status`, { isActive: nextStatus });
      const updated = res.data.user;
      setUsers((prev) => prev.map((item) => (item._id === user._id ? updated : item)));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update user status.');
    } finally {
      setBusyId('');
    }
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Delete user ${user.email}? This action is permanent.`)) return;
    try {
      setBusyId(user._id);
      await api.delete(`/api/users/admin/users/${user._id}`);
      setUsers((prev) => prev.filter((item) => item._id !== user._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to delete user.');
    } finally {
      setBusyId('');
    }
  };

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
          <p className="muted-badge">Admin command center</p>
          <h1 style={{ marginBottom: '0.3rem' }}>Full platform control</h1>
          <p style={{ marginBottom: 0 }}>
            Monitor users, organizers, resources, and applications. Manage permissions and enforce policy actions.
          </p>
        </section>

        {error && (
          <section className="section card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
          </section>
        )}

        {initialLoading ? (
          <section className="section flex-center" style={{ minHeight: '40vh' }}>
            <div className="loading"></div>
          </section>
        ) : (
          <>
            <section className="section">
              <div className="grid grid-4">
                {[
                  { label: 'Total users', value: stats?.totalUsers ?? 0 },
                  { label: 'Organizers', value: stats?.totalOrganizers ?? 0 },
                  { label: 'Admins', value: stats?.totalAdmins ?? 0 },
                  { label: 'Applications', value: stats?.totalApplications ?? 0 },
                  { label: 'Resources', value: stats?.totalResources ?? 0 },
                  { label: 'Active resources', value: stats?.activeResources ?? 0 },
                  { label: 'Active accounts', value: stats?.activeAccounts ?? 0 },
                  { label: 'Inactive accounts', value: stats?.inactiveAccounts ?? 0 },
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
                <h2 style={{ marginBottom: 0 }}>User and role management</h2>
                <div className="admin-filter-bar">
                  {['all', 'user', 'organizer', 'admin', 'active', 'inactive'].map((value) => (
                    <button
                      key={value}
                      className={userFilter === value ? 'btn btn-primary' : 'btn btn-secondary'}
                      onClick={() => setUserFilter(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card admin-table-shell">
                <table className="admin-table">
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--surface-200)' }}>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsers.map((user) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid var(--surface-100)' }}>
                        <td>{user.name || user.username || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                        <td>{user.isActive === false ? 'Inactive' : 'Active'}</td>
                        <td>
                          <div className="admin-action-wrap">
                            {['user', 'organizer', 'admin'].map((role) => (
                              <button
                                key={`${user._id}-${role}`}
                                className={user.role === role ? 'btn btn-primary' : 'btn btn-secondary'}
                                style={{ minWidth: '96px' }}
                                disabled={busyId === user._id}
                                onClick={() => changeRole(user._id, role)}
                              >
                                {role}
                              </button>
                            ))}
                            <button
                              className="btn btn-secondary"
                              disabled={busyId === user._id}
                              onClick={() => toggleStatus(user)}
                            >
                              {user.isActive === false ? 'Activate' : 'Deactivate'}
                            </button>
                            <button
                              className="danger-btn"
                              disabled={busyId === user._id}
                              onClick={() => removeUser(user)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="policy-enforcement" className="section">
              <div className="flex-between" style={{ marginBottom: '0.8rem', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{ marginBottom: 0 }}>Resource policy enforcement</h2>
                <button className="btn btn-secondary" onClick={() => navigate('/admin/policy-enforcement')}>
                  Open dedicated page
                </button>
              </div>

              {resources.length === 0 ? (
                <div className="card text-center" style={{ padding: '1.5rem' }}>
                  <p style={{ margin: 0 }}>No resources found.</p>
                </div>
              ) : (
                <div className="grid grid-3">
                  {resources.map((resource) => (
                    <article key={resource._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {resource.policyEnforcement?.isTerminated && (
                        <div className="card" style={{ padding: '0.6rem', borderColor: 'rgba(239,68,68,0.32)' }}>
                          <p style={{ marginBottom: '0.3rem', color: '#b91c1c', fontWeight: 700 }}>Terminated</p>
                          <p style={{ marginBottom: '0.25rem', fontSize: '0.86rem' }}>{resource.policyEnforcement?.terminationReason || 'No reason provided'}</p>
                          {resource.policyEnforcement?.organizerAppeal?.reason && (
                            <p style={{ marginBottom: '0.25rem', fontSize: '0.84rem' }}>
                              Appeal: {resource.policyEnforcement.organizerAppeal.reason}
                            </p>
                          )}
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-500)', textTransform: 'capitalize' }}>
                            Appeal status: {resource.policyEnforcement?.organizerAppeal?.status || 'none'}
                          </p>
                        </div>
                      )}

                      <div className="flex-between" style={{ gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span className="status-chip" style={{ textTransform: 'capitalize' }}>
                          {resource.policyEnforcement?.isTerminated ? 'terminated' : (resource.status || 'draft')}
                        </span>
                        <span style={{ color: 'var(--text-500)', fontSize: '0.82rem' }}>
                          by {resource.organizer?.name || resource.organizerName || 'Organizer'}
                        </span>
                      </div>

                      <h3 style={{ marginBottom: '0.2rem', fontSize: '1.02rem' }}>{resource.title}</h3>
                      <p style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                        {(resource.description || '').slice(0, 120)}{(resource.description || '').length > 120 ? '...' : ''}
                      </p>

                      {user?.role === 'admin' && !resource.policyEnforcement?.isTerminated && (
                        <button
                          className="danger-btn"
                          disabled={busyId === resource._id}
                          onClick={() => terminateResource(resource)}
                        >
                          Terminate resource
                        </button>
                      )}

                      {user?.role === 'admin' && resource.policyEnforcement?.isTerminated && resource.policyEnforcement?.organizerAppeal?.status === 'pending' && (
                        <button
                          className="btn btn-primary"
                          disabled={busyId === resource._id}
                          onClick={() => reissueResource(resource)}
                        >
                          Reissue resource
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminConsole;
