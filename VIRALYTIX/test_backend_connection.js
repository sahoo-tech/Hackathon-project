// Test script to verify backend connection improvements
// This simulates the frontend's backend connection process

const axios = require('axios');

// Simulate the renderUtils functions
const isRenderService = (url) => {
  return url && url.includes('onrender.com');
};

const wakeUpRenderService = async (baseURL, maxRetries = 3, retryDelay = 5000) => {
  console.log('🚀 Starting Render service wake-up process...');
  console.log('⏱️  Cold starts may take 30-60 seconds, please be patient');
  
  const endpoints = ['/health', '/'];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Wake-up attempt ${attempt}/${maxRetries}`);
    
    try {
      const coldStartTimeout = attempt === 1 ? 45000 : 30000;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`   Trying ${endpoint} endpoint...`);
          const startTime = Date.now();
          
          const response = await axios.get(`${baseURL}${endpoint}`, {
            timeout: coldStartTimeout,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Accept': 'application/json',
              'User-Agent': 'VIRALYTIX-Test/1.0'
            }
          });
          
          const responseTime = Date.now() - startTime;
          
          if (response.status === 200) {
            console.log(`✅ Backend woke up successfully on attempt ${attempt} using ${endpoint} (${responseTime}ms)`);
            
            if (responseTime > 10000) {
              console.log(`❄️  Cold start detected - took ${(responseTime/1000).toFixed(1)}s to wake up`);
            }
            
            return { success: true, attempt, endpoint, responseTime, coldStart: responseTime > 10000 };
          } else {
            console.log(`   ${endpoint} returned ${response.status}`);
          }
        } catch (endpointError) {
          if (endpointError.code === 'ECONNABORTED') {
            console.log(`   ${endpoint} timed out after ${coldStartTimeout/1000}s`);
          } else {
            console.log(`   ${endpoint} failed: ${endpointError.message}`);
          }
          continue;
        }
      }
    } catch (error) {
      console.log(`❌ Wake-up attempt ${attempt} failed: ${error.message}`);
    }
    
    if (attempt < maxRetries) {
      console.log(`⏳ Waiting ${retryDelay/1000} seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  console.log('💥 Failed to wake up backend after all attempts');
  return { success: false, attempts: maxRetries };
};

const testBackendConnection = async () => {
  const backendURL = 'https://viralytix-backend.onrender.com';
  
  console.log('🧪 Testing Backend Connection Improvements');
  console.log('=' * 50);
  console.log(`Testing URL: ${backendURL}`);
  console.log('');
  
  if (isRenderService(backendURL)) {
    console.log('🔍 Detected Render service');
    
    const result = await wakeUpRenderService(backendURL);
    
    if (result.success) {
      console.log('');
      console.log('🎉 SUCCESS! Backend connection test passed');
      console.log(`   - Attempt: ${result.attempt}`);
      console.log(`   - Endpoint: ${result.endpoint}`);
      console.log(`   - Response time: ${result.responseTime}ms`);
      console.log(`   - Cold start: ${result.coldStart ? 'Yes' : 'No'}`);
    } else {
      console.log('');
      console.log('❌ FAILED! Backend connection test failed');
      console.log(`   - Attempts made: ${result.attempts}`);
    }
  } else {
    console.log('🏠 Local backend detected - testing quick connection...');
    
    try {
      const startTime = Date.now();
      const response = await axios.get(`${backendURL}/health`, { timeout: 10000 });
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        console.log(`✅ Local backend connected successfully (${responseTime}ms)`);
      }
    } catch (error) {
      console.log(`❌ Local backend connection failed: ${error.message}`);
    }
  }
};

// Run the test
testBackendConnection().catch(console.error);