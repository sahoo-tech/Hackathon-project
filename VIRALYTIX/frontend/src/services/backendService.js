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

  // Check if backend is online with improved error handling
  async checkBackendStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout
      
      const response = await axios.get(`${this.baseURL}/health`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        // Add retry configuration
        validateStatus: (status) => status < 500, // Accept 4xx as valid responses
      });
      
      clearTimeout(timeoutId);
      
      const isHealthy = response.status === 200 && response.data.status === 'healthy';
      this.updateStatus(isHealthy);
      return isHealthy;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Backend health check timed out');
      } else {
        console.log('Backend health check failed:', error.message);
      }
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

  // Wake up the backend with improved cold start handling
  async wakeUpBackend() {
    try {
      // Check if this is a Render service
      if (isRenderService(this.baseURL)) {
        console.log('🔍 Detected Render service, using cold start optimized strategy');
        
        // Use optimized wake-up strategy for Render
        const result = await wakeUpRenderService(this.baseURL, 3, 5000); // More retries, longer delays for cold starts
        
        if (result.success) {
          // If it was a cold start, give it a moment to fully initialize
          if (result.coldStart) {
            console.log('❄️  Cold start detected, allowing time for full initialization...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
          // Monitor status with appropriate timing for cold starts
          const statusResult = await monitorBackendStatus(
            () => this.checkBackendStatus(),
            6, // reasonable attempts
            2000, // longer initial delay for cold starts
            8000 // longer max delay
          );
          
          if (statusResult.success) {
            this.updateStatus(true);
            const message = result.coldStart 
              ? `Backend started successfully! (Cold start took ${(result.responseTime/1000).toFixed(1)}s)`
              : `Backend is now online! (Connected in ${statusResult.attempt} attempt${statusResult.attempt > 1 ? 's' : ''})`;
            
            return { success: true, message };
          } else {
            // Even if monitoring failed, the wake-up succeeded, so try once more
            const finalCheck = await this.checkBackendStatus();
            if (finalCheck) {
              this.updateStatus(true);
              return { 
                success: true, 
                message: 'Backend is online! (Connection verified after wake-up)' 
              };
            }
          }
        }
        
        return { 
          success: false, 
          message: 'Failed to start backend. This might be due to a cold start taking longer than expected. Please wait a moment and try again.' 
        };
      } else {
        // For local/non-Render services, use faster approach
        console.log('🏠 Local backend detected, using fast connection strategy');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Shorter timeout for local
        
        try {
          // Try health endpoint first as it's faster
          const healthResponse = await axios.get(`${this.baseURL}/health`, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (healthResponse.status === 200) {
            this.updateStatus(true);
            return { success: true, message: 'Local backend is online!' };
          }
        } catch (healthError) {
          // If health fails, try root endpoint
          try {
            const rootResponse = await axios.get(`${this.baseURL}/`, {
              signal: controller.signal,
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (rootResponse.status === 200) {
              this.updateStatus(true);
              return { success: true, message: 'Local backend is online!' };
            }
          } catch (rootError) {
            clearTimeout(timeoutId);
            throw rootError;
          }
        }
        
        return { 
          success: false, 
          message: 'Local backend is not responding. Please make sure it is running.' 
        };
      }
    } catch (error) {
      console.error('Failed to wake up backend:', error);
      this.updateStatus(false);
      
      // Provide more specific error messages
      if (error.name === 'AbortError') {
        return { 
          success: false, 
          message: 'Connection timed out. The backend might be starting up - please try again in a moment.' 
        };
      } else if (error.code === 'ECONNREFUSED') {
        return { 
          success: false, 
          message: 'Connection refused. Please check if the backend server is running.' 
        };
      } else {
        return { 
          success: false, 
          message: 'Failed to connect to backend. Please try again in a few moments.' 
        };
      }
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