import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LanguageIcon from '@mui/icons-material/Language';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';

const Settings = () => {
  // State for user settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [dataPrivacy, setDataPrivacy] = useState('standard');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for profile settings
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [organization, setOrganization] = useState('Research Lab');
  const [password, setPassword] = useState('********');
  const [showPassword, setShowPassword] = useState(false);
  
  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    setSnackbar({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success'
    });
  };
  
  // Handle save profile
  const handleSaveProfile = () => {
    // In a real app, this would save to backend
    setSnackbar({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success'
    });
  };
  
  // Handle password change
  const handleChangePassword = () => {
    // In a real app, this would open a password change dialog
    setSnackbar({
      open: true,
      message: 'Password change functionality would be implemented here',
      severity: 'info'
    });
  };
  
  // Handle account deletion
  const handleDeleteAccount = () => {
    // In a real app, this would open a confirmation dialog
    setSnackbar({
      open: true,
      message: 'Account deletion would require confirmation',
      severity: 'warning'
    });
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Profile Settings" 
              avatar={<PersonIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    fullWidth
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Organization"
                    fullWidth
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField
                      label="Password"
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled
                    />
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleChangePassword}
                    startIcon={<LockIcon />}
                    sx={{ mr: 1 }}
                  >
                    Change Password
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSaveProfile}
                    startIcon={<SaveIcon />}
                  >
                    Save Profile
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardHeader 
              title="Account Management" 
              avatar={<SecurityIcon color="error" />}
            />
            <Divider />
            <CardContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Deleting your account will remove all your data and cannot be undone.
              </Alert>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Application Settings */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Application Settings" 
              avatar={<ColorLensIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ColorLensIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dark Mode" 
                    secondary="Enable dark theme for the application"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Language" 
                    secondary="Select your preferred language"
                  />
                  <ListItemSecondaryAction>
                    <FormControl variant="standard" sx={{ minWidth: 120 }}>
                      <Select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Español</MenuItem>
                        <MenuItem value="fr">Français</MenuItem>
                        <MenuItem value="de">Deutsch</MenuItem>
                        <MenuItem value="zh">中文</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardHeader 
              title="Notification Settings" 
              avatar={<NotificationsIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Enable Notifications" 
                    secondary="Receive alerts and updates"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Email Notifications" 
                    secondary="Receive notifications via email"
                    inset
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      disabled={!notificationsEnabled}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Push Notifications" 
                    secondary="Receive notifications in browser"
                    inset
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      disabled={!notificationsEnabled}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardHeader 
              title="Privacy Settings" 
              avatar={<SecurityIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <FormControl fullWidth>
                <InputLabel id="privacy-level-label">Data Privacy Level</InputLabel>
                <Select
                  labelId="privacy-level-label"
                  value={dataPrivacy}
                  label="Data Privacy Level"
                  onChange={(e) => setDataPrivacy(e.target.value)}
                >
                  <MenuItem value="minimal">Minimal - Only store essential data</MenuItem>
                  <MenuItem value="standard">Standard - Balance between features and privacy</MenuItem>
                  <MenuItem value="enhanced">Enhanced - Maximum privacy (some features limited)</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSaveSettings}
                  startIcon={<SaveIcon />}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;