import axios from 'axios';

const API_URL = 'http://155.248.254.15:3000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (email, password) =>
  api.post('/auth/register', { email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getTodos = () =>
  api.get('/todos');

export const createTodo = (title) =>
  api.post('/todos', { title });

export const updateTodo = (id, data) =>
  api.put(`/todos/${id}`, data);

export const deleteTodo = (id) =>
  api.delete(`/todos/${id}`);

export default api;