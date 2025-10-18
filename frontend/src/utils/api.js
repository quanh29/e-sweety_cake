const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const API_URL = `${SERVER_URL}/api`;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshToken = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Important to send the httpOnly cookie
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    sessionStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  } catch (error) {
    sessionStorage.removeItem('accessToken');
    window.location.href = '/admin'; // Redirect to login
    return Promise.reject(error);
  }
};

export const fetchWithAuth = async (url, options = {}) => {
  let token = sessionStorage.getItem('accessToken');

  const headers = options.body instanceof FormData 
    ? {} 
    : { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  options.headers = { ...headers, ...options.headers };
  options.credentials = 'include';

  try {
    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(newToken => {
          options.headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(url, options);
        });
      }

      isRefreshing = true;

      return refreshToken()
        .then(newToken => {
          options.headers['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return fetch(url, options);
        })
        .catch(err => {
          processQueue(err, null);
          return Promise.reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }
    
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};
