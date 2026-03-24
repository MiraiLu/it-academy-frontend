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
  getManageAll: (params) => api.get('/manage/courses', { params }),
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

// Lessons API
export const lessonsAPI = {
  getAll:  (params) => api.get('/lessons', { params }),
  create:  (data) => api.post('/lessons', data),
  update:  (id, data) => api.put(`/lessons/${id}`, data),
  delete:  (id) => api.delete(`/lessons/${id}`),
};

// Quizzes API
export const quizzesAPI = {
  getAll: (params) => api.get('/quizzes', { params }),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  getQuestions: (id) => api.get(`/quizzes/${id}/questions`),
  saveQuestions: (id, data) => api.post(`/quizzes/${id}/questions`, data),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  getEnrollments: (params) => api.get('/admin/enrollments', { params }),
  createEnrollment: (data) => api.post('/admin/enrollments', data),
  deleteEnrollment: (id) => api.delete(`/admin/enrollments/${id}`),
  getAssignments: (params) => api.get('/admin/assignments', { params }),
  createAssignment: (data) => api.post('/admin/assignments', data),
  updateAssignment: (id, data) => api.put(`/admin/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/admin/assignments/${id}`),
  getSubmissions: (id) => api.get(`/admin/assignments/${id}/submissions`),
  gradeSubmission: (id, data) => api.post(`/admin/submissions/${id}/grade`, data),
  getCertificates: (params) => api.get('/admin/certificates', { params }),
  issueCertificate: (data) => api.post('/admin/certificates', data),
  revokeCertificate: (id) => api.delete(`/admin/certificates/${id}`),
};

export default api;
