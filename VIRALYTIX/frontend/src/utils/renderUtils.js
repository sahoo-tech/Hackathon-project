// Utility functions for Render backend management

/**
 * Wake up Render backend service
 * Render services go to sleep after 15 minutes of inactivity
 * This function helps wake them up by making multiple requests
 */
export const wakeUpRenderService = async (baseURL, maxRetries = 3, retryDelay = 5000) => {
  const endpoints = ['/', '/health'];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Wake-up attempt ${attempt}/${maxRetries}`);
    
    try {
      // Try multiple endpoints simultaneously
      const promises = endpoints.map(endpoint => 
        fetch(`${baseURL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          // Longer timeout for cold starts
          signal: AbortSignal.timeout(30000)
        })
      );
      
      // Wait for any endpoint to respond successfully
      const response = await Promise.any(promises);
      
      if (response.ok) {
        console.log(`Backend woke up successfully on attempt ${attempt}`);
        return { success: true, attempt };
      }
    } catch (error) {
      console.log(`Wake-up attempt ${attempt} failed:`, error.message);
      
      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        console.log(`Waiting ${retryDelay/1000} seconds before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  return { success: false, attempts: maxRetries };
};

/**
 * Check if URL is a Render service
 */
export const isRenderService = (url) => {
  return url && url.includes('onrender.com');
};

/**
 * Get estimated wake-up time for Render service
 */
export const getEstimatedWakeUpTime = () => {
  return 30; // seconds
};

/**
 * Create a wake-up URL for Render service
 * This can be used to create a direct link that users can click
 */
export const createWakeUpUrl = (baseURL) => {
  return `${baseURL}/health`;
};

/**
 * Monitor backend status with exponential backoff
 */
export const monitorBackendStatus = async (
  checkFunction, 
  maxAttempts = 10, 
  initialDelay = 1000,
  maxDelay = 30000
) => {
  let currentDelay = initialDelay;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isOnline = await checkFunction();
      if (isOnline) {
        return { success: true, attempt };
      }
    } catch (error) {
      console.log(`Status check attempt ${attempt} failed:`, error.message);
    }
    
    if (attempt < maxAttempts) {
      console.log(`Waiting ${currentDelay/1000} seconds before next status check...`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Exponential backoff with max delay
      currentDelay = Math.min(currentDelay * 1.5, maxDelay);
    }
  }
  
  return { success: false, attempts: maxAttempts };
};

const renderUtils = {
  wakeUpRenderService,
  isRenderService,
  getEstimatedWakeUpTime,
  createWakeUpUrl,
  monitorBackendStatus
};

export default renderUtils;