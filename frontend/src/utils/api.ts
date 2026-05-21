import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  voterLogin: (data: any) => api.post('/auth/voter-login', data),
  getVoterProfile: () => api.get('/auth/voter-profile'),
  post: (endpoint: string, data: any) => api.post(endpoint, data),
  get: (endpoint: string) => api.get(endpoint),
};

export const profileAPI = {
  getProfile: (userId: string) => api.get(`/profiles/${userId}`),
  getAllProfiles: () => api.get('/profiles'),
  deleteProfile: (id: string) => api.delete(`/profiles/${id}`),
  verifyVoterByFace: (data: any) => api.post('/profiles/verify-face', data),
};

export const candidateAPI = {
  getAllCandidates: () => api.get('/candidates'),
  addCandidate: (data: any) => api.post('/candidates', data),
  deleteCandidate: (id: string) => api.delete(`/candidates/${id}`),
};

export const voteAPI = {
  castVote: (data: any) => api.post('/votes', data),
  getAllVotes: () => api.get('/votes'),
};

export const resultsAPI = {
  getStatus: () => api.get('/results/status'),
  getResults: () => api.get('/results'),
  declareResults: () => api.post('/results/declare'),
  resetElection: () => api.post('/results/reset'),
};

export default api;
