import axios from 'axios';
import { wakeUpRenderService, isRenderService, monitorBackendStatus } from '../utils/renderUtils';

// Backend service for connectivity management
class BackendService {
  constructor() {
    this.baseURL = this.getBaseURL();
    this.isOnline = false;
    this.lastCheckTime = null;
    this.checkInterval = null;
    this.listeners = [];
  }

  getBaseURL() {
    // Use the same logic as api.js
    if (process.env.REACT_APP_BACKEND_URL) {
      return process.env.REACT_APP_BACKEND_URL;
    }
    
    if (process.env.VERCEL && process.env.NODE_ENV === 'production') {
      return 'https://viralytix-backend.onrender.com';
    }
    
    if (process.env.VERCEL) {
      return '';
    }
    
    if (process.env.NODE_ENV === 'production') {
      return 'https://viralytix-backend.onrender.com';
    }
    
    return 'http://localhost:8000';
  }

  // Add listener for status changes
  addStatusListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of status change
  notifyListeners(status) {
    this.listeners.forEach(callback => callback(status));
  }

  // Check if backend is online
  async checkBackendStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const isHealthy = response.status === 200 && response.data.status === 'healthy';
      this.updateStatus(isHealthy);
      return isHealthy;
    } catch (error) {
      console.log('Backend health check failed:', error.message);
      this.updateStatus(false);
      return false;
    }
  }

  // Update status and notify listeners
  updateStatus(isOnline) {
    const wasOnline = this.isOnline;
    this.isOnline = isOnline;
    this.lastCheckTime = new Date();
    
    if (wasOnline !== isOnline) {
      this.notifyListeners({
        isOnline,
        lastCheckTime: this.lastCheckTime,
        statusChanged: true
      });
    }
  }

  // Wake up the backend (for Render cold starts)
  async wakeUpBackend() {
    try {
      // Check if this is a Render service
      if (isRenderService(this.baseURL)) {
        console.log('Detected Render service, using optimized wake-up strategy');
        const result = await wakeUpRenderService(this.baseURL);
        
        if (result.success) {
          // Monitor status to ensure it's fully online
          const statusResult = await monitorBackendStatus(
            () => this.checkBackendStatus(),
            5, // max attempts
            2000, // initial delay
            10000 // max delay
          );
          
          if (statusResult.success) {
            this.updateStatus(true);
            return { 
              success: true, 
              message: `Backend is now online! (Started in ${result.attempt} attempt${result.attempt > 1 ? 's' : ''})` 
            };
          }
        }
        
        return { 
          success: false, 
          message: 'Failed to start Render backend. The service may be experiencing issues.' 
        };
      } else {
        // For non-Render services, use the original approach
        const wakeUpPromise = axios.get(`${this.baseURL}/`, {
          timeout: 30000,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        const healthPromise = axios.get(`${this.baseURL}/health`, {
          timeout: 30000,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        const response = await Promise.race([wakeUpPromise, healthPromise]);
        
        if (response.status === 200) {
          this.updateStatus(true);
          return { success: true, message: 'Backend is now online!' };
        }
      }
    } catch (error) {
      console.error('Failed to wake up backend:', error);
      this.updateStatus(false);
      return { 
        success: false, 
        message: 'Failed to start backend. Please try again in a few moments.' 
      };
    }
  }

  // Start periodic health checks
  startHealthChecks(intervalMs = 30000) { // Check every 30 seconds
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Initial check
    this.checkBackendStatus();
    
    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkBackendStatus();
    }, intervalMs);
  }

  // Stop periodic health checks
  stopHealthChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Get current status
  getStatus() {
    return {
      isOnline: this.isOnline,
      lastCheckTime: this.lastCheckTime,
      baseURL: this.baseURL
    };
  }

  // Force immediate status check
  async forceStatusCheck() {
    return await this.checkBackendStatus();
  }
}

// Create singleton instance
const backendService = new BackendService();

export default backendService;