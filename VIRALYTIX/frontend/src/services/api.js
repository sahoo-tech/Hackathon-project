import axios from 'axios';
import backendService from './backendService';

// Determine the base URL based on the environment
const getBaseUrl = () => {
  // If we have a custom backend URL set (highest priority)
  if (process.env.REACT_APP_BACKEND_URL) {
    return `${process.env.REACT_APP_BACKEND_URL}/api`;
  }
  
  // If running on Vercel in production, use direct backend URL to avoid CORS issues
  if (process.env.VERCEL && process.env.NODE_ENV === 'production') {
    return 'https://viralytix-backend.onrender.com/api';
  }
  
  // If running on Vercel in development, use relative path for API
  if (process.env.VERCEL) {
    return '/api';
  }
  
  // Production environment - using Render backend URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://viralytix-backend.onrender.com/api';
  }
  
  // For local development
  return 'http://localhost:8000/api';
};

// Create an axios instance with default config
const baseURL = getBaseUrl();
console.log('API Base URL:', baseURL); // Debug log

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000, // Increased timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Update backend service status on successful response
    backendService.updateStatus(true);
    return response;
  },
  (error) => {
    // Check if it's a network error (backend offline)
    if (!error.response && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')) {
      // Update backend service status
      backendService.updateStatus(false);
    }
    
    // Handle 401 Unauthorized errors, but don't redirect for certain endpoints
    if (error.response && error.response.status === 401) {
      const url = error.config.url;
      // Don't redirect for simulation endpoints or DAO endpoints - they will fallback to public endpoints
      if (!url.includes('/simulation/') && !url.includes('/blockchain/dao/')) {
        // Clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/token', { username, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/users/me');
    return response.data;
  }
};

// Mutation services
export const mutationService = {
  getAllMutations: async () => {
    const response = await api.get('/mutations');
    return response.data;
  },
  getMutation: async (id) => {
    const response = await api.get(`/mutations/${id}`);
    return response.data;
  },
  createMutation: async (mutationData) => {
    const response = await api.post('/mutations', mutationData);
    return response.data;
  },
  verifyMutation: async (id) => {
    const response = await api.put(`/mutations/${id}/verify`);
    return response.data;
  }
};

// Outbreak services
export const outbreakService = {
  getAllOutbreaks: async () => {
    const response = await api.get('/outbreaks');
    return response.data;
  },
  getOutbreak: async (id) => {
    const response = await api.get(`/outbreaks/${id}`);
    return response.data;
  },
  createOutbreak: async (outbreakData) => {
    const response = await api.post('/outbreaks', outbreakData);
    return response.data;
  },
  updateOutbreak: async (id, updateData) => {
    const response = await api.put(`/outbreaks/${id}`, updateData);
    return response.data;
  },
  getOutbreakPredictions: async (id) => {
    const response = await api.get(`/outbreaks/${id}/predictions`);
    return response.data;
  }
};

// Prediction services
export const predictionService = {
  runPrediction: async (predictionData) => {
    const response = await api.post('/predictions/run', predictionData);
    return response.data;
  },
  getPredictions: async (filters = {}) => {
    const response = await api.get('/predictions/', { params: filters });
    return response.data;
  },
  getPrediction: async (id) => {
    const response = await api.get(`/predictions/${id}`);
    return response.data;
  },
  getGlobalHotspots: async (filters = {}) => {
    const response = await api.get('/predictions/global/hotspots', { params: filters });
    return response.data;
  }
};

// Sensor services
export const sensorService = {
  submitSensorData: async (sensorData) => {
    const response = await api.post('/sensors/data', sensorData);
    return response.data;
  },
  getSensorData: async (filters = {}) => {
    const response = await api.get('/sensors/data', { params: filters });
    return response.data;
  },
  getSensorSummary: async () => {
    const response = await api.get('/sensors/summary');
    return response.data;
  },
  getAnomalies: async (filters = {}) => {
    const response = await api.get('/sensors/anomalies', { params: filters });
    return response.data;
  }
};

// Blockchain services
export const blockchainService = {
  createRecord: async (recordData) => {
    const response = await api.post('/blockchain/record', recordData);
    return response.data;
  },
  getRecords: async (filters = {}) => {
    const response = await api.get('/blockchain/records', { params: filters });
    return response.data;
  },
  getRecord: async (id) => {
    const response = await api.get(`/blockchain/records/${id}`);
    return response.data;
  },
  createDAOProposal: async (proposalData) => {
    try {
      // Try authenticated endpoint first
      const response = await api.post('/blockchain/dao/proposals', proposalData);
      return response.data;
    } catch (error) {
      // Fall back to public endpoint if authentication fails
      console.log('Using public endpoint for creating proposal');
      const response = await api.post('/blockchain/dao/proposals/public', proposalData);
      return response.data;
    }
  },
  getDAOProposals: async (filters = {}) => {
    try {
      // Try authenticated endpoint first
      const response = await api.get('/blockchain/dao/proposals', { params: filters });
      return response.data;
    } catch (error) {
      // Fall back to public endpoint if authentication fails
      console.log('Using public endpoint for fetching proposals');
      const response = await api.get('/blockchain/dao/proposals/public', { params: filters });
      return response.data;
    }
  },
  voteOnProposal: async (voteData) => {
    try {
      // Try authenticated endpoint first
      const response = await api.post('/blockchain/dao/vote', voteData);
      return response.data;
    } catch (error) {
      // Fall back to public endpoint if authentication fails
      console.log('Using public endpoint for voting');
      const response = await api.post('/blockchain/dao/vote/public', voteData);
      return response.data;
    }
  }
};

// LLM services
export const llmService = {
  explainMutation: async (requestData) => {
    const response = await api.post('/llm/explain-mutation', requestData);
    return response.data;
  },
  generateOutbreakPlan: async (requestData) => {
    const response = await api.post('/llm/outbreak-plan', requestData);
    return response.data;
  },
  darkWebSurveillance: async (requestData) => {
    const response = await api.post('/llm/dark-web-surveillance', requestData);
    return response.data;
  }
};

// Simulation services
export const simulationService = {
  runCityTwinSimulation: async (simulationData) => {
    // For demo purposes, always use the mock endpoint
    console.log('Using mock city twin simulation endpoint');
    const response = await api.post('/simulation/city-twin/mock', simulationData);
    return response.data;
  },
  getCitySimulation: async (id) => {
    const response = await api.get(`/simulation/city-twin/${id}`);
    return response.data;
  },
  runPolicySimulation: async (simulationData) => {
    // For demo purposes, always use the mock endpoint
    console.log('Using mock policy simulation endpoint');
    const response = await api.post('/simulation/policy/mock', simulationData);
    return response.data;
  },
  getPolicySimulation: async (id) => {
    const response = await api.get(`/simulation/policy/${id}`);
    return response.data;
  }
};

// Anonymous Alert services
export const anonymousAlertService = {
  submitAlert: async (alertData) => {
    const response = await api.post('/anonymous-alert/submit', alertData);
    return response.data;
  },
  getAlerts: async () => {
    const response = await api.get('/anonymous-alert/alerts');
    return response.data;
  },
  getAlert: async (id) => {
    const response = await api.get(`/anonymous-alert/alerts/${id}`);
    return response.data;
  }
};

// Health check service
export const healthService = {
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
  checkRoot: async () => {
    const response = await api.get('/');
    return response.data;
  }
};

export default {
  authService,
  mutationService,
  outbreakService,
  predictionService,
  sensorService,
  blockchainService,
  llmService,
  simulationService,
  anonymousAlertService,
  healthService
};