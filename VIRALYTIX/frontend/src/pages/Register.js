import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: 8,
    margin: theme.spacing(1),
  },
}));

const Register = ({ onLogin }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    country: '',
    city: '',
    
    // Professional Information
    role: 'user',
    organization: '',
    department: '',
    jobTitle: '',
    experience: '',
    specialization: '',
    education: '',
    
    // Account Security
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    
    // Agreements
    termsAccepted: false,
    privacyAccepted: false,
    newsletterOptIn: false
  });

  const steps = ['Personal Info', 'Professional Info', 'Account Security', 'Review & Submit'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, contains letters and numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Personal Information
        return formData.firstName && formData.lastName && 
               formData.email && validateEmail(formData.email) &&
               formData.phone && formData.country && formData.city;
      case 1: // Professional Information
        return formData.role && formData.organization && formData.jobTitle;
      case 2: // Account Security
        return formData.username && formData.username.length >= 3 &&
               formData.password && validatePassword(formData.password) &&
               formData.confirmPassword && formData.password === formData.confirmPassword;
      case 3: // Review & Submit
        return formData.termsAccepted && formData.privacyAccepted;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please fill in all required fields correctly.');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      setTimeout(() => {
        // Mock successful registration
        const userData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: formData.role,
          organization: formData.organization,
          token: 'mock-jwt-token-new-user',
        };
        
        // Store token and user data in localStorage
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setLoading(false);
        setSuccess(true);
        
        // Auto-login after successful registration
        setTimeout(() => {
          onLogin(userData);
        }, 2000);
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  const renderPersonalInfo = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          variant="outlined"
          error={formData.email && !validateEmail(formData.email)}
          helperText={formData.email && !validateEmail(formData.email) ? "Please enter a valid email address" : ""}
          InputProps={{
            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Country</InputLabel>
          <Select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            label="Country"
          >
            <MenuItem value="US">United States</MenuItem>
            <MenuItem value="CA">Canada</MenuItem>
            <MenuItem value="UK">United Kingdom</MenuItem>
            <MenuItem value="DE">Germany</MenuItem>
            <MenuItem value="FR">France</MenuItem>
            <MenuItem value="JP">Japan</MenuItem>
            <MenuItem value="AU">Australia</MenuItem>
            <MenuItem value="IN">India</MenuItem>
            <MenuItem value="BR">Brazil</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="City"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
    </Grid>
  );

  const renderProfessionalInfo = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Role</InputLabel>
          <Select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            label="Role"
          >
            <MenuItem value="user">Citizen/Public User</MenuItem>
            <MenuItem value="researcher">Researcher/Scientist</MenuItem>
            <MenuItem value="lab">Laboratory Technician</MenuItem>
            <MenuItem value="healthcare">Healthcare Professional</MenuItem>
            <MenuItem value="government">Government Official</MenuItem>
            <MenuItem value="ngo">NGO/Non-Profit</MenuItem>
            <MenuItem value="journalist">Journalist/Media</MenuItem>
            <MenuItem value="student">Student</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Organization/Institution"
          value={formData.organization}
          onChange={(e) => handleInputChange('organization', e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Department"
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Job Title"
          value={formData.jobTitle}
          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Years of Experience</InputLabel>
          <Select
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            label="Years of Experience"
          >
            <MenuItem value="0-1">0-1 years</MenuItem>
            <MenuItem value="2-5">2-5 years</MenuItem>
            <MenuItem value="6-10">6-10 years</MenuItem>
            <MenuItem value="11-15">11-15 years</MenuItem>
            <MenuItem value="16+">16+ years</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Area of Specialization"
          value={formData.specialization}
          onChange={(e) => handleInputChange('specialization', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Education/Qualifications"
          value={formData.education}
          onChange={(e) => handleInputChange('education', e.target.value)}
          variant="outlined"
          multiline
          rows={2}
          InputProps={{
            startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
          }}
        />
      </Grid>
    </Grid>
  );

  const renderAccountSecurity = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Username"
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          variant="outlined"
          error={formData.username && formData.username.length < 3}
          helperText={formData.username && formData.username.length < 3 ? 
            "Username must be at least 3 characters long" : 
            "Username must be unique and at least 3 characters long"}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          variant="outlined"
          error={formData.password && !validatePassword(formData.password)}
          helperText={formData.password && !validatePassword(formData.password) ? 
            "Password must be at least 8 characters with letters and numbers" : 
            "Minimum 8 characters, include letters and numbers"}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          variant="outlined"
          error={formData.confirmPassword && formData.password !== formData.confirmPassword}
          helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : ""}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Security Question</InputLabel>
          <Select
            value={formData.securityQuestion}
            onChange={(e) => handleInputChange('securityQuestion', e.target.value)}
            label="Security Question"
          >
            <MenuItem value="pet">What was the name of your first pet?</MenuItem>
            <MenuItem value="school">What was the name of your elementary school?</MenuItem>
            <MenuItem value="city">In what city were you born?</MenuItem>
            <MenuItem value="mother">What is your mother's maiden name?</MenuItem>
            <MenuItem value="car">What was the make of your first car?</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Security Answer"
          value={formData.securityAnswer}
          onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
          variant="outlined"
          helperText="This will help you recover your account if needed"
        />
      </Grid>
    </Grid>
  );

  const renderReviewSubmit = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Registration Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Name:</Typography>
              <Typography>{formData.firstName} {formData.lastName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
              <Typography>{formData.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Role:</Typography>
              <Typography>{formData.role}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Organization:</Typography>
              <Typography>{formData.organization}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Location:</Typography>
              <Typography>{formData.city}, {formData.country}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Username:</Typography>
              <Typography>{formData.username}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.termsAccepted}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => setTermsOpen(true)}
                sx={{ textDecoration: 'underline' }}
              >
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => setTermsOpen(true)}
                sx={{ textDecoration: 'underline' }}
              >
                Privacy Policy
              </Link>
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.privacyAccepted}
              onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I consent to the processing of my personal data for the purposes of using VIRALYTIX services
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.newsletterOptIn}
              onChange={(e) => handleInputChange('newsletterOptIn', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I would like to receive updates and newsletters about VIRALYTIX (optional)
            </Typography>
          }
        />
      </Box>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderProfessionalInfo();
      case 2:
        return renderAccountSecurity();
      case 3:
        return renderReviewSubmit();
      default:
        return 'Unknown step';
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(120deg, #e8f5e8 0%, #c8e6c9 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <StyledPaper>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom align="center" color="success.main">
              Registration Successful!
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Welcome to VIRALYTIX! Your account has been created successfully.
              You will be redirected to the dashboard shortly.
            </Typography>
            <CircularProgress color="success" />
          </StyledPaper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(120deg, #e0f7fa 0%, #bbdefb 100%)',
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 0,
      }}
    >
      <Container maxWidth="md">
        <StyledPaper>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              gutterBottom 
              sx={{ fontWeight: 700 }}
            >
              Join VIRALYTIX
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "subtitle1"} 
              color="text.secondary"
            >
              Create your account to access advanced viral outbreak monitoring
            </Typography>
          </Box>

          <Box sx={{ width: '100%', mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{!isSmallMobile && label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ width: '100%' }}>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !validateStep(activeStep)}
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <VerifiedUserIcon />}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validateStep(activeStep)}
                  size="large"
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3, width: '100%' }} />
          
          <Typography variant="body2" color="text.secondary" align="center">
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ textDecoration: 'underline' }}
            >
              Sign in here
            </Link>
          </Typography>
        </StyledPaper>
      </Container>

      {/* Terms and Privacy Dialog */}
      <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Terms of Service & Privacy Policy</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Terms of Service</Typography>
          <Typography variant="body2" paragraph>
            By using VIRALYTIX, you agree to use the platform responsibly for legitimate public health purposes.
            You will not misuse the system or attempt to access unauthorized data.
          </Typography>
          
          <Typography variant="h6" gutterBottom>Privacy Policy</Typography>
          <Typography variant="body2" paragraph>
            We collect and process your personal data to provide VIRALYTIX services. Your data is encrypted
            and stored securely. We do not share your personal information with third parties without consent.
          </Typography>
          
          <Typography variant="body2">
            For complete terms and privacy policy, please visit our website or contact support.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTermsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Register;