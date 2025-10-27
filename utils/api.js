// utils/api.js
export class ApiError extends Error {
  constructor(message, status, statusText) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend-t8pl.onrender.com',
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced fetch with retry logic and error handling
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeout = apiConfig.timeout,
    retryAttempts = apiConfig.retryAttempts,
    retryDelay = apiConfig.retryDelay,
    ...otherOptions
  } = options;

  // Validate backend URL
  if (!apiConfig.baseUrl) {
    throw new ApiError(
      'Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.',
      0,
      'Configuration Error'
    );
  }

  // Fixed: Use proper template literal with backticks
  const url = `${apiConfig.baseUrl}${endpoint}`;
  console.log('🔗 API Request:', { url, method, baseUrl: apiConfig.baseUrl, endpoint });
  const controller = new AbortController();
  
  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    signal: controller.signal,
    ...otherOptions,
  };

  // Add body if provided
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let lastError;

  // Retry logic
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      console.log(`🔄 Fetch attempt ${attempt + 1}: ${url}`);
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);
      console.log(`📥 Response: ${response.status} ${response.statusText}`);

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        
        // Don't retry authentication errors
        if (response.status === 401) {
          throw new ApiError('Authentication required', response.status, response.statusText);
        }
        
        // Don't retry client errors (4xx), only server errors (5xx)
        if (response.status < 500 && attempt === retryAttempts) {
          throw new ApiError(
            `Request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
            response.status,
            response.statusText
          );
        }
        
        // For server errors, continue to retry
        if (response.status >= 500 && attempt < retryAttempts) {
          lastError = new ApiError(
            `Server error: ${response.status} ${response.statusText}`,
            response.status,
            response.statusText
          );
          await delay(retryDelay * (attempt + 1)); // Exponential backoff
          continue;
        }
        
        throw new ApiError(
          `Request failed: ${response.status} ${response.statusText}`,
          response.status,
          response.statusText
        );
      }

      // Try to parse response as JSON, fallback to text
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ Successfully parsed response from ${url}`);
        return data;
      } else {
        const text = await response.text();
        console.log(`✅ Received text response from ${url}`);
        return text;
      }

    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout errors
      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out', 0, 'Timeout');
      }
      
      // Handle network errors
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        lastError = new ApiError('Network error - please check your connection', 0, 'Network Error');
      } else if (error instanceof ApiError) {
        lastError = error;
      } else {
        lastError = new ApiError(error.message || 'Unknown error occurred', 0, 'Unknown Error');
      }
      
      // If this is the last attempt or it's an auth error, throw the error
      if (attempt === retryAttempts || error instanceof ApiError && error.status === 401) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      await delay(retryDelay * (attempt + 1));
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

// Convenience methods for different HTTP verbs
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

// Admin-specific API calls
export const adminApi = {
  // Get current admin user
  getMe: () => api.get('/api/admin/me'),
  
  // Logout
  logout: () => api.post('/api/admin/logout'),
  
  // Get dashboard stats
  getStats: () => api.get('/api/admin/stats'),
  
  // Get users
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get reports
  getReports: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/admin/reports${queryString ? `?${queryString}` : ''}`);
  },
};

// Hook for handling API errors in components
export function useApiError() {
  const handleError = (error) => {
    console.error('API Error:', error);
    
    // Handle different error types
    if (error instanceof ApiError) {
      if (error.status === 401) {
        // Redirect to login on authentication errors
        window.location.href = '/admin/login';
        return 'Authentication required. Redirecting to login...';
      } else if (error.status === 0) {
        // Network or timeout errors
        return error.message;
      } else {
        // Other API errors
        return `Error ${error.status}: ${error.message}`;
      }
    }
    
    // Generic error fallback
    return 'An unexpected error occurred. Please try again.';
  };

  return { handleError };
}

// Staff-specific API calls
export const staffApi = {
  getAll: () => api.get('/api/staff'),
  getById: (id) => api.get(`/api/staff/${id}`),
  create: (data) => api.post('/api/staff', data),
  update: (id, data) => api.put(`/api/staff/${id}`, data),
  delete: (id) => api.delete(`/api/staff/${id}`),
};