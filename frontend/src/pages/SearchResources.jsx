import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiHelpers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useRealtimeRefresh from '../hooks/useRealtimeRefresh';

const SearchResources = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    featured: false,
    status: '',
  });

  const fetchResources = async () => {
    try {
      setError('');

      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.featured) params.featured = true;
      if (filters.status) params.status = filters.status;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await apiHelpers.getAllResources(params);
      setResources(data.resources || []);
    } catch (err) {
      setError(apiHelpers.getErrorMessage(err));
    } finally {
      if (initialLoading) setInitialLoading(false);
    }
  };

  useRealtimeRefresh(fetchResources, { intervalMs: 10000, enabled: true, runOnMount: true });

  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    const query = searchQuery.toLowerCase();
    return resources.filter((resource) => (
      resource.title?.toLowerCase().includes(query) ||
      resource.description?.toLowerCase().includes(query) ||
      resource.type?.toLowerCase().includes(query)
    ));
  }, [resources, searchQuery]);

  const clearFilters = () => {
    setFilters({ type: '', location: '', featured: false, status: '' });
    setSearchQuery('');
  };

  const terminateResource = async (resource) => {
    const reason = window.prompt(`Terminate resource \"${resource.title}\". Provide reason:`)?.trim();
    if (!reason) return;

    if (!window.confirm(`Confirm termination for \"${resource.title}\"?`)) return;

    try {
      await api.patch(`/api/resources/${resource._id}/terminate`, { reason });
      setResources((prev) => prev.filter((item) => item._id !== resource._id));
    } catch (err) {
      setError(apiHelpers.getErrorMessage(err));
    }
  };

  return (
    <main>
      <div className="container">
        <section className="section card" style={{ padding: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.35rem' }}>Search Opportunities</h1>
          <p style={{ marginBottom: '1rem' }}>
            Find programs, workshops, internships, and job opportunities based on what matters to you.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchResources();
            }}
            className="grid"
            style={{ gap: '0.7rem' }}
          >
            <div className="grid grid-2" style={{ gap: '0.7rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, type, or keyword"
              />
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Location"
              />
            </div>

            <div className="grid grid-2" style={{ gap: '0.7rem' }}>
              <select
                value={filters.type}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="">All Types</option>
                <option value="training">Training</option>
                <option value="workshop">Workshop</option>
                <option value="internship">Internship</option>
                <option value="job">Job</option>
                <option value="scholarship">Scholarship</option>
                <option value="course">Course</option>
                <option value="event">Event</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Published (Active + Closed)</option>
                <option value="active">Active only</option>
                <option value="closed">Closed only</option>
                <option value="all">All statuses</option>
              </select>
            </div>

            <div className="grid grid-2" style={{ gap: '0.7rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => setFilters((prev) => ({ ...prev, featured: e.target.checked }))}
                  style={{ width: '16px', height: '16px' }}
                />
                Featured resources only
              </label>
            </div>

            <div className="flex gap" style={{ flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary">Apply Search</button>
              <button type="button" className="btn btn-secondary" onClick={clearFilters}>Reset</button>
            </div>
          </form>
        </section>

        {error && (
          <section className="section card" style={{ borderColor: 'rgba(239,68,68,0.4)' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
          </section>
        )}

        <section className="section">
          <div className="flex-between" style={{ marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.7rem' }}>
            <h2 style={{ marginBottom: 0 }}>Results</h2>
            <p style={{ marginBottom: 0 }}>
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {initialLoading && resources.length === 0 ? (
            <div className="flex-center" style={{ padding: '2.5rem 0' }}>
              <div className="loading"></div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="card text-center" style={{ padding: '2rem' }}>
              <h3>No matching resources</h3>
              <p>Try a broader search or remove some filters.</p>
            </div>
          ) : (
            <div className="grid grid-3 animate-fadeIn">
              {filteredResources.map((resource) => (
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

                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '0.2rem', marginBottom: '0.35rem' }}
                    onClick={() => navigate(`/resource/${resource._id}`)}
                  >
                    View Details
                  </button>

                  {user?.role === 'user' && (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/resource/${resource._id}/apply`)}
                    >
                      Apply now
                    </button>
                  )}

                  {user?.role === 'admin' && (
                    <button
                      className="danger-btn"
                      style={{ width: '100%' }}
                      onClick={() => terminateResource(resource)}
                    >
                      Terminate resource
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default SearchResources;
