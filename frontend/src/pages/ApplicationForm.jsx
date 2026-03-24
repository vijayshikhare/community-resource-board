import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ApplicationForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [phone, setPhone] = useState('');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/api/resources/${id}`);
        setResource(res.data.resource || res.data);
      } catch {
        setError('Resource not found.');
      }
    };

    fetchResource();
  }, [id]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    setResume(file || null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFileError('');

    if (!resume) return setFileError('Resume file is required.');

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowed.includes(resume.type)) return setFileError('Upload PDF, DOC, or DOCX only.');
    if (resume.size > 5 * 1024 * 1024) return setFileError('File size must be under 5MB.');

    const data = new FormData();
    data.append('resourceId', id);
    data.append('coverLetter', coverLetter);
    data.append('phone', phone);
    data.append('resume', resume);

    try {
      setLoading(true);
      await api.post('/api/applications', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main>
        <div className="container section card text-center" style={{ maxWidth: '700px' }}>
          <h2>Sign in required</h2>
          <p>Please sign in to submit an application.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to login</button>
        </div>
      </main>
    );
  }

  if (user.role !== 'user') {
    return (
      <main>
        <div className="container section card text-center" style={{ maxWidth: '700px' }}>
          <h2>Access restricted</h2>
          <p>Only user accounts can submit applications.</p>
          <button className="btn btn-primary" onClick={() => navigate('/organizer')}>Go to organizer dashboard</button>
        </div>
      </main>
    );
  }

  if (!resource) {
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
      <div className="container" style={{ maxWidth: '900px' }}>
        <section className="section hero-shell">
          <h1 style={{ marginBottom: '0.2rem' }}>Apply for {resource.title}</h1>
          <p style={{ marginBottom: 0 }}>
            Submit your profile details and resume to complete your application.
          </p>
        </section>

        <section className="section card" style={{ padding: '1.2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Resource overview</h2>
          <p style={{ marginBottom: 0 }}>{resource.description}</p>
        </section>

        {(error || fileError) && (
          <section className="section card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{fileError || error}</p>
          </section>
        )}

        <section className="section card" style={{ padding: '1.2rem' }}>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="coverLetter">Cover letter</label>
              <textarea
                id="coverLetter"
                rows="6"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write why you are a good fit for this opportunity."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" required />
            </div>

            <div className="form-group">
              <label htmlFor="resume">Resume (PDF, DOC, DOCX, max 5MB)</label>
              <input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} required />
              {resume && (
                <p style={{ marginTop: '0.4rem', marginBottom: 0, color: 'var(--text-500)', fontSize: '0.85rem' }}>
                  Selected: {resume.name}
                </p>
              )}
            </div>

            <div className="flex gap" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit application'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => navigate(`/resource/${id}`)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default ApplicationForm;
