import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BackendStatusNotification from './components/BackendStatusNotification';

// Pages
import Dashboard from './pages/Dashboard';
import MutationTracker from './pages/MutationTracker';
import OutbreakMap from './pages/OutbreakMap';
import Predictions from './pages/Predictions';
import Simulation from './pages/Simulation';
import DarkWebMonitor from './pages/DarkWebMonitor';
import DAO from './pages/DAO';
import Login from './pages/Login';
import Register from './pages/Register';
import AnonymousAlert from './pages/AnonymousAlert';
import EquityMap from './pages/EquityMap';
import ExplainabilityDashboard from './pages/ExplainabilityDashboard';
import MutationHeatmap from './pages/MutationHeatmap';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import HelpSupport from './pages/HelpSupport';
import MobileTestSuite from './components/MobileTestSuite';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Check localStorage for existing auth data
  const checkAuthFromStorage = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        return {
          isAuthenticated: true,
          user: JSON.parse(storedUser)
        };
      } catch (e) {
        // If JSON parsing fails, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    return {
      isAuthenticated: false,
      user: null
    };
  };
  
  const initialAuth = checkAuthFromStorage();
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.isAuthenticated);
  const [user, setUser] = useState(initialAuth.user);
  // On mobile, sidebar should be closed by default
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear authentication state
    setIsAuthenticated(false);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when switching to mobile view
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Backend Status Notification - Always visible */}
      <BackendStatusNotification />
      
      {isAuthenticated && (
        <>
          <Navbar 
            toggleSidebar={toggleSidebar} 
            user={user} 
            onLogout={handleLogout} 
          />
          <Sidebar 
            open={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            user={user}
          />
        </>
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isAuthenticated ? (isMobile ? 1 : 3) : 0,
          width: '100%',
          mt: isAuthenticated ? 8 : 0,
          ml: isAuthenticated ? (isMobile ? 0 : (sidebarOpen ? '240px' : 0)) : 0,
          transition: 'margin 0.2s',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? 
              <Navigate to="/" /> : 
              <Login onLogin={handleLogin} />
          } />
          
          <Route path="/register" element={
            isAuthenticated ? 
              <Navigate to="/" /> : 
              <Register onLogin={handleLogin} />
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/mutations" element={
            <ProtectedRoute>
              <MutationTracker />
            </ProtectedRoute>
          } />
          
          <Route path="/outbreaks" element={
            <ProtectedRoute>
              <OutbreakMap />
            </ProtectedRoute>
          } />
          
          <Route path="/predictions" element={
            <ProtectedRoute>
              <Predictions />
            </ProtectedRoute>
          } />
          
          <Route path="/simulation" element={
            <ProtectedRoute>
              <Simulation />
            </ProtectedRoute>
          } />
          
          <Route path="/simulation/city-twin" element={
            <ProtectedRoute>
              <Simulation initialTab={0} />
            </ProtectedRoute>
          } />
          
          <Route path="/simulation/policy" element={
            <ProtectedRoute>
              <Simulation initialTab={1} />
            </ProtectedRoute>
          } />
          
          <Route path="/dark-web" element={
            <ProtectedRoute>
              <DarkWebMonitor />
            </ProtectedRoute>
          } />
          
          <Route path="/dao" element={
            <ProtectedRoute>
              <DAO />
            </ProtectedRoute>
          } />
          
          <Route path="/anonymous-alert" element={
            <AnonymousAlert />
          } />
          
          <Route path="/equity-map" element={
            <ProtectedRoute>
              <EquityMap />
            </ProtectedRoute>
          } />
          
          <Route path="/explainability" element={
            <ProtectedRoute>
              <ExplainabilityDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/mutation-heatmap" element={
            <ProtectedRoute>
              <MutationHeatmap />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="/help" element={
            <ProtectedRoute>
              <HelpSupport />
            </ProtectedRoute>
          } />
          
          <Route path="/mobile-test" element={
            <ProtectedRoute>
              <MobileTestSuite />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;