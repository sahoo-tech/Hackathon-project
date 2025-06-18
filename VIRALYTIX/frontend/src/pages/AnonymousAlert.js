import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Snackbar, 
  Alert, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Stepper, 
  Step, 
  StepLabel, 
  Divider, 
  Card, 
  CardContent, 
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TokenIcon from '@mui/icons-material/Token';
import MultilingualVoiceAlert from '../components/MultilingualVoiceAlert';
import { anonymousAlertService } from '../services/api';

// Default token reward data (will be overridden by API response)
const DEFAULT_REWARD_TOKENS = 5;
const DEFAULT_TOKEN_SYMBOL = 'VTX';

const AnonymousAlert = () => {
  // State for form fields
  const [activeStep, setActiveStep] = useState(0);
  const [alertText, setAlertText] = useState('');
  const [location, setLocation] = useState('');
  const [alertType, setAlertType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [contactInfo, setContactInfo] = useState('');
  const [alertLanguage, setAlertLanguage] = useState('en-US');
  const [tokenReward, setTokenReward] = useState({
    token_amount: DEFAULT_REWARD_TOKENS,
    token_symbol: DEFAULT_TOKEN_SYMBOL
  });

  // Alert types
  const alertTypes = [
    { value: 'suspected_case', label: 'Suspected Viral Case' },
    { value: 'unusual_symptoms', label: 'Unusual Symptoms' },
    { value: 'cluster', label: 'Multiple Cases in Area' },
    { value: 'animal_deaths', label: 'Unusual Animal Deaths' },
    { value: 'environmental', label: 'Environmental Concern' },
    { value: 'other', label: 'Other' }
  ];

  // Steps for the stepper
  const steps = ['Alert Details', 'Location', 'Privacy & Submission'];

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentCoordinates({ latitude, longitude });
          setUseCurrentLocation(true);
          // Reverse geocoding would normally happen here to get address
          setLocation(`Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          setSnackbar({ 
            open: true, 
            message: 'Unable to get your current location. Please enter it manually.', 
            severity: 'error' 
          });
          setUseCurrentLocation(false);
        }
      );
    } else {
      setSnackbar({ 
        open: true, 
        message: 'Geolocation is not supported by your browser. Please enter location manually.', 
        severity: 'error' 
      });
    }
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0 && (!alertText.trim() || !alertType)) {
      setSnackbar({ 
        open: true, 
        message: 'Please fill in all required fields before proceeding.', 
        severity: 'warning' 
      });
      return;
    }
    
    if (activeStep === 1 && !location.trim() && !useCurrentLocation) {
      setSnackbar({ 
        open: true, 
        message: 'Please provide a location or use your current location.', 
        severity: 'warning' 
      });
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!alertText.trim() || !location.trim() || !alertType) {
      setSnackbar({ 
        open: true, 
        message: 'Please fill in all required fields.', 
        severity: 'error' 
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare location data
      const locationData = {
        description: location,
        use_current_location: useCurrentLocation
      };
      
      // Add coordinates if using current location
      if (useCurrentLocation && currentCoordinates) {
        locationData.latitude = currentCoordinates.latitude;
        locationData.longitude = currentCoordinates.longitude;
      }
      
      // Prepare alert submission data
      const alertData = {
        alert_text: alertText,
        alert_type: alertType,
        location: locationData,
        symptoms: symptoms,
        anonymous: anonymousMode,
        contact_info: !anonymousMode ? contactInfo : null,
        alert_language: alertLanguage
      };
      
      // Submit alert to backend using the service
      const response = await anonymousAlertService.submitAlert(alertData);
      
      // Show success message
      setSnackbar({ 
        open: true, 
        message: response.message || 'Alert submitted successfully.', 
        severity: 'success' 
      });
      
      // Set token reward from response
      if (response.token_reward) {
        setTokenReward({
          token_amount: response.token_reward.token_amount,
          token_symbol: response.token_reward.token_symbol
        });
      }
      
      // Reset form
      setAlertText('');
      setLocation('');
      setAlertType('');
      setSymptoms('');
      setUseCurrentLocation(false);
      setCurrentCoordinates(null);
      setActiveStep(0);
      
      // Show reward dialog with token information from response
      setRewardDialogOpen(true);
    } catch (err) {
      console.error('Error submitting alert:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.detail || 'Failed to submit alert. Please try again later.', 
        severity: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="alert-type-label">Alert Type</InputLabel>
                <Select
                  labelId="alert-type-label"
                  id="alert-type"
                  value={alertType}
                  label="Alert Type"
                  onChange={(e) => setAlertType(e.target.value)}
                >
                  {alertTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Alert Description"
                placeholder="Describe what you've observed in detail..."
                multiline
                rows={4}
                fullWidth
                required
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Symptoms (if applicable)"
                placeholder="Describe any symptoms you or others are experiencing..."
                multiline
                rows={2}
                fullWidth
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                disabled={submitting}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <TextField
                  label="Location"
                  placeholder="Enter city, region, or specific location"
                  fullWidth
                  required
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setUseCurrentLocation(false);
                  }}
                  disabled={submitting || useCurrentLocation}
                  sx={{ mr: 1 }}
                />
                <Tooltip title="Use my current location">
                  <IconButton 
                    color={useCurrentLocation ? "primary" : "default"}
                    onClick={getCurrentLocation}
                    disabled={submitting}
                  >
                    <MyLocationIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              {useCurrentLocation && currentCoordinates && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Using your current location: {location}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Providing accurate location information helps us identify potential outbreak clusters.
                  Your location data will be anonymized in our public reports.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Privacy Settings</Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={anonymousMode} 
                      onChange={(e) => setAnonymousMode(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Submit this alert anonymously"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  Anonymous submissions help protect your privacy but may limit our ability to follow up.
                  <Button 
                    size="small" 
                    onClick={() => setPrivacyDialogOpen(true)}
                    sx={{ ml: 1 }}
                  >
                    Learn more
                  </Button>
                </Typography>
                
                {!anonymousMode && (
                  <TextField
                    label="Contact Information (optional)"
                    placeholder="Email or phone number for follow-up"
                    fullWidth
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    disabled={submitting}
                    sx={{ mt: 2 }}
                  />
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Alert Summary
              </Typography>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Alert Type
                      </Typography>
                      <Typography variant="body2">
                        {alertTypes.find(type => type.value === alertType)?.label || ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body2">
                        {location || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {alertText}
                      </Typography>
                    </Grid>
                    {symptoms && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Symptoms
                        </Typography>
                        <Typography variant="body2">
                          {symptoms}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TokenIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  You'll receive {tokenReward.token_amount} {tokenReward.token_symbol} tokens for this submission.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Anonymous Alert System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Report potential viral outbreaks or unusual symptoms anonymously. Your information helps us detect and respond to emerging threats quickly.
        </Typography>
      </Box>
      
      <MultilingualVoiceAlert 
        language={alertLanguage}
        onLanguageChange={(lang) => setAlertLanguage(lang)}
      />
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2, mb: 2 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || submitting}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting && <CircularProgress size={20} color="inherit" />}
              >
                {submitting ? 'Submitting...' : 'Submit Alert'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={submitting}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Token reward dialog */}
      <Dialog
        open={rewardDialogOpen}
        onClose={() => setRewardDialogOpen(false)}
        aria-labelledby="reward-dialog-title"
      >
        <DialogTitle id="reward-dialog-title">
          Thank You for Your Contribution!
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your alert has been submitted successfully and will be reviewed by our team.
            As a token of appreciation, we've added {tokenReward.token_amount} {tokenReward.token_symbol} tokens to your account.
          </DialogContentText>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <Chip
              icon={<TokenIcon />}
              label={`+${tokenReward.token_amount} ${tokenReward.token_symbol}`}
              color="primary"
              variant="outlined"
              sx={{ fontSize: '1.2rem', py: 2, px: 1 }}
            />
          </Box>
          <DialogContentText>
            These tokens can be used for accessing premium features or exchanged for rewards in the future.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRewardDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Privacy policy dialog */}
      <Dialog
        open={privacyDialogOpen}
        onClose={() => setPrivacyDialogOpen(false)}
        aria-labelledby="privacy-dialog-title"
        maxWidth="md"
      >
        <DialogTitle id="privacy-dialog-title">
          Privacy Policy for Anonymous Alerts
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography variant="subtitle1" gutterBottom>
              How We Handle Your Data
            </Typography>
            <Typography variant="body2" paragraph>
              When you submit an alert anonymously, we collect only the information you provide in the form.
              Your IP address and other identifying information are not stored with your submission.
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Location Data
            </Typography>
            <Typography variant="body2" paragraph>
              If you choose to share your location, we store approximate coordinates to help identify
              potential outbreak clusters. We do not track your movements or store precise location data.
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              How We Use Your Information
            </Typography>
            <Typography variant="body2" paragraph>
              Information from anonymous alerts is used to:
              <ul>
                <li>Identify potential viral outbreaks</li>
                <li>Alert health authorities when necessary</li>
                <li>Improve our prediction models</li>
                <li>Generate anonymized public health reports</li>
              </ul>
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Blockchain Verification
            </Typography>
            <Typography variant="body2" paragraph>
              A hash of your submission (without personally identifiable information) may be recorded on our
              blockchain ledger for verification purposes. This cannot be used to identify you.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnonymousAlert;