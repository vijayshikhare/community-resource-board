import axios from 'axios';

const normalizeBaseUrl = (value) => {
  if (!value) return '';

  const trimmed = value.trim().replace(/\/+$/, '');

  // Accept either API host root or host/api and normalize to host root.
  if (trimmed.toLowerCase().endsWith('/api')) {
    return trimmed.slice(0, -4);
  }

  return trimmed;
};

const API_BASE_URL = normalizeBaseUrl(
  process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://community-resource-board-api.onrender.com'
      : 'http://localhost:5000')
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

const formatApiError = (error) => {
  if (error?.response) {
    return {
      message: error.response.data?.message || 'Request failed',
      status: error.response.status,
      data: error.response.data,
    };
  }

  if (error?.request) {
    return {
      message: 'Network error. Please check your connection and try again.',
      networkError: true,
    };
  }

  return {
    message: error?.message || 'Unexpected error',
  };
};

export const uploadFile = async (endpoint, formData) => {
  const response = await api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'ERROR', error: formatApiError(error).message };
  }
};

export const apiHelpers = {
  handleError: formatApiError,

  getErrorMessage: (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return error?.response?.data?.message || 'An error occurred';
  },

  isAuthError: (error) => error?.status === 401 || error?.response?.status === 401,

  isNetworkError: (error) => Boolean(error?.networkError || error?.request),

  registerUser: async ({ name, email, password, username, inviteCode }) => {
    try {
      const payload = {
        name,
        email,
        password,
        ...(username ? { username } : {}),
        ...(inviteCode ? { inviteCode } : {}),
      };

      const response = await api.post('/api/auth/register', payload);
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  loginUser: async ({ email, password }) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  resetPassword: async ({ token, newPassword }) => {
    try {
      const response = await api.post('/api/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  loginWithGoogle: async (credential) => {
    try {
      const response = await api.post('/api/auth/google', { credential });
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  getUserProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      const response = await api.put('/api/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  uploadProfilePhoto: async (file) => {
    try {
      // Convert file to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64String = reader.result; // data:image/...;base64,...
            const response = await api.put('/api/users/profile/photo', {
              profilePhoto: base64String,
            });
            resolve(response.data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      throw formatApiError(error);
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/api/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  getAdminStats: async () => {
    try {
      const response = await api.get('/api/users/admin/stats');
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  getAdminUsers: async () => {
    try {
      const response = await api.get('/api/users/admin/users');
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  setAdminUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/api/users/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  setAdminUserStatus: async (userId, isActive) => {
    try {
      const response = await api.patch(`/api/users/admin/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  deleteAdminUser: async (userId) => {
    try {
      const response = await api.delete(`/api/users/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  getAdminResources: async () => {
    try {
      const response = await api.get('/api/resources/admin/all');
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  getAllResources: async (params = {}) => {
    try {
      const response = await api.get('/api/resources', { params });
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  getFeaturedResources: async () => {
    try {
      const response = await api.get('/api/resources/featured');
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  getResourceById: async (resourceId) => {
    try {
      const response = await api.get(`/api/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  createApplication: async ({ resourceId, coverLetter, phone = 'Not provided', skills = '' }) => {
    try {
      const response = await api.post('/api/applications', {
        resourceId,
        coverLetter: coverLetter || 'Application submitted via platform',
        phone,
        skills,
      });
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },

  getMyApplications: async () => {
    try {
      const response = await api.get('/api/applications/my');
      return response.data;
    } catch (error) {
      throw formatApiError(error);
    }
  },
};

apiHelpers.getResources = apiHelpers.getAllResources;
apiHelpers.getApplications = apiHelpers.getMyApplications;

export default api;
