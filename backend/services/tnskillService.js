const axios = require('axios');

class TNSkillService {
  constructor() {
    this.baseURL = process.env.TNSKILL_API_URL || 'https://www.skilldevelopment.tn.gov.in/api/v1';
    this.clientKey = process.env.TNSKILL_CLIENT_KEY;
    this.clientSecret = process.env.TNSKILL_CLIENT_SECRET;
    
    this.accessToken = null;
    this.refreshToken = null;
    this.isRefreshing = false;
    this.failedQueue = [];

    // Create an axios instance specifically for TNSkill
    this.api = axios.create({
      baseURL: this.baseURL,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to attach token
    this.api.interceptors.request.use(
      async (config) => {
        // Don't attach token for auth endpoints
        if (config.url.includes('/lms/client/token/')) {
          return config;
        }

        // If we don't have a token, fetch one initially
        if (!this.accessToken) {
          await this.authenticate();
        }

        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle 401s and refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return this.api(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('🔄 TNSkill Token expired. Attempting to refresh...');
            const newToken = await this.refreshAccessToken();
            
            // Process queued requests
            this.processQueue(null, newToken);
            
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            // If refresh fails, we might need to do a full re-auth
            console.log('⚠️ Token refresh failed, falling back to full authentication...');
            try {
              const newToken = await this.authenticate();
              originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
              return this.api(originalRequest);
            } catch (authError) {
              return Promise.reject(authError);
            }
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  async authenticate() {
    if (!this.clientKey || !this.clientSecret) {
      throw new Error('TNSkill credentials are not configured in .env');
    }

    try {
      console.log('🔑 Authenticating with TNSkill API...');
      
      const formData = new URLSearchParams();
      formData.append('client_key', this.clientKey);
      formData.append('client_secret', this.clientSecret);

      const response = await axios.post(`${this.baseURL}/lms/client/token/`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access || response.data.access_token;
      this.refreshToken = response.data.refresh || response.data.refresh_token;
      
      console.log('✅ Successfully authenticated with TNSkill API');
      return this.accessToken;
    } catch (error) {
      console.error('❌ TNSkill Authentication failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.baseURL}/lms/client/token/refresh/`, {
        refresh: this.refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.accessToken = response.data.access || response.data.access_token;
      if (response.data.refresh || response.data.refresh_token) {
        this.refreshToken = response.data.refresh || response.data.refresh_token;
      }

      console.log('✅ Successfully refreshed TNSkill token');
      return this.accessToken;
    } catch (error) {
      console.error('❌ TNSkill Token refresh failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Helper method to make requests
  async get(endpoint, config = {}) {
    return this.api.get(endpoint, config);
  }

  async post(endpoint, data, config = {}) {
    return this.api.post(endpoint, data, config);
  }

  async put(endpoint, data, config = {}) {
    return this.api.put(endpoint, data, config);
  }

  // TNSkill / KP API Integration Methods

  /**
   * Publish a course to TN Skill Development portal
   * @param {Object} courseData
   */
  async publishCourse(courseData) {
    try {
      const response = await this.post('/lms/client/course/publish/', courseData);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to publish course:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Push student progress update to TN Skill Development portal
   * @param {Object} progressData
   */
  async updateStudentProgress(progressData) {
    try {
      const response = await this.post('/lms/client/course/xf/', progressData);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update student progress:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new TNSkillService();
