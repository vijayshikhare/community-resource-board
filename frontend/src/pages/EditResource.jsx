import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EditResource = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    level: 'beginner',
    capacity: '',
    startDate: '',
    endDate: '',
    location: '',
    mode: 'online',
    prerequisites: '',
    syllabus: '',
    benefits: '',
    certificateOffered: false,
    isPaid: false,
    fee: '',
    status: 'draft',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    if (!['organizer', 'admin'].includes(user.role)) {
      navigate('/dashboard');
      return;
    }

    const fetchResource = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/resources/${id}`);
        const resource = response.data.resource || response.data;
        const normalizeDate = (value) => (value ? new Date(value).toISOString().split('T')[0] : '');

        setFormData({
          title: resource.title || '',
          description: resource.description || '',
          category: resource.category || '',
          duration: resource.duration || '',
          level: resource.level || 'beginner',
          capacity: resource.capacity || '',
          startDate: normalizeDate(resource.startDate),
          endDate: normalizeDate(resource.endDate),
          location: resource.location || '',
          mode: resource.mode || 'online',
          prerequisites: resource.prerequisites || '',
          syllabus: resource.syllabus || '',
          benefits: resource.benefits || '',
          certificateOffered: Boolean(resource.certificateOffered),
          isPaid: Boolean(resource.isPaid),
          fee: resource.fee || '',
          status: resource.status || 'draft',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load resource details.');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, navigate, user]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    if (!formData.title.trim()) return 'Title is required.';
    if (!formData.description.trim()) return 'Description is required.';
    if (!formData.category.trim()) return 'Category is required.';
    if (!formData.duration.trim()) return 'Duration is required.';
    if (!formData.capacity || Number(formData.capacity) < 1) return 'Capacity must be at least 1.';
    if (!formData.startDate || !formData.endDate) return 'Start and end dates are required.';
    if (new Date(formData.endDate) < new Date(formData.startDate)) return 'End date must be after start date.';
    if (formData.isPaid && (!formData.fee || Number(formData.fee) < 0)) return 'Provide a valid fee for paid resources.';
    return '';
  };

  const submit = async (e, publishNow = false) => {
    e.preventDefault();
    setError('');

    const message = validate();
    if (message) return setError(message);

    setSaving(true);
    try {
      await api.put(`/api/resources/${id}`, {
        ...formData,
        status: publishNow ? 'active' : formData.status,
      });
      navigate('/organizer', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save updates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
      <div className="container" style={{ maxWidth: '920px' }}>
        <section className="section hero-shell">
          <button className="btn btn-secondary" onClick={() => navigate('/organizer')} style={{ marginBottom: '0.8rem' }}>
            Back to organizer
          </button>
          <h1 style={{ marginBottom: '0.3rem' }}>Edit resource</h1>
          <p style={{ marginBottom: 0 }}>Keep details current to improve application quality and completion rates.</p>
        </section>

        {error && (
          <section className="section card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>{error}</p>
          </section>
        )}

        <section className="section card" style={{ padding: '1.25rem' }}>
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" value={formData.title} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" rows="5" value={formData.description} onChange={onChange} required />
            </div>

            <div className="grid grid-2" style={{ gap: '0.7rem' }}>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={formData.category} onChange={onChange} required>
                  <option value="">Select category</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="business">Business</option>
                  <option value="data-science">Data science</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="level">Level</label>
                <select id="level" name="level" value={formData.level} onChange={onChange}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '0.7rem' }}>
              <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <input id="duration" name="duration" value={formData.duration} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input id="capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={onChange} required />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '0.7rem' }}>
              <div className="form-group">
                <label htmlFor="startDate">Start date</label>
                <input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End date</label>
                <input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={onChange} required />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '0.7rem' }}>
              <div className="form-group">
                <label htmlFor="mode">Mode</label>
                <select id="mode" name="mode" value={formData.mode} onChange={onChange}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input id="location" name="location" value={formData.location} onChange={onChange} disabled={formData.mode === 'online'} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prerequisites">Prerequisites</label>
              <textarea id="prerequisites" name="prerequisites" rows="3" value={formData.prerequisites} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="syllabus">Syllabus</label>
              <textarea id="syllabus" name="syllabus" rows="4" value={formData.syllabus} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="benefits">Benefits</label>
              <textarea id="benefits" name="benefits" rows="3" value={formData.benefits} onChange={onChange} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="checkbox" name="certificateOffered" checked={formData.certificateOffered} onChange={onChange} style={{ width: '16px', height: '16px' }} />
              Certificate offered
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={onChange} style={{ width: '16px', height: '16px' }} />
              Paid resource
            </label>
            {formData.isPaid && (
              <div className="form-group" style={{ maxWidth: '240px' }}>
                <label htmlFor="fee">Fee</label>
                <input id="fee" name="fee" type="number" min="0" value={formData.fee} onChange={onChange} />
              </div>
            )}

            <div className="flex gap" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" type="submit" disabled={saving}>Save changes</button>
              <button className="btn btn-primary" type="button" disabled={saving} onClick={(e) => submit(e, true)}>Save and publish</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default EditResource;
