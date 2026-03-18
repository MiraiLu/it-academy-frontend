import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  getCategories: () => api.get('/courses/categories'),
  getFeatured: () => api.get('/courses/featured'),
  create: (data) => api.post('/instructor/courses', data),
  update: (id, data) => api.put(`/instructor/courses/${id}`, data),
  delete: (id) => api.delete(`/instructor/courses/${id}`),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: () => api.get('/enrollments'),
  enroll: (courseId) => api.post(`/enrollments/${courseId}/enroll`),
  getMyCourses: () => api.get('/my-courses'),
};

export default api;