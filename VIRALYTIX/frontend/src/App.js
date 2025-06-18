import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import MutationTracker from './pages/MutationTracker';
import OutbreakMap from './pages/OutbreakMap';
import Predictions from './pages/Predictions';
import Simulation from './pages/Simulation';
import DarkWebMonitor from './pages/DarkWebMonitor';
import DAO from './pages/DAO';
import Login from './pages/Login';
import AnonymousAlert from './pages/AnonymousAlert';
import EquityMap from './pages/EquityMap';
import ExplainabilityDashboard from './pages/ExplainabilityDashboard';
import MutationHeatmap from './pages/MutationHeatmap';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';

function App() {
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          p: isAuthenticated ? 3 : 0,
          width: '100%',
          mt: isAuthenticated ? 8 : 0,
          ml: isAuthenticated ? (sidebarOpen ? '240px' : 0) : 0,
          transition: 'margin 0.2s',
        }}
      >
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? 
              <Navigate to="/" /> : 
              <Login onLogin={handleLogin} />
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
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;