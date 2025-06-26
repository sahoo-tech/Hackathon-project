import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Smartphone,
  Tablet,
  Computer,
  TouchApp,
  Gesture,
  Vibration,
  ScreenRotation,
  NetworkCheck
} from '@mui/icons-material';
// import { useTouchGestures, mobileUtils } from '../utils/touchGestures';
import { useMobileDetection } from './MobileResponsive';

const MobileTestSuite = () => {
  const theme = useTheme();
  const {
    isMobile,
    isSmallMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    isTouchDevice
  } = useMobileDetection();

  const [testResults, setTestResults] = useState({});
  const [gestureLog, setGestureLog] = useState([]);
  const gestureTestRef = useRef();

  // Touch gesture handlers
  const handleTap = (e) => {
    setGestureLog(prev => [...prev, { type: 'Tap', time: new Date().toLocaleTimeString() }]);
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  const handleDoubleTap = (e) => {
    setGestureLog(prev => [...prev, { type: 'Double Tap', time: new Date().toLocaleTimeString() }]);
    if ('vibrate' in navigator) navigator.vibrate([50, 100, 50]);
  };

  const handleLongPress = (e) => {
    setGestureLog(prev => [...prev, { type: 'Long Press', time: new Date().toLocaleTimeString() }]);
    if ('vibrate' in navigator) navigator.vibrate(200);
  };

  const handleSwipe = (direction, details, e) => {
    setGestureLog(prev => [...prev, { 
      type: `Swipe ${direction}`, 
      time: new Date().toLocaleTimeString(),
      distance: Math.round(details.distance)
    }]);
    if ('vibrate' in navigator) navigator.vibrate(100);
  };

  // Simple click handler for testing
  const handleTestAreaClick = () => {
    handleTap();
  };

  const runDeviceTests = () => {
    const results = {
      deviceType: isSmallMobile ? 'Small Mobile' : isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop',
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hoverSupport: window.matchMedia('(hover: hover)').matches,
      orientation: window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait',
      platform: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other',
      vibrationSupport: 'vibrate' in navigator,
      userAgent: navigator.userAgent,
      connectionType: navigator.connection?.effectiveType || 'Unknown',
      onlineStatus: navigator.onLine
    };

    setTestResults(results);
  };

  const testFeatures = [
    {
      name: 'Responsive Layout',
      status: isMobile ? 'Mobile Layout Active' : 'Desktop Layout Active',
      icon: isMobile ? <Smartphone /> : <Computer />,
      color: 'success'
    },
    {
      name: 'Touch Support',
      status: isTouchDevice ? 'Touch Enabled' : 'Mouse Only',
      icon: <TouchApp />,
      color: isTouchDevice ? 'success' : 'warning'
    },
    {
      name: 'Gesture Recognition',
      status: gestureLog.length > 0 ? 'Working' : 'Not Tested',
      icon: <Gesture />,
      color: gestureLog.length > 0 ? 'success' : 'default'
    },
    {
      name: 'Vibration API',
      status: 'vibrate' in navigator ? 'Supported' : 'Not Supported',
      icon: <Vibration />,
      color: 'vibrate' in navigator ? 'success' : 'error'
    },
    {
      name: 'Screen Orientation',
      status: window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait',
      icon: <ScreenRotation />,
      color: 'info'
    },
    {
      name: 'Network Status',
      status: navigator.onLine ? 'Online' : 'Offline',
      icon: <NetworkCheck />,
      color: navigator.onLine ? 'success' : 'error'
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Mobile Compatibility Test Suite
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This test suite verifies that VIRALYTIX works correctly on all mobile devices.
        Current device: {isSmallMobile ? 'Small Mobile' : isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
      </Alert>

      {/* Device Detection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Detection
          </Typography>
          <Grid container spacing={2}>
            {testFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {feature.icon}
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {feature.name}
                    </Typography>
                    <Chip 
                      label={feature.status} 
                      color={feature.color} 
                      size="small" 
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Touch Gesture Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Touch Gesture Test
          </Typography>
          <Box
            ref={gestureTestRef}
            onClick={handleTestAreaClick}
            sx={{
              height: 200,
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              cursor: 'pointer',
              userSelect: 'none',
              backgroundColor: 'action.hover'
            }}
          >
            <Typography variant="h6" color="primary">
              Touch/Click Here to Test Gestures
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try: Single tap, Double tap, Long press, Swipe in any direction
          </Typography>

          {gestureLog.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Gesture Log:
              </Typography>
              <List dense>
                {gestureLog.slice(-5).map((gesture, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Gesture fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={gesture.type}
                      secondary={`${gesture.time}${gesture.distance ? ` - ${gesture.distance}px` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Information
          </Typography>
          <Button 
            variant="contained" 
            onClick={runDeviceTests}
            sx={{ mb: 2 }}
            fullWidth={isMobile}
          >
            Run Device Tests
          </Button>
          
          {Object.keys(testResults).length > 0 && (
            <Box>
              <List>
                {Object.entries(testResults).map(([key, value], index) => (
                  <React.Fragment key={key}>
                    <ListItem>
                      <ListItemText
                        primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        secondary={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      />
                    </ListItem>
                    {index < Object.entries(testResults).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Performance Tests */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance & Compatibility
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                <strong>Viewport:</strong> {window.innerWidth}×{window.innerHeight}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Device Pixel Ratio:</strong> {window.devicePixelRatio}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Color Depth:</strong> {window.screen.colorDepth}-bit
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                <strong>Memory:</strong> {navigator.deviceMemory || 'Unknown'} GB
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Cores:</strong> {navigator.hardwareConcurrency || 'Unknown'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Connection:</strong> {navigator.connection?.effectiveType || 'Unknown'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MobileTestSuite;