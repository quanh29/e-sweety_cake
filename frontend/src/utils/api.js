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

// Voucher API endpoints
export const voucherAPI = {
  getAll: async () => {
    const response = await fetchWithAuth(`${API_URL}/vouchers`);
    if (!response.ok) throw new Error('Failed to fetch vouchers');
    return response.json();
  },

  getByCode: async (code) => {
    const response = await fetchWithAuth(`${API_URL}/vouchers/${code}`);
    if (!response.ok) throw new Error('Failed to fetch voucher');
    return response.json();
  },

  create: async (voucherData) => {
    const response = await fetchWithAuth(`${API_URL}/vouchers`, {
      method: 'POST',
      body: JSON.stringify(voucherData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create voucher');
    }
    return response.json();
  },

  toggleStatus: async (code) => {
    const response = await fetchWithAuth(`${API_URL}/vouchers/${code}/toggle`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle voucher status');
    }
    return response.json();
  },

  validate: async (code) => {
    const response = await fetch(`${API_URL}/vouchers/validate/${code}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid voucher');
    }
    return response.json();
  }
};

// User API endpoints
export const userAPI = {
  getAll: async () => {
    const response = await fetchWithAuth(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetchWithAuth(`${API_URL}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  create: async (userData) => {
    const response = await fetchWithAuth(`${API_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }
    return response.json();
  },

  update: async (id, userData) => {
    const response = await fetchWithAuth(`${API_URL}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await fetchWithAuth(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
    return response.json();
  },

  toggleStatus: async (id) => {
    const response = await fetchWithAuth(`${API_URL}/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle user status');
    }
    return response.json();
  }
};

// Public API endpoints (no authentication required)
export const publicAPI = {
  // Get all products
  getProducts: async () => {
    const response = await fetch(`${API_URL}/products/public/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // Get single product by ID
  getProduct: async (id) => {
    const response = await fetch(`${API_URL}/products/public/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  // Create order (public - no authentication)
  createOrder: async (orderData) => {
    const response = await fetch(`${API_URL}/orders/public/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }
    return response.json();
  },

  // Validate voucher code
  validateVoucher: async (code) => {
    const response = await fetch(`${API_URL}/vouchers/validate/${code}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid voucher');
    }
    return response.json();
  }
};

// Import API endpoints
export const importAPI = {
  getAll: async () => {
    const response = await fetchWithAuth(`${API_URL}/imports`);
    if (!response.ok) throw new Error('Failed to fetch imports');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetchWithAuth(`${API_URL}/imports/${id}`);
    if (!response.ok) throw new Error('Failed to fetch import');
    return response.json();
  },

  create: async (importData) => {
    const response = await fetchWithAuth(`${API_URL}/imports`, {
      method: 'POST',
      body: JSON.stringify(importData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create import');
    }
    return response.json();
  },

  update: async (id, importData) => {
    const response = await fetchWithAuth(`${API_URL}/imports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(importData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update import');
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await fetchWithAuth(`${API_URL}/imports/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete import');
    }
    return response.json();
  }
};
