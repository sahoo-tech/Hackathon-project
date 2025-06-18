import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Snackbar,
  Link,
  Tab,
  Tabs
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import SupportIcon from '@mui/icons-material/Support';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import ArticleIcon from '@mui/icons-material/Article';
import SchoolIcon from '@mui/icons-material/School';
import BugReportIcon from '@mui/icons-material/BugReport';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PhoneIcon from '@mui/icons-material/Phone';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

// TabPanel component
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

const HelpSupport = () => {
  const [tabValue, setTabValue] = useState(0);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle support form submission
  const handleSubmitSupport = () => {
    if (!supportEmail || !supportMessage) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    // In a real app, this would send the support request
    setSnackbar({
      open: true,
      message: 'Your support request has been submitted. We will get back to you soon.',
      severity: 'success'
    });
    
    // Reset form
    setSupportMessage('');
    setSupportSubject('');
  };
  
  // FAQ data
  const faqs = [
    {
      question: 'What is VIRALYTIX?',
      answer: 'VIRALYTIX is an advanced viral outbreak analysis and prediction platform that uses AI and machine learning to track, analyze, and predict viral outbreaks. It helps researchers, healthcare professionals, and government agencies to respond more effectively to potential pandemic threats.'
    },
    {
      question: 'How accurate are the predictions?',
      answer: 'Our prediction models have been validated with historical data and achieve an accuracy of approximately 85-90% for short-term predictions (1-2 weeks) and 70-80% for medium-term predictions (1-3 months). The accuracy depends on data quality and completeness.'
    },
    {
      question: 'How is my data protected?',
      answer: 'VIRALYTIX employs end-to-end encryption for all data transfers and storage. We follow GDPR, HIPAA, and other relevant data protection regulations. Personal data is anonymized and aggregated whenever possible.'
    },
    {
      question: 'Can I contribute data to the platform?',
      answer: 'Yes, researchers and healthcare organizations can contribute anonymized data through our secure API or data upload portal. All contributions are reviewed for quality and compliance with privacy standards before integration.'
    },
    {
      question: 'What do I do if I find a bug?',
      answer: 'Please report any bugs or issues through the "Report a Bug" section in the Help & Support page. Include as much detail as possible, including steps to reproduce the issue, screenshots, and your browser/device information.'
    },
    {
      question: 'How often is the data updated?',
      answer: 'Most data sources are updated daily, with some high-priority sources updated in near real-time. The dashboard displays the last update time for each data source.'
    },
    {
      question: 'Can I use VIRALYTIX data for my research?',
      answer: 'Yes, data can be exported for research purposes. Please cite VIRALYTIX appropriately in your publications and follow our data usage guidelines available in the documentation.'
    }
  ];
  
  // Tutorial data
  const tutorials = [
    {
      title: 'Getting Started with VIRALYTIX',
      description: 'Learn the basics of navigating and using the platform',
      type: 'Video',
      duration: '5 min'
    },
    {
      title: 'Understanding Mutation Tracking',
      description: 'How to interpret mutation data and visualizations',
      type: 'Article',
      duration: '10 min'
    },
    {
      title: 'Advanced Prediction Features',
      description: 'Using AI-powered prediction tools effectively',
      type: 'Interactive',
      duration: '15 min'
    },
    {
      title: 'Simulation Modeling Tutorial',
      description: 'Creating and analyzing outbreak simulations',
      type: 'Video',
      duration: '12 min'
    },
    {
      title: 'Data Export and API Usage',
      description: 'How to access and use VIRALYTIX data in your applications',
      type: 'Documentation',
      duration: '8 min'
    }
  ];
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Help & Support
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="help tabs">
          <Tab icon={<HelpIcon />} label="FAQ" />
          <Tab icon={<SchoolIcon />} label="Tutorials" />
          <Tab icon={<SupportIcon />} label="Contact Support" />
          <Tab icon={<BugReportIcon />} label="Report a Bug" />
        </Tabs>
      </Box>
      
      {/* FAQ Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Frequently Asked Questions
        </Typography>
        
        {faqs.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`faq-content-${index}`}
              id={`faq-header-${index}`}
            >
              <Typography variant="subtitle1">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Can't find what you're looking for? Contact our support team for assistance.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 1 }}
            onClick={() => setTabValue(2)}
          >
            Contact Support
          </Button>
        </Box>
      </TabPanel>
      
      {/* Tutorials Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Tutorials & Documentation
        </Typography>
        
        <Grid container spacing={3}>
          {tutorials.map((tutorial, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {tutorial.type === 'Video' ? (
                      <VideoLibraryIcon color="primary" sx={{ mr: 1 }} />
                    ) : tutorial.type === 'Article' ? (
                      <ArticleIcon color="primary" sx={{ mr: 1 }} />
                    ) : (
                      <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="h6">{tutorial.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {tutorial.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={tutorial.type} 
                      size="small" 
                      color={tutorial.type === 'Video' ? 'secondary' : 'primary'} 
                      variant="outlined" 
                    />
                    <Typography variant="caption" color="text.secondary">
                      Duration: {tutorial.duration}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Documentation
          </Typography>
          <List>
            <ListItem button component={Link} href="#" underline="none">
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText 
                primary="User Manual" 
                secondary="Complete guide to using VIRALYTIX" 
              />
            </ListItem>
            <ListItem button component={Link} href="#" underline="none">
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText 
                primary="API Documentation" 
                secondary="Technical guide for developers" 
              />
            </ListItem>
            <ListItem button component={Link} href="#" underline="none">
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Data Dictionary" 
                secondary="Definitions of all data fields and metrics" 
              />
            </ListItem>
          </List>
        </Box>
      </TabPanel>
      
      {/* Contact Support Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Contact Support
            </Typography>
            <Paper sx={{ p: 3 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                margin="normal"
              />
              <TextField
                label="Subject"
                fullWidth
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                margin="normal"
              />
              <TextField
                label="Message"
                multiline
                rows={6}
                fullWidth
                required
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                margin="normal"
              />
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={handleSubmitSupport}
                startIcon={<EmailIcon />}
              >
                Submit Request
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Other Ways to Get Help
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader title="Live Chat" avatar={<ChatIcon color="primary" />} />
              <Divider />
              <CardContent>
                <Typography variant="body2" paragraph>
                  Chat with our support team in real-time during business hours.
                </Typography>
                <Button variant="outlined" color="primary" startIcon={<ChatIcon />}>
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardHeader title="Phone Support" avatar={<PhoneIcon color="primary" />} />
              <Divider />
              <CardContent>
                <Typography variant="body2" paragraph>
                  Call our dedicated support line for urgent issues.
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  +1 (800) 555-VIRA
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Available Monday-Friday, 9am-5pm EST
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Report a Bug Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Report a Bug
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Please provide as much detail as possible to help us reproduce and fix the issue.
        </Alert>
        
        <Paper sx={{ p: 3 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Bug Title"
            fullWidth
            required
            placeholder="Brief description of the issue"
            margin="normal"
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Browser/App Version"
                fullWidth
                placeholder="e.g., Chrome 96.0.4664.110"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Operating System"
                fullWidth
                placeholder="e.g., Windows 11"
                margin="normal"
              />
            </Grid>
          </Grid>
          <TextField
            label="Steps to Reproduce"
            multiline
            rows={4}
            fullWidth
            required
            placeholder="1. Go to...\n2. Click on...\n3. Observe that..."
            margin="normal"
          />
          <TextField
            label="Expected Behavior"
            multiline
            rows={2}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Actual Behavior"
            multiline
            rows={2}
            fullWidth
            required
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              component="label" 
              sx={{ mr: 2 }}
            >
              Attach Screenshot
              <input type="file" hidden />
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<BugReportIcon />}
              onClick={handleSubmitSupport}
            >
              Submit Bug Report
            </Button>
          </Box>
        </Paper>
      </TabPanel>
      
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

export default HelpSupport;