import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ResourceCard = ({ resource, onResourceUpdated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState(false);

  const goToDetail = () => navigate(`/resource/${resource._id}`);

  const terminateResource = async () => {
    const reason = window.prompt(`Terminate resource \"${resource.title}\". Provide reason:`)?.trim();
    if (!reason) return;

    if (!window.confirm(`Confirm termination for \"${resource.title}\"?`)) return;

    try {
      setBusy(true);
      const response = await api.patch(`/api/resources/${resource._id}/terminate`, { reason });
      if (typeof onResourceUpdated === 'function') {
        onResourceUpdated(response.data?.resource);
      } else {
        navigate('/admin/policy-enforcement');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to terminate resource.');
    } finally {
      setBusy(false);
    }
  };

  const renderPrimaryAction = () => {
    if (user?.role === 'admin') {
      return (
        <button className="danger-btn" style={{ padding: '0.56rem 0.95rem' }} onClick={terminateResource} disabled={busy}>
          {busy ? 'Terminating...' : 'Terminate'}
        </button>
      );
    }

    if (user?.role === 'user') {
      return (
        <button className="btn btn-primary" style={{ padding: '0.56rem 0.95rem' }} onClick={() => navigate(`/resource/${resource._id}/apply`)}>
          Apply now
        </button>
      );
    }

    return (
      <button className="btn btn-primary" style={{ padding: '0.56rem 0.95rem' }} onClick={goToDetail}>
        View Details
      </button>
    );
  };

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      <div
        style={{
          borderRadius: '14px',
          height: '146px',
          background: 'linear-gradient(135deg, rgba(14,165,164,0.2), rgba(2,132,199,0.15))',
          border: '1px solid rgba(125,211,252,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '2.15rem',
          fontWeight: 700,
          color: '#0f172a',
          letterSpacing: '-0.03em',
        }}
      >
        {(resource.title?.charAt(0) || 'R').toUpperCase()}
      </div>

      <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
        {resource.category && (
          <span className="status-chip" style={{ background: 'rgba(2,132,199,0.14)', color: '#0c4a6e' }}>
            {resource.category}
          </span>
        )}
        {resource.featured && (
          <span className="status-chip" style={{ background: 'rgba(249,115,22,0.16)', color: '#c2410c' }}>
            Featured
          </span>
        )}
      </div>

      <h3 className="card-title" style={{ marginBottom: 0 }}>
        {resource.title || 'Opportunity'}
      </h3>

      <p className="card-description" style={{ marginBottom: 0 }}>
        {(resource.description || 'No description available.').slice(0, 120)}
        {(resource.description || '').length > 120 ? '...' : ''}
      </p>

      <div className="flex-between" style={{ marginTop: '0.2rem', gap: '0.6rem', flexWrap: 'wrap' }}>
        {resource.link ? (
          <a
            href={resource.link}
            target="_blank"
            rel="noreferrer"
            className="ghost-btn"
            style={{ textAlign: 'center' }}
          >
            Open Link
          </a>
        ) : (
          <span style={{ color: 'var(--text-500)', fontSize: '0.86rem' }}>Details inside</span>
        )}

        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" style={{ padding: '0.56rem 0.95rem' }} onClick={goToDetail}>
            View Details
          </button>
          {renderPrimaryAction()}
        </div>
      </div>
    </article>
  );
};

export default ResourceCard;
