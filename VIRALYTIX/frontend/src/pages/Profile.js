import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Verified as VerifiedIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@viralytix.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    department: 'Epidemiology Research',
    role: 'Senior Research Scientist',
    joinDate: '2023-01-15',
    lastLogin: '2024-12-19 14:30:00',
    avatar: null,
    bio: 'Experienced epidemiologist specializing in viral mutation tracking and outbreak prediction. PhD in Public Health from Johns Hopkins University.',
    specializations: ['Viral Genomics', 'Outbreak Modeling', 'Data Analytics', 'Public Health Policy'],
    certifications: ['CDC Epidemiologist', 'WHO Emergency Response', 'Data Science Certificate'],
    securityLevel: 'Level 3 - Senior Researcher'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true,
    criticalAlerts: true,
    researchUpdates: true
  });

  const [activityData] = useState([
    { date: '2024-12-19', action: 'Generated Equity Impact Report', details: 'South Bronx, NY analysis' },
    { date: '2024-12-19', action: 'Accessed Mutation Tracker', details: 'Reviewed latest variants' },
    { date: '2024-12-18', action: 'Updated Outbreak Predictions', details: 'Modified Tokyo risk assessment' },
    { date: '2024-12-18', action: 'Participated in DAO Vote', details: 'Proposal #247 - Research Funding' },
    { date: '2024-12-17', action: 'Ran Simulation Model', details: 'Policy impact analysis for NYC' },
    { date: '2024-12-17', action: 'Downloaded Data Export', details: 'Mutation data for Q4 2024' },
    { date: '2024-12-16', action: 'Created Anonymous Alert', details: 'Potential outbreak in Seattle' },
    { date: '2024-12-16', action: 'Accessed Dark Web Monitor', details: 'Threat intelligence review' }
  ]);

  const [analyticsData] = useState({
    totalLogins: 342,
    reportsGenerated: 89,
    predictionsCreated: 156,
    simulationsRun: 67,
    daoVotes: 23,
    dataExports: 45,
    averageSessionTime: '2h 34m',
    lastMonthActivity: 87
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSave = () => {
    setEditMode(false);
    // In a real app, this would save to backend
    alert('Profile updated successfully!');
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const exportUserData = () => {
    const userData = {
      profile: profileData,
      notifications: notifications,
      activity: activityData,
      analytics: analyticsData,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `viralytix_user_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profileData.avatar}
                    sx={{ width: 120, height: 120, fontSize: '3rem' }}
                  >
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  {editMode && (
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                      size="small"
                    >
                      <UploadIcon fontSize="small" />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </IconButton>
                  )}
                </Box>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" sx={{ mr: 2 }}>
                    {profileData.name}
                  </Typography>
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Verified"
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<ShieldIcon />}
                    label={profileData.securityLevel}
                    color="primary"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {profileData.role} • {profileData.department}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(profileData.joinDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last login: {new Date(profileData.lastLogin).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={editMode ? "contained" : "outlined"}
                    startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    onClick={editMode ? handleSave : handleEditToggle}
                    color={editMode ? "success" : "primary"}
                  >
                    {editMode ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                  {editMode && (
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleEditToggle}
                      color="error"
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<PersonIcon />} label="Personal Info" />
              <Tab icon={<NotificationsIcon />} label="Notifications" />
              <Tab icon={<SecurityIcon />} label="Security" />
              <Tab icon={<HistoryIcon />} label="Activity" />
              <Tab icon={<AnalyticsIcon />} label="Analytics" />
            </Tabs>

            {/* Personal Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Contact Information
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <EmailIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Email"
                            secondary={
                              editMode ? (
                                <TextField
                                  value={profileData.email}
                                  onChange={(e) => handleInputChange('email', e.target.value)}
                                  size="small"
                                  fullWidth
                                />
                              ) : (
                                profileData.email
                              )
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Phone"
                            secondary={
                              editMode ? (
                                <TextField
                                  value={profileData.phone}
                                  onChange={(e) => handleInputChange('phone', e.target.value)}
                                  size="small"
                                  fullWidth
                                />
                              ) : (
                                profileData.phone
                              )
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <LocationIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Location"
                            secondary={
                              editMode ? (
                                <TextField
                                  value={profileData.location}
                                  onChange={(e) => handleInputChange('location', e.target.value)}
                                  size="small"
                                  fullWidth
                                />
                              ) : (
                                profileData.location
                              )
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <WorkIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Department"
                            secondary={
                              editMode ? (
                                <TextField
                                  value={profileData.department}
                                  onChange={(e) => handleInputChange('department', e.target.value)}
                                  size="small"
                                  fullWidth
                                />
                              ) : (
                                profileData.department
                              )
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Professional Information
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Bio
                        </Typography>
                        {editMode ? (
                          <TextField
                            multiline
                            rows={4}
                            value={profileData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            fullWidth
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {profileData.bio}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Specializations
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {profileData.specializations.map((spec, index) => (
                            <Chip key={index} label={spec} size="small" />
                          ))}
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Certifications
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {profileData.certifications.map((cert, index) => (
                            <Chip key={index} label={cert} size="small" color="primary" />
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel value={tabValue} index={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notification Preferences
                  </Typography>
                  <List>
                    {Object.entries(notifications).map(([key, value]) => (
                      <ListItem key={key}>
                        <ListItemText
                          primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          secondary={`${key === 'emailAlerts' ? 'Receive alerts via email' :
                                     key === 'smsAlerts' ? 'Receive alerts via SMS' :
                                     key === 'pushNotifications' ? 'Browser push notifications' :
                                     key === 'weeklyReports' ? 'Weekly summary reports' :
                                     key === 'criticalAlerts' ? 'Critical outbreak alerts' :
                                     'Research and system updates'}`}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={value}
                            onChange={() => handleNotificationChange(key)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Account Security
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Password"
                            secondary="Last changed 30 days ago"
                          />
                          <ListItemSecondaryAction>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setChangePasswordOpen(true)}
                            >
                              Change
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Two-Factor Authentication"
                            secondary="Enabled via SMS"
                          />
                          <ListItemSecondaryAction>
                            <Chip label="Enabled" color="success" size="small" />
                          </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Security Level"
                            secondary={profileData.securityLevel}
                          />
                          <ListItemSecondaryAction>
                            <Chip label="Active" color="primary" size="small" />
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Data & Privacy
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Data Export"
                            secondary="Download your data"
                          />
                          <ListItemSecondaryAction>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={exportUserData}
                            >
                              Export
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Session Timeout"
                            secondary="Auto-logout after 4 hours"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Data Retention"
                            secondary="Activity logs kept for 1 year"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Activity Tab */}
            <TabPanel value={tabValue} index={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activityData.map((activity, index) => (
                          <TableRow key={index}>
                            <TableCell>{activity.date}</TableCell>
                            <TableCell>{activity.action}</TableCell>
                            <TableCell>{activity.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel value={tabValue} index={4}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Usage Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {analyticsData.totalLogins}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Logins
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {analyticsData.reportsGenerated}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Reports Generated
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {analyticsData.simulationsRun}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Simulations Run
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {analyticsData.daoVotes}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              DAO Votes
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Performance Metrics
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" gutterBottom>
                          Average Session Time: {analyticsData.averageSessionTime}
                        </Typography>
                        <LinearProgress variant="determinate" value={75} />
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" gutterBottom>
                          Monthly Activity: {analyticsData.lastMonthActivity} actions
                        </Typography>
                        <LinearProgress variant="determinate" value={87} color="success" />
                      </Box>
                      <Alert severity="info">
                        You're in the top 15% of active users this month!
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
          <Button onClick={() => setChangePasswordOpen(false)} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;