import axios, { AxiosError } from 'axios';

const TOKEN_STORAGE_KEY = 'auth_token';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    const message =
      error.response?.data?.message ?? error.message ?? 'An unexpected error occurred.';

    return Promise.reject(new Error(message));
  },
);

export { TOKEN_STORAGE_KEY, api };
