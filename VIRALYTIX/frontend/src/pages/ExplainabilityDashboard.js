import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import BarChartIcon from '@mui/icons-material/BarChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import EventIcon from '@mui/icons-material/Event';

// Mock data for SHAP/LIME explanations
const mockExplanations = {
  alertId: 'alert-123456',
  alertType: 'Outbreak Risk Alert',
  riskScore: 0.78,
  timestamp: '2023-06-15T14:30:00Z',
  location: 'New York, USA',
  virusType: 'SARS-CoV-2',
  mutationType: 'Spike protein',
  features: [
    { 
      feature: 'Mutation Rate', 
      importance: 0.32, 
      effect: 'Positive', 
      value: '3.2x higher than baseline',
      description: 'The rate at which new mutations are occurring in this viral strain'
    },
    { 
      feature: 'Population Density', 
      importance: 0.28, 
      effect: 'Positive', 
      value: '10,431 people/km²',
      description: 'The number of people per square kilometer in the affected area'
    },
    { 
      feature: 'Vaccination Rate', 
      importance: 0.22, 
      effect: 'Negative', 
      value: '62% fully vaccinated',
      description: 'Percentage of the population that is fully vaccinated against this virus'
    },
    { 
      feature: 'Travel Connectivity', 
      importance: 0.18, 
      effect: 'Positive', 
      value: 'High (87/100)',
      description: 'Measure of how connected the location is to other global hubs'
    },
    { 
      feature: 'Healthcare Capacity', 
      importance: 0.15, 
      effect: 'Negative', 
      value: '3.2 ICU beds per 1000 people',
      description: 'Available healthcare resources in the affected area'
    },
    { 
      feature: 'Temperature', 
      importance: 0.12, 
      effect: 'Positive', 
      value: '18°C (optimal for spread)',
      description: 'Current average temperature in the affected area'
    },
    { 
      feature: 'Humidity', 
      importance: 0.10, 
      effect: 'Positive', 
      value: '65% (favorable for virus)',
      description: 'Current average humidity in the affected area'
    },
    { 
      feature: 'Previous Outbreaks', 
      importance: 0.08, 
      effect: 'Positive', 
      value: '3 in last 6 months',
      description: 'Number of previous outbreaks in this location'
    }
  ],
  summary: 'This alert was triggered primarily due to the high mutation rate of the virus combined with the high population density in New York. The vaccination rate provides some protection, but the travel connectivity increases risk of spread. The current temperature and humidity conditions are also favorable for viral transmission.',
  recommendations: [
    'Increase surveillance in high-density areas',
    'Promote vaccination campaigns',
    'Consider temporary travel restrictions',
    'Enhance hospital capacity planning',
    'Implement targeted testing in high-risk zones'
  ]
};

// More mock alerts for selection
const mockAlerts = [
  {
    id: 'alert-123456',
    type: 'Outbreak Risk Alert',
    location: 'New York, USA',
    riskScore: 0.78,
    timestamp: '2023-06-15T14:30:00Z',
    virus: 'SARS-CoV-2'
  },
  {
    id: 'alert-123457',
    type: 'Mutation Risk Alert',
    location: 'Tokyo, Japan',
    riskScore: 0.65,
    timestamp: '2023-06-14T09:15:00Z',
    virus: 'H1N1'
  },
  {
    id: 'alert-123458',
    type: 'Transmission Risk Alert',
    location: 'London, UK',
    riskScore: 0.72,
    timestamp: '2023-06-13T16:45:00Z',
    virus: 'SARS-CoV-2'
  },
  {
    id: 'alert-123459',
    type: 'Vaccine Escape Risk Alert',
    location: 'Rio de Janeiro, Brazil',
    riskScore: 0.81,
    timestamp: '2023-06-12T11:20:00Z',
    virus: 'Zika'
  }
];

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Helper function to get color based on effect
const getEffectColor = (effect) => {
  switch (effect.toLowerCase()) {
    case 'positive':
      return 'error';
    case 'negative':
      return 'success';
    case 'neutral':
      return 'info';
    default:
      return 'default';
  }
};

