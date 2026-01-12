import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const API_URL = `${SERVER_URL}/api`;

// Axios instance for authenticated API calls
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Axios instance for public API calls (no auth)
const publicAxios = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, null, { withCredentials: true });
    const data = response.data;
    sessionStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  } catch (error) {
    sessionStorage.removeItem('accessToken');
    window.location.href = '/admin';
    throw error;
  }
};

// Add Authorization header to each request if token exists
axiosInstance.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('accessToken');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    
    // Set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  err => Promise.reject(err)
);

// Response interceptor to handle 401/403 and refresh token
axiosInstance.interceptors.response.use(
  res => res,
  err => {
    const originalRequest = err.config;
    const status = err.response ? err.response.status : null;

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(e => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        refreshToken()
          .then(newToken => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            processQueue(null, newToken);
            resolve(axiosInstance(originalRequest));
          })
          .catch(e => {
            processQueue(e, null);
            reject(e);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(err);
  }
);

// Keep a fetch-like wrapper for backward compatibility
export const fetchWithAuth = async (url, options = {}) => {
  try {
    const method = options.method || 'GET';
    const headers = options.headers || {};
    const body = options.body !== undefined ? options.body : undefined;

    const axiosConfig = {
      url,
      method,
      headers: { ...headers },
      data: body,
      withCredentials: true
    };

    // For FormData, remove Content-Type to let axios set it with boundary
    if (body instanceof FormData) {
      delete axiosConfig.headers['Content-Type'];
      // Don't parse FormData as JSON
      axiosConfig.data = body;
    }

    const response = await axiosInstance.request(axiosConfig);

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.data,
      text: async () => (typeof response.data === 'string' ? response.data : JSON.stringify(response.data))
    };
  } catch (error) {
    if (error.response) {
      return {
        ok: false,
        status: error.response.status,
        json: async () => error.response.data,
        text: async () => JSON.stringify(error.response.data)
      };
    }
    return Promise.reject(error);
  }
};

// Voucher API endpoints
export const voucherAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/vouchers');
    return response.data;
  },

  getByCode: async (code) => {
    const response = await axiosInstance.get(`/vouchers/${code}`);
    return response.data;
  },

  create: async (voucherData) => {
    const response = await axiosInstance.post('/vouchers', voucherData);
    return response.data;
  },

  toggleStatus: async (code) => {
    const response = await axiosInstance.patch(`/vouchers/${code}/toggle`);
    return response.data;
  },

  validate: async (code) => {
    const response = await publicAxios.get(`/vouchers/validate/${code}`);
    return response.data;
  }
};

// User API endpoints
export const userAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await axiosInstance.patch(`/users/${id}/toggle-status`);
    return response.data;
  }
};

// Public API endpoints (no authentication required)
export const publicAPI = {
  // Get all products
  getProducts: async () => {
    const response = await publicAxios.get('/products/public/products');
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id) => {
    const response = await publicAxios.get(`/products/public/products/${id}`);
    return response.data;
  },

  // Create order (public - no authentication)
  createOrder: async (orderData) => {
    const response = await publicAxios.post('/orders/public/orders', orderData);
    return response.data;
  },

  // Validate voucher code
  validateVoucher: async (code) => {
    const response = await publicAxios.get(`/vouchers/validate/${code}`);
    return response.data;
  }
};

// Order API endpoints (authenticated - for admin)
export const orderAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },

  update: async (id, orderData) => {
    const response = await axiosInstance.put(`/orders/${id}`, orderData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/orders/${id}`);
    return response.data;
  }
};

// Import API endpoints
export const importAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/imports');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/imports/${id}`);
    return response.data;
  },

  create: async (importData) => {
    const response = await axiosInstance.post('/imports', importData);
    return response.data;
  },

  update: async (id, importData) => {
    const response = await axiosInstance.put(`/imports/${id}`, importData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/imports/${id}`);
    return response.data;
  }
};

// Audit Log API endpoints (admin only)
export const auditLogAPI = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    const response = await axiosInstance.get(`/audit-logs?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/audit-logs/${id}`);
    return response.data;
  },

  getByResource: async (resourceType, resourceId) => {
    const response = await axiosInstance.get(`/audit-logs/resource/${resourceType}/${resourceId}`);
    return response.data;
  },

  getByUser: async (userId, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/audit-logs/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  }
};

// Chat API endpoints
export const chatAPI = {
  // Public - Send message to chatbot
  sendMessage: async (customerName, message, conversationId = null) => {
    const response = await publicAxios.post('/chat/send', {
      customerName,
      message,
      conversationId
    });
    return response.data;
  },

  // Admin - Get all conversations
  getConversations: async () => {
    const response = await axiosInstance.get('/chat/conversations');
    return response.data;
  },

  // Admin - Get messages of a conversation
  getConversationMessages: async (conversationId) => {
    const response = await axiosInstance.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  // Admin - Delete a conversation
  deleteConversation: async (conversationId) => {
    const response = await axiosInstance.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  }
};
