// Utility functions for Render backend management

/**
 * Wake up Render backend service with optimized cold start strategy
 * Render services go to sleep after 15 minutes of inactivity
 * Cold starts can take 30-60 seconds, so we need a patient approach
 */
export const wakeUpRenderService = async (baseURL, maxRetries = 3, retryDelay = 5000) => {
  console.log('🚀 Starting Render service wake-up process...');
  console.log('⏱️  Cold starts may take 30-60 seconds, please be patient');
  
  // Use health endpoint first as it's faster to respond once the service is up
  const endpoints = ['/health', '/'];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Wake-up attempt ${attempt}/${maxRetries}`);
    
    try {
      // For cold starts, we need longer timeouts
      const coldStartTimeout = attempt === 1 ? 45000 : 30000; // First attempt gets more time
      
      // Try endpoints sequentially for better success rate
      for (const endpoint of endpoints) {
        try {
          console.log(`   Trying ${endpoint} endpoint...`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), coldStartTimeout);
          
          const startTime = Date.now();
          const response = await fetch(`${baseURL}${endpoint}`, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Accept': 'application/json',
              'User-Agent': 'VIRALYTIX-Frontend/1.0'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            console.log(`✅ Backend woke up successfully on attempt ${attempt} using ${endpoint} (${responseTime}ms)`);
            
            // If it was a cold start (took more than 10 seconds), log it
            if (responseTime > 10000) {
              console.log(`❄️  Cold start detected - took ${(responseTime/1000).toFixed(1)}s to wake up`);
            }
            
            return { success: true, attempt, endpoint, responseTime, coldStart: responseTime > 10000 };
          } else {
            console.log(`   ${endpoint} returned ${response.status}`);
          }
        } catch (endpointError) {
          if (endpointError.name === 'AbortError') {
            console.log(`   ${endpoint} timed out after ${coldStartTimeout/1000}s`);
          } else {
            console.log(`   ${endpoint} failed: ${endpointError.message}`);
          }
          continue; // Try next endpoint
        }
      }
    } catch (error) {
      console.log(`❌ Wake-up attempt ${attempt} failed: ${error.message}`);
    }
    
    // If not the last attempt, wait before retrying
    if (attempt < maxRetries) {
      console.log(`⏳ Waiting ${retryDelay/1000} seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  console.log('💥 Failed to wake up backend after all attempts');
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
 * Monitor backend status with optimized backoff strategy
 */
export const monitorBackendStatus = async (
  checkFunction, 
  maxAttempts = 8, 
  initialDelay = 1000,
  maxDelay = 5000
) => {
  let currentDelay = initialDelay;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isOnline = await checkFunction();
      if (isOnline) {
        console.log(`Backend status confirmed online on attempt ${attempt}`);
        return { success: true, attempt };
      }
    } catch (error) {
      console.log(`Status check attempt ${attempt} failed:`, error.message);
    }
    
    if (attempt < maxAttempts) {
      console.log(`Waiting ${currentDelay/1000} seconds before next status check...`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Linear backoff for faster response
      currentDelay = Math.min(currentDelay + 500, maxDelay);
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