// Helper function to get color based on risk score
const getRiskColor = (score) => {
  if (score > 0.7) return 'error';
  if (score > 0.4) return 'warning';
  return 'success';
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ExplainabilityDashboard = () => {
  const [explanations, setExplanations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState('alert-123456');
  const [tabValue, setTabValue] = useState(0);
  
  // State for dialogs
  const [detailPlanDialogOpen, setDetailPlanDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // State for form inputs
  const [teamEmails, setTeamEmails] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');

  useEffect(() => {
    const fetchExplanations = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch data from the API
        // const response = await axios.get(`/api/explainability/risk-justification/${selectedAlert}`);
        // setExplanations(response.data);
        
        // Using mock data for now
        setTimeout(() => {
          setExplanations(mockExplanations);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load explanations.');
        setLoading(false);
      }
    };
    
    fetchExplanations();
  }, [selectedAlert]);

  const handleAlertChange = (event) => {
    setSelectedAlert(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    // In a real implementation, this would fetch fresh data
    setTimeout(() => {
      setExplanations(mockExplanations);
      setLoading(false);
    }, 1000);
  };

  // Function to download explanation as PDF (mock)
  const handleDownload = () => {
    alert('In a real implementation, this would download the explanation as a PDF report.');
  };
  
  // Handlers for detailed response plan
  const handleViewDetailedPlan = () => {
    setDetailPlanDialogOpen(true);
  };
  
  const handleCloseDetailedPlan = () => {
    setDetailPlanDialogOpen(false);
  };
  
  const handleSubmitDetailedPlan = () => {
    // In a real implementation, this would submit the plan to the backend
    setDetailPlanDialogOpen(false);
    setSnackbarMessage('Response plan has been approved and activated');
    setSnackbarOpen(true);
  };
  
  // Handlers for sharing with response team
  const handleShareWithTeam = () => {
    setShareDialogOpen(true);
  };
  
  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };
  
  const handleSubmitShare = () => {
    // In a real implementation, this would send emails to the team
    setShareDialogOpen(false);
    setSnackbarMessage(`Alert shared with team members: ${teamEmails}`);
    setSnackbarOpen(true);
    setTeamEmails(''); // Reset the form
  };
  
  // Handlers for scheduling follow-up
  const handleScheduleFollowUp = () => {
    setScheduleDialogOpen(true);
  };
  
  const handleCloseScheduleDialog = () => {
    setScheduleDialogOpen(false);
  };
  
  const handleSubmitSchedule = () => {
    // In a real implementation, this would schedule a follow-up meeting
    setScheduleDialogOpen(false);
    setSnackbarMessage(`Follow-up scheduled for ${scheduleDate}`);
    setSnackbarOpen(true);
    setScheduleDate(''); // Reset the form
    setScheduleNotes(''); // Reset the form
  };
  
  // Handler for snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Loading risk explanation data...
        </Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          SHAP/LIME-Based Risk Justification
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download report">
            <IconButton onClick={handleDownload} disabled={loading}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          This dashboard explains why specific risk alerts were triggered using SHAP (SHapley Additive exPlanations) 
          and LIME (Local Interpretable Model-agnostic Explanations) techniques, making AI decisions transparent and interpretable.
        </Typography>
      </Alert>
      
      {/* Alert selector */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="alert-select-label">Select Alert to Explain</InputLabel>
              <Select
                labelId="alert-select-label"
                id="alert-select"
                value={selectedAlert}
                label="Select Alert to Explain"
                onChange={handleAlertChange}
              >
                {mockAlerts.map((alert) => (
                  <MenuItem key={alert.id} value={alert.id}>
                    {alert.type} - {alert.location} ({alert.virus})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Selected Alert:
              </Typography>
              <Chip 
                label={`Risk Score: ${(explanations?.riskScore * 100).toFixed(0)}%`}
                color={getRiskColor(explanations?.riskScore)}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={formatDate(explanations?.timestamp)}
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="explanation tabs">
          <Tab icon={<InfoIcon />} label="Summary" />
          <Tab icon={<BarChartIcon />} label="Feature Importance" />
          <Tab icon={<TimelineIcon />} label="Recommendations" />
        </Tabs>
      </Box>
      
      {/* Summary Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardHeader 
                title="Alert Details" 
                subheader={`ID: ${explanations?.alertId}`}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Alert Type
                    </Typography>
                    <Typography variant="body1">
                      {explanations?.alertType}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Risk Score
                    </Typography>
                    <Typography variant="body1">
                      <Chip 
                        label={`${(explanations?.riskScore * 100).toFixed(0)}%`}
                        color={getRiskColor(explanations?.riskScore)}
                        size="small"
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {explanations?.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Timestamp
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(explanations?.timestamp)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Virus Type
                    </Typography>
                    <Typography variant="body1">
                      {explanations?.virusType}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mutation Type
                    </Typography>
                    <Typography variant="body1">
                      {explanations?.mutationType}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardHeader 
                title="Risk Explanation Summary" 
                action={
                  <Tooltip title="This summary explains the key factors that contributed to this risk alert">
                    <IconButton>
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {explanations?.summary}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Top Contributing Factors:
                </Typography>
                <Stack spacing={1}>
                  {explanations?.features.slice(0, 3).map((feature) => (
                    <Box key={feature.feature} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={feature.feature}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={feature.importance * 100}
                          color={getEffectColor(feature.effect)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ ml: 1, minWidth: 40, textAlign: 'right' }}>
                        {(feature.importance * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Feature Importance Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Importance</TableCell>
                  <TableCell>Effect on Risk</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {explanations?.features.map((item) => (
                  <TableRow key={item.feature}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {item.feature}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.importance * 100}
                          sx={{ width: 100, mr: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">
                          {(item.importance * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.effect}
                        color={getEffectColor(item.effect)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Understanding Feature Importance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Importance</strong> indicates how much each feature contributes to the final risk score.
            Higher percentages mean the feature had a stronger influence on the risk calculation.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Effect</strong> shows whether the feature increases risk (Positive) or decreases risk (Negative).
            For example, high population density has a positive effect on risk (increases it),
            while high vaccination rates have a negative effect (decreases risk).
          </Typography>
        </Box>
      </TabPanel>
      
      {/* Recommendations Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card variant="outlined">
              <CardHeader 
                title="AI-Generated Recommendations" 
                subheader="Based on risk factors and historical data"
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  These recommendations are generated based on the specific risk factors identified in this alert.
                  They are prioritized by potential impact on reducing the risk score.
                </Typography>
                
                <Box component="ol" sx={{ pl: 2 }}>
                  {explanations?.recommendations.map((recommendation, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        {recommendation}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader 
                title="Take Action" 
                subheader="Response options"
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    startIcon={<VisibilityIcon />}
                    onClick={handleViewDetailedPlan}
                  >
                    View Detailed Response Plan
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth
                    startIcon={<ShareIcon />}
                    onClick={handleShareWithTeam}
                  >
                    Share With Response Team
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    fullWidth
                    startIcon={<EventIcon />}
                    onClick={handleScheduleFollowUp}
                  >
                    Schedule Follow-up
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Detailed Response Plan Dialog */}
      <Dialog open={detailPlanDialogOpen} onClose={handleCloseDetailedPlan} maxWidth="md" fullWidth>
        <DialogTitle>Detailed Response Plan</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Response Plan for {explanations?.alertType}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Location: {explanations?.location}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Risk Score: {explanations?.riskScore ? (explanations.riskScore * 100).toFixed(0) : 0}%
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Immediate Actions:</Typography>
            <ol>
              {explanations?.recommendations.map((rec, index) => (
                <li key={index}>
                  <Typography variant="body1" paragraph>
                    {rec}
                    <Typography variant="body2" color="text.secondary">
                      Implementation timeline: {index < 2 ? '24 hours' : index < 4 ? '48 hours' : '1 week'}
                    </Typography>
                  </Typography>
                </li>
              ))}
            </ol>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Resource Allocation:</Typography>
            <Typography variant="body1" paragraph>
              Based on the risk assessment, we recommend allocating the following resources:
            </Typography>
            <ul>
              <li>
                <Typography variant="body1">
                  Medical personnel: {explanations?.riskScore > 0.7 ? 'High priority' : 'Medium priority'}
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Testing capacity: {explanations?.riskScore > 0.6 ? 'Increase by 200%' : 'Increase by 100%'}
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Vaccine distribution: {explanations?.riskScore > 0.5 ? 'Accelerate' : 'Standard protocol'}
                </Typography>
              </li>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailedPlan}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitDetailedPlan} color="primary">
            Approve and Activate Plan
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Share with Team Dialog */}
      <Dialog open={shareDialogOpen} onClose={handleCloseShareDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Share with Response Team</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" paragraph>
            Share this risk alert and recommendations with your response team members.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="emails"
            label="Team Member Emails"
            type="email"
            fullWidth
            variant="outlined"
            helperText="Enter email addresses separated by commas"
            value={teamEmails}
            onChange={(e) => setTeamEmails(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="permission-level-label">Permission Level</InputLabel>
            <Select
              labelId="permission-level-label"
              id="permission-level"
              label="Permission Level"
              defaultValue="view"
            >
              <MenuItem value="view">View Only</MenuItem>
              <MenuItem value="comment">View and Comment</MenuItem>
              <MenuItem value="edit">View and Edit</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="message"
            label="Additional Message"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitShare} color="primary">
            Share
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Schedule Follow-up Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={handleCloseScheduleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Follow-up</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" paragraph>
            Schedule a follow-up meeting to review the progress of the response plan.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="date"
            label="Date and Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="meeting-type-label">Meeting Type</InputLabel>
            <Select
              labelId="meeting-type-label"
              id="meeting-type"
              label="Meeting Type"
              defaultValue="virtual"
            >
              <MenuItem value="virtual">Virtual Meeting</MenuItem>
              <MenuItem value="in-person">In-Person Meeting</MenuItem>
              <MenuItem value="hybrid">Hybrid Meeting</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="notes"
            label="Meeting Notes"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={scheduleNotes}
            onChange={(e) => setScheduleNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseScheduleDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitSchedule} color="primary">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ExplainabilityDashboard;
