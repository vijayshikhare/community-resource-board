import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiHelpers } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiHelpers.getUserProfile();
        const profile = data.user || {};

        setName(profile.name || '');
        setPhone(profile.phone || '');
        setBio(profile.bio || '');
        setSkillsInput(Array.isArray(profile.skills) ? profile.skills.join(', ') : '');
        setProfileImage(profile.profileImage || '');
      } catch (err) {
        setError(apiHelpers.getErrorMessage(err));
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const absoluteProfileImage = useMemo(() => {
    if (!profileImage) return '';
    if (profileImage.startsWith('http')) return profileImage;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBase}${profileImage}`;
  }, [profileImage]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setSavingProfile(true);
    try {
      const skills = skillsInput
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      const response = await apiHelpers.updateUserProfile({
        name,
        phone,
        bio,
        skills,
      });

      if (response.user) {
        updateUser(response.user);
      }

      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(apiHelpers.getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) {
      setError('Please select a profile photo first.');
      return;
    }

    setError('');
    setSuccess('');

    setUploadingPhoto(true);
    try {
      const response = await apiHelpers.uploadProfilePhoto(photoFile);
      const updatedUser = response.user;
      const newPhoto = response.profileImage || updatedUser?.profileImage || '';

      if (updatedUser) {
        updateUser(updatedUser);
      }

      setProfileImage(newPhoto);
      setPhotoFile(null);
      setSuccess('Profile photo updated successfully.');
    } catch (err) {
      setError(apiHelpers.getErrorMessage(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill current password and new password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await apiHelpers.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(response.message || 'Password updated successfully.');
    } catch (err) {
      setError(apiHelpers.getErrorMessage(err));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <main>
      <div className="container" style={{ maxWidth: '960px' }}>
        <section className="section hero-shell">
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '0.8rem' }}>
            Back
          </button>
          <h1 style={{ marginBottom: '0.3rem' }}>Profile settings</h1>
          <p style={{ marginBottom: 0 }}>Update your account details and profile photo.</p>
        </section>

        {(error || success) && (
          <section className="section card" style={{ borderColor: error ? 'rgba(239,68,68,0.45)' : 'rgba(16,185,129,0.45)' }}>
            <p style={{ margin: 0, color: error ? '#b91c1c' : '#065f46', fontWeight: 700 }}>{error || success}</p>
          </section>
        )}

        <section className="section grid grid-2" style={{ alignItems: 'start' }}>
          <article className="card" style={{ padding: '1.2rem' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.8rem' }}>Profile photo</h2>
            <div className="responsive-inline" style={{ marginBottom: '0.8rem' }}>
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  border: '2px solid var(--surface-200)',
                  overflow: 'hidden',
                  background: 'var(--surface-100)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  color: 'var(--text-500)',
                }}
              >
                {(photoPreview || absoluteProfileImage) ? (
                  <img
                    src={photoPreview || absoluteProfileImage}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>{(user?.name || user?.username || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="responsive-inline-grow">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
                <p style={{ marginTop: '0.4rem', marginBottom: 0, fontSize: '0.82rem', color: 'var(--text-500)' }}>
                  JPG, PNG, WEBP up to 3MB.
                </p>
              </div>
            </div>

            <button className="btn btn-primary" type="button" onClick={handleUploadPhoto} disabled={uploadingPhoto}>
              {uploadingPhoto ? 'Uploading...' : 'Upload photo'}
            </button>
          </article>

          <article className="card" style={{ padding: '1.2rem' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.8rem' }}>Account info</h2>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label htmlFor="name">Full name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" rows="4" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills (comma separated)</label>
                <input id="skills" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="React, Node.js, Communication" />
              </div>

              <button className="btn btn-primary" type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </article>
        </section>

        <section className="section">
          <article className="card" style={{ padding: '1.2rem' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.8rem' }}>Change password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New password</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group responsive-inline-grow" style={{ maxWidth: '420px' }}>
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={changingPassword}>
                {changingPassword ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </article>
        </section>
      </div>
    </main>
  );
};

export default Profile;
