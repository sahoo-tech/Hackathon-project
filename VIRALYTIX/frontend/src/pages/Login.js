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
  Divider,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';

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

const Login = ({ onLogin }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real app, this would make an API call to authenticate
      // For demo purposes, we'll simulate a successful login
      setTimeout(() => {
        // Mock user data based on role
        const userData = {
          name: username,
          role: role,
          token: 'mock-jwt-token',
        };
        
        // Store token and user data in localStorage for persistence
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setLoading(false);
        onLogin(userData);
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError('Invalid username or password');
      console.error('Login error:', err);
    }
  };

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
      <Container maxWidth={isMobile ? "xs" : "sm"}>
        <StyledPaper>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                fontSize: isSmallMobile ? '1.5rem' : undefined
              }}
            >
              VIRALYTIX
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "subtitle1"} 
              color="text.secondary"
              sx={{
                fontSize: isSmallMobile ? '0.875rem' : undefined
              }}
            >
              Advanced Viral Outbreak Monitoring Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    label="Role"
                  >
                    <MenuItem value="user">Citizen</MenuItem>
                    <MenuItem value="lab">Laboratory</MenuItem>
                    <MenuItem value="government">Government</MenuItem>
                    <MenuItem value="ngo">NGO</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Box sx={{ textAlign: 'center', width: '100%', mt: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => alert('Password reset functionality will be implemented in production')}
                sx={{ textDecoration: 'underline' }}
              >
                Forgot your password?
              </Link>
            </Box>
            
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2, mb: 2 }}>
              For demo purposes: Use any username/password combination
            </Typography>
            
            <Divider sx={{ my: 2, width: '100%' }} />
            
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Don't have an account?
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                onClick={() => navigate('/register')}
                sx={{ py: 1.2 }}
              >
                Create New Account
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Join thousands of researchers, healthcare professionals, and organizations using VIRALYTIX for outbreak monitoring.
            </Typography>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default Login;