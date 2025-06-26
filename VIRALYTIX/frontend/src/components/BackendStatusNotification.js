import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  CircularProgress,
  Slide,
  Paper,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CloudOff,
  Refresh,
  Close,
  PlayArrow,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import backendService from '../services/backendService';

// Floating animation
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Pulse animation for the start button
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const FloatingNotification = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 9999,
  padding: theme.spacing(3),
  borderRadius: '16px',
  minWidth: '400px',
  maxWidth: '500px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  animation: `${float} 3s ease-in-out infinite`,
  border: '1px solid rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  [theme.breakpoints.down('md')]: {
    top: '10px',
    right: '10px',
    left: '10px',
    minWidth: 'auto',
    maxWidth: 'none',
    padding: theme.spacing(2),
    borderRadius: '12px',
  },
  [theme.breakpoints.down('sm')]: {
    top: '5px',
    right: '5px',
    left: '5px',
    padding: theme.spacing(1.5),
    borderRadius: '8px',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 'bold',
  fontSize: '0.75rem',
  height: '24px',
  ...(status === 'online' && {
    backgroundColor: '#4caf50',
    color: 'white',
  }),
  ...(status === 'offline' && {
    backgroundColor: '#f44336',
    color: 'white',
  }),
  ...(status === 'connecting' && {
    backgroundColor: '#ff9800',
    color: 'white',
  }),
}));

const StartButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: '25px',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  fontWeight: 'bold',
  fontSize: '1rem',
  textTransform: 'none',
  animation: `${pulse} 2s ease-in-out infinite`,
  '&:hover': {
    background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
    transform: 'scale(1.02)',
  },
  '&:disabled': {
    background: 'rgba(255,255,255,0.3)',
    color: 'rgba(255,255,255,0.7)',
    animation: 'none',
  }
}));

const RefreshButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  backgroundColor: 'rgba(255,255,255,0.2)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: 'rotate(180deg)',
  },
  transition: 'all 0.3s ease',
}));

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const BackendStatusNotification = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [status, setStatus] = useState({
    isOnline: false,
    lastCheckTime: null,
    show: false,
    statusChanged: false
  });
  const [isStarting, setIsStarting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for status changes
    const unsubscribe = backendService.addStatusListener((newStatus) => {
      setStatus(prevStatus => ({
        ...newStatus,
        show: !newStatus.isOnline || newStatus.statusChanged
      }));

      // Show success message when backend comes online
      if (newStatus.isOnline && newStatus.statusChanged) {
        setShowSuccess(true);
        setMessage('Successfully connected to backend!');
        setTimeout(() => setShowSuccess(false), 4000);
      }
    });

    // Start health checks
    backendService.startHealthChecks();

    // Initial status check
    const initialStatus = backendService.getStatus();
    setStatus({
      ...initialStatus,
      show: !initialStatus.isOnline,
      statusChanged: false
    });

    return () => {
      unsubscribe();
      backendService.stopHealthChecks();
    };
  }, []);

  const handleStartBackend = async () => {
    setIsStarting(true);
    setMessage('Starting backend server...');
    
    try {
      const result = await backendService.wakeUpBackend();
      
      if (result.success) {
        setShowSuccess(true);
        setMessage(result.message);
        // Hide the main notification after successful start
        setTimeout(() => {
          setStatus(prev => ({ ...prev, show: false }));
        }, 2000);
      } else {
        setShowError(true);
        setMessage(result.message);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error) {
      setShowError(true);
      setMessage('Failed to start backend. Please try again.');
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsStarting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await backendService.forceStatusCheck();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleClose = () => {
    setStatus(prev => ({ ...prev, show: false }));
  };

  const handleLoginRedirect = () => {
    // Clear any existing authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Force a complete page reload to the login page
    window.location.replace('/login');
  };

  if (!status.show && !showSuccess && !showError) {
    return null;
  }

  return (
    <>
      {/* Main Backend Status Notification */}
      {status.show && (
        <FloatingNotification elevation={8}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <CloudOff sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="bold">
                Backend Status
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <StatusChip 
                label={status.isOnline ? 'Online' : 'Offline'} 
                status={status.isOnline ? 'online' : 'offline'}
                icon={status.isOnline ? <CheckCircle /> : <Error />}
              />
              <RefreshButton 
                size="small" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <Refresh sx={{ 
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
              </RefreshButton>
              <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            sx={{ 
              mb: 3, 
              opacity: 0.9,
              fontSize: isSmallMobile ? '0.875rem' : undefined,
              lineHeight: isSmallMobile ? 1.4 : undefined
            }}
          >
            {status.isOnline 
              ? "Backend is online and ready!"
              : "The backend is currently offline. Click the start button below to activate the backend and access all VIRALYTIX features."
            }
          </Typography>

          {!status.isOnline && (
            <Box 
              display="flex" 
              gap={isMobile ? 1 : 2} 
              alignItems="center"
              flexDirection={isSmallMobile ? "column" : "row"}
            >
              <StartButton
                onClick={handleStartBackend}
                disabled={isStarting}
                startIcon={isStarting ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                size={isMobile ? "small" : "medium"}
                fullWidth={isSmallMobile}
              >
                {isStarting ? 'Starting...' : 'Start Backend'}
              </StartButton>
              
              {status.lastCheckTime && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.7,
                    fontSize: isSmallMobile ? '0.7rem' : undefined,
                    textAlign: isSmallMobile ? 'center' : 'left'
                  }}
                >
                  Last checked: {status.lastCheckTime.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          )}

          {status.isOnline && (
            <Box display="flex" gap={isMobile ? 1 : 2} justifyContent={isSmallMobile ? "center" : "flex-start"}>
              <Button
                variant="contained"
                onClick={handleLoginRedirect}
                size={isMobile ? "small" : "medium"}
                fullWidth={isSmallMobile}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                Go to Login
              </Button>
            </Box>
          )}
        </FloatingNotification>
      )}

      {/* Success Notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 10 }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
          }}
        >
          <AlertTitle>Success!</AlertTitle>
          {message}
        </Alert>
      </Snackbar>

      {/* Error Notification */}
      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 10 }}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="error" 
          variant="filled"
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(244, 67, 54, 0.3)'
          }}
        >
          <AlertTitle>Connection Error</AlertTitle>
          {message}
        </Alert>
      </Snackbar>

      {/* Starting Backend Notification */}
      <Snackbar
        open={isStarting}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          variant="filled"
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(2, 136, 209, 0.3)'
          }}
          icon={<CircularProgress size={20} color="inherit" />}
        >
          <AlertTitle>Please Wait</AlertTitle>
          Starting backend server... This may take up to 30 seconds.
        </Alert>
      </Snackbar>
    </>
  );
};

export default BackendStatusNotification;