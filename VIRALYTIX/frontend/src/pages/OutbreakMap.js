import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import RecommendIcon from '@mui/icons-material/Recommend';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';

// Mock data for the map
const mockOutbreaks = [
  {
    id: 'ob-001',
    virus_name: 'SARS-CoV-2',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      country: 'USA',
      city: 'New York'
    },
    severity: 0.8,
    affected_population: 5000,
    status: 'active',
    risk_score: 0.85
  },
  {
    id: 'ob-002',
    virus_name: 'H1N1',
    location: {
      lat: 35.6762,
      lng: 139.6503,
      country: 'Japan',
      city: 'Tokyo'
    },
    severity: 0.6,
    affected_population: 3000,
    status: 'contained',
    risk_score: 0.72
  },
  {
    id: 'ob-003',
    virus_name: 'Dengue',
    location: {
      lat: 19.4326,
      lng: -99.1332,
      country: 'Mexico',
      city: 'Mexico City'
    },
    severity: 0.7,
    affected_population: 2500,
    status: 'active',
    risk_score: 0.68
  },
  {
    id: 'ob-004',
    virus_name: 'SARS-CoV-2',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      country: 'India',
      city: 'New Delhi'
    },
    severity: 0.75,
    affected_population: 7000,
    status: 'active',
    risk_score: 0.79
  },
  {
    id: 'ob-005',
    virus_name: 'Zika',
    location: {
      lat: -23.5505,
      lng: -46.6333,
      country: 'Brazil',
      city: 'São Paulo'
    },
    severity: 0.65,
    affected_population: 1800,
    status: 'contained',
    risk_score: 0.76
  }
];

const OutbreakMap = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const [virusFilter, setVirusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Filter outbreaks based on selected filters
  const filteredOutbreaks = mockOutbreaks.filter(outbreak => {
    const matchesVirus = virusFilter === 'all' || outbreak.virus_name === virusFilter;
    const matchesStatus = statusFilter === 'all' || outbreak.status === statusFilter;
    return matchesVirus && matchesStatus;
  });

  // Get unique virus names for filter dropdown
  const virusNames = [...new Set(mockOutbreaks.map(outbreak => outbreak.virus_name))];

  // Initialize map when component mounts
  useEffect(() => {
    // In a real implementation, this would use Mapbox GL JS to create a map
    // For this demo, we'll just simulate loading the map
    const timer = setTimeout(() => {
      setLoading(false);
      setMap({ loaded: true });
      
      // Simulate selecting the first outbreak
      if (filteredOutbreaks.length > 0) {
        setSelectedOutbreak(filteredOutbreaks[0]);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Update map when filters change
  useEffect(() => {
    if (map && map.loaded) {
      // In a real implementation, this would update the map markers
      console.log('Updating map with filtered outbreaks:', filteredOutbreaks);
      
      // Select the first outbreak in the filtered list, or null if empty
      setSelectedOutbreak(filteredOutbreaks.length > 0 ? filteredOutbreaks[0] : null);
    }
  }, [virusFilter, statusFilter, map]);

  const handleOutbreakClick = (outbreak) => {
    setSelectedOutbreak(outbreak);
  };

  const handleRefresh = () => {
    setLoading(true);
    // In a real implementation, this would fetch fresh data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleGenerateReport = async (outbreak) => {
    setReportLoading(true);
    setReportOpen(true);
    
    // Simulate report generation processing
    setTimeout(() => {
      const report = generateOutbreakReport(outbreak);
      setGeneratedReport(report);
      setReportLoading(false);
      setSnackbarOpen(true);
    }, 2500);
  };

  const generateOutbreakReport = (outbreak) => {
    const currentDate = new Date().toLocaleDateString();
    const reportId = `OUTBREAK-REPORT-${outbreak.id}-${Date.now()}`;
    
    return {
      id: reportId,
      outbreak: outbreak,
      generatedDate: currentDate,
      reportData: {
        situationAssessment: {
          currentStatus: outbreak.status,
          affectedPopulation: outbreak.affected_population,
          riskLevel: outbreak.risk_score,
          severity: outbreak.severity,
          geographicScope: getGeographicScope(outbreak.location.country),
          transmissionRate: calculateTransmissionRate(outbreak.risk_score),
          estimatedDuration: getEstimatedDuration(outbreak.severity)
        },
        epidemiologicalAnalysis: {
          incidenceRate: Math.floor(Math.random() * 50) + 10,
          mortalityRate: (outbreak.severity * 0.1).toFixed(2),
          hospitalizationRate: (outbreak.severity * 0.3).toFixed(1),
          ageGroupsAffected: getAffectedAgeGroups(),
          comorbidityFactors: getComorbidityFactors(outbreak.virus_name),
          seasonalPattern: getSeasonalPattern(outbreak.virus_name)
        },
        responseRecommendations: {
          immediateActions: getImmediateActions(outbreak),
          mediumTermActions: getMediumTermActions(outbreak),
          longTermActions: getLongTermActions(outbreak),
          resourceRequirements: getResourceRequirements(outbreak),
          stakeholders: getStakeholders(outbreak.location.country)
        },
        riskProjections: {
          worstCaseScenario: {
            projectedCases: Math.floor(outbreak.affected_population * 2.5),
            timeframe: '4-6 weeks',
            probability: '25%'
          },
          likelyScenario: {
            projectedCases: Math.floor(outbreak.affected_population * 1.5),
            timeframe: '6-8 weeks',
            probability: '60%'
          },
          bestCaseScenario: {
            projectedCases: Math.floor(outbreak.affected_population * 0.8),
            timeframe: '2-3 weeks',
            probability: '15%'
          }
        },
        confidence: Math.floor(outbreak.risk_score * 100),
        dataQuality: outbreak.status === 'active' ? 'High' : 'Medium',
        lastUpdated: currentDate
      }
    };
  };

  const getGeographicScope = (country) => {
    const scopes = {
      'USA': 'Multi-state potential with international travel implications',
      'Japan': 'Regional containment with Asia-Pacific monitoring required',
      'Mexico': 'North American corridor surveillance needed',
      'India': 'South Asian regional spread likely with global travel concerns',
      'Brazil': 'South American continental monitoring required'
    };
    return scopes[country] || 'Regional monitoring and assessment ongoing';
  };

  const calculateTransmissionRate = (riskScore) => {
    const baseR0 = 1.2;
    const adjustedR0 = baseR0 + (riskScore * 2);
    return adjustedR0.toFixed(2);
  };

  const getEstimatedDuration = (severity) => {
    if (severity > 0.7) return '8-12 weeks';
    if (severity > 0.5) return '6-10 weeks';
    return '4-8 weeks';
  };

  const getAffectedAgeGroups = () => {
    return [
      { group: '0-17 years', percentage: Math.floor(Math.random() * 20) + 5 },
      { group: '18-64 years', percentage: Math.floor(Math.random() * 40) + 40 },
      { group: '65+ years', percentage: Math.floor(Math.random() * 30) + 15 }
    ];
  };

  const getComorbidityFactors = (virusName) => {
    const factors = {
      'SARS-CoV-2': ['Diabetes', 'Hypertension', 'Cardiovascular disease', 'Respiratory conditions'],
      'H1N1': ['Asthma', 'Pregnancy', 'Immunocompromised conditions', 'Chronic lung disease'],
      'Dengue': ['Previous dengue infection', 'Age extremes', 'Chronic diseases'],
      'Zika': ['Pregnancy', 'Immunocompromised conditions', 'Chronic illnesses']
    };
    return factors[virusName] || ['General chronic conditions', 'Immunocompromised states'];
  };

  const getSeasonalPattern = (virusName) => {
    const patterns = {
      'SARS-CoV-2': 'Year-round transmission with winter peaks',
      'H1N1': 'Seasonal peaks in fall and winter months',
      'Dengue': 'Rainy season transmission peaks',
      'Zika': 'Warm weather and rainy season correlation'
    };
    return patterns[virusName] || 'Seasonal pattern under investigation';
  };

  const getImmediateActions = (outbreak) => {
    const baseActions = [
      'Activate emergency response protocols',
      'Enhance surveillance and case detection',
      'Implement contact tracing procedures',
      'Coordinate with healthcare facilities'
    ];

    if (outbreak.risk_score > 0.7) {
      return [
        ...baseActions,
        'Deploy emergency medical teams',
        'Establish isolation facilities',
        'Activate international notification systems',
        'Implement travel restrictions if necessary'
      ];
    }
    return baseActions;
  };

  const getMediumTermActions = (outbreak) => {
    return [
      'Scale up laboratory testing capacity',
      'Develop public communication strategy',
      'Coordinate vaccine/treatment distribution',
      'Monitor healthcare system capacity',
      'Establish data sharing protocols',
      'Implement community mitigation measures'
    ];
  };

  const getLongTermActions = (outbreak) => {
    return [
      'Conduct epidemiological investigations',
      'Evaluate response effectiveness',
      'Update preparedness plans',
      'Strengthen surveillance systems',
      'Build community resilience',
      'Develop lessons learned documentation'
    ];
  };

  const getResourceRequirements = (outbreak) => {
    const baseRequirements = {
      personnel: Math.floor(outbreak.affected_population * 0.01),
      medicalSupplies: `${Math.floor(outbreak.affected_population * 0.1)} units`,
      testingKits: Math.floor(outbreak.affected_population * 0.5),
      isolationBeds: Math.floor(outbreak.affected_population * 0.05)
    };

    return baseRequirements;
  };

  const getStakeholders = (country) => {
    return [
      'Ministry of Health',
      'World Health Organization',
      'Local health departments',
      'Healthcare facilities',
      'Emergency management agencies',
      'International partners',
      'Community organizations'
    ];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Global Outbreak Map
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FilterListIcon color="primary" />
          </Grid>
          <Grid item xs={12} sm>
            <Typography variant="subtitle1" sx={{ mb: { xs: 1, sm: 0 } }}>
              Filters
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="virus-filter-label">Virus</InputLabel>
              <Select
                labelId="virus-filter-label"
                id="virus-filter"
                value={virusFilter}
                label="Virus"
                onChange={(e) => setVirusFilter(e.target.value)}
              >
                <MenuItem value="all">All Viruses</MenuItem>
                {virusNames.map(virus => (
                  <MenuItem key={virus} value={virus}>{virus}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="contained">Contained</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Map */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              height: 500, 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              bgcolor: '#f5f5f5'
            }}
            ref={mapContainerRef}
          >
            {loading ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Loading map data...
                </Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ maxWidth: '80%' }}>
                {error}
              </Alert>
            ) : (
              <>
                {/* This would be replaced with actual Mapbox GL JS map */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(120deg, #e0f7fa 0%, #bbdefb 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Interactive Map Visualization
                  </Typography>
                </Box>
                
                {/* Map Legend */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    p: 1.5,
                    borderRadius: 1,
                    boxShadow: 1,
                    maxWidth: 200
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Risk Level
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#d32f2f', mr: 1 }} />
                    <Typography variant="body2">High (70-100%)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#f57c00', mr: 1 }} />
                    <Typography variant="body2">Medium (40-70%)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#388e3c', mr: 1 }} />
                    <Typography variant="body2">Low (0-40%)</Typography>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Outbreak List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="Outbreak List" 
              subheader={`${filteredOutbreaks.length} outbreaks found`}
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
              {filteredOutbreaks.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No outbreaks match the selected filters
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {filteredOutbreaks.map((outbreak) => (
                    <Box 
                      key={outbreak.id}
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        bgcolor: selectedOutbreak?.id === outbreak.id ? 'action.selected' : 'transparent',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                      onClick={() => handleOutbreakClick(outbreak)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" component="div">
                          {outbreak.virus_name}
                        </Typography>
                        <Chip 
                          label={outbreak.status}
                          size="small"
                          color={
                            outbreak.status === 'active' ? 'error' :
                            outbreak.status === 'contained' ? 'warning' : 'success'
                          }
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {outbreak.location.city}, {outbreak.location.country}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {outbreak.affected_population.toLocaleString()} affected
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: 
                              outbreak.risk_score > 0.7 ? 'error.main' :
                              outbreak.risk_score > 0.4 ? 'warning.main' : 'success.main'
                          }}
                        >
                          Risk: {(outbreak.risk_score * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Selected Outbreak Details */}
        {selectedOutbreak && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardHeader 
                title={`${selectedOutbreak.virus_name} Outbreak Details`}
                subheader={`${selectedOutbreak.location.city}, ${selectedOutbreak.location.country}`}
                action={
                  <Tooltip title="View detailed analysis and predictions">
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Status
                      </Typography>
                      <Chip 
                        label={selectedOutbreak.status}
                        color={
                          selectedOutbreak.status === 'active' ? 'error' :
                          selectedOutbreak.status === 'contained' ? 'warning' : 'success'
                        }
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Affected Population
                      </Typography>
                      <Typography variant="h6">
                        {selectedOutbreak.affected_population.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Severity
                      </Typography>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          color: 
                            selectedOutbreak.severity > 0.7 ? 'error.main' :
                            selectedOutbreak.severity > 0.4 ? 'warning.main' : 'success.main'
                        }}
                      >
                        {(selectedOutbreak.severity * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Risk Score
                      </Typography>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          color: 
                            selectedOutbreak.risk_score > 0.7 ? 'error.main' :
                            selectedOutbreak.risk_score > 0.4 ? 'warning.main' : 'success.main'
                        }}
                      >
                        {(selectedOutbreak.risk_score * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outlined" sx={{ mr: 1 }}>
                    View Predictions
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={() => handleGenerateReport(selectedOutbreak)}
                    startIcon={<AssessmentIcon />}
                  >
                    Generate Response Plan
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Report Generation Dialog */}
      <Dialog 
        open={reportOpen} 
        onClose={() => setReportOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Outbreak Response Plan Report
              </Typography>
            </Box>
            {generatedReport && (
              <Button
                startIcon={<DownloadIcon />}
                size="small"
                variant="outlined"
              >
                Export PDF
              </Button>
            )}
          </Box>
          {selectedOutbreak && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedOutbreak.virus_name} - {selectedOutbreak.location.city}, {selectedOutbreak.location.country}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {reportLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Generating comprehensive outbreak response plan...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Analyzing epidemiological data and risk factors
              </Typography>
            </Box>
          ) : generatedReport ? (
            <Box>
              {/* Report Header */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Report ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {generatedReport.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Generated Date
                    </Typography>
                    <Typography variant="body2">
                      {generatedReport.generatedDate}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Situation Assessment */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SecurityIcon sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="h6">Situation Assessment</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Current Status</Typography>
                      <Chip 
                        label={generatedReport.reportData.situationAssessment.currentStatus}
                        color={
                          generatedReport.reportData.situationAssessment.currentStatus === 'active' ? 'error' :
                          generatedReport.reportData.situationAssessment.currentStatus === 'contained' ? 'warning' : 'success'
                        }
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Affected Population</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {generatedReport.reportData.situationAssessment.affectedPopulation.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Risk Level</Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: generatedReport.reportData.situationAssessment.riskLevel > 0.7 ? 'error.main' : 
                                 generatedReport.reportData.situationAssessment.riskLevel > 0.4 ? 'warning.main' : 'success.main'
                        }}
                      >
                        {(generatedReport.reportData.situationAssessment.riskLevel * 100).toFixed(0)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Transmission Rate (R₀)</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {generatedReport.reportData.situationAssessment.transmissionRate}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Estimated Duration</Typography>
                      <Typography variant="body1">
                        {generatedReport.reportData.situationAssessment.estimatedDuration}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Geographic Scope</Typography>
                      <Typography variant="body2">
                        {generatedReport.reportData.situationAssessment.geographicScope}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Epidemiological Analysis */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PublicIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6">Epidemiological Analysis</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Incidence Rate</Typography>
                      <Typography variant="body1">
                        {generatedReport.reportData.epidemiologicalAnalysis.incidenceRate} per 100,000
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Mortality Rate</Typography>
                      <Typography variant="body1">
                        {generatedReport.reportData.epidemiologicalAnalysis.mortalityRate}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Hospitalization Rate</Typography>
                      <Typography variant="body1">
                        {generatedReport.reportData.epidemiologicalAnalysis.hospitalizationRate}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Age Groups Affected</Typography>
                      {generatedReport.reportData.epidemiologicalAnalysis.ageGroupsAffected.map((group, index) => (
                        <Typography key={index} variant="body2">
                          {group.group}: {group.percentage}%
                        </Typography>
                      ))}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Comorbidity Factors</Typography>
                      {generatedReport.reportData.epidemiologicalAnalysis.comorbidityFactors.map((factor, index) => (
                        <Chip key={index} label={factor} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Seasonal Pattern</Typography>
                      <Typography variant="body2">
                        {generatedReport.reportData.epidemiologicalAnalysis.seasonalPattern}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Response Recommendations */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RecommendIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Response Recommendations</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" color="error.main" gutterBottom>
                        Immediate Actions (0-72 hours)
                      </Typography>
                      <List dense>
                        {generatedReport.reportData.responseRecommendations.immediateActions.map((action, index) => (
                          <ListItem key={index} sx={{ pl: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main' }} />
                            </ListItemIcon>
                            <ListItemText primary={action} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" color="warning.main" gutterBottom>
                        Medium-term Actions (1-4 weeks)
                      </Typography>
                      <List dense>
                        {generatedReport.reportData.responseRecommendations.mediumTermActions.map((action, index) => (
                          <ListItem key={index} sx={{ pl: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main' }} />
                            </ListItemIcon>
                            <ListItemText primary={action} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" color="success.main" gutterBottom>
                        Long-term Actions (1+ months)
                      </Typography>
                      <List dense>
                        {generatedReport.reportData.responseRecommendations.longTermActions.map((action, index) => (
                          <ListItem key={index} sx={{ pl: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText primary={action} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>Resource Requirements</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="subtitle2" color="text.secondary">Personnel</Typography>
                      <Typography variant="body1">{generatedReport.reportData.responseRecommendations.resourceRequirements.personnel}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="subtitle2" color="text.secondary">Medical Supplies</Typography>
                      <Typography variant="body1">{generatedReport.reportData.responseRecommendations.resourceRequirements.medicalSupplies}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="subtitle2" color="text.secondary">Testing Kits</Typography>
                      <Typography variant="body1">{generatedReport.reportData.responseRecommendations.resourceRequirements.testingKits}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="subtitle2" color="text.secondary">Isolation Beds</Typography>
                      <Typography variant="body1">{generatedReport.reportData.responseRecommendations.resourceRequirements.isolationBeds}</Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Risk Projections */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6">Risk Projections</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'error.50', borderRadius: 2 }}>
                        <Typography variant="subtitle1" color="error.main" gutterBottom>
                          Worst Case Scenario ({generatedReport.reportData.riskProjections.worstCaseScenario.probability})
                        </Typography>
                        <Typography variant="body2">
                          <strong>Projected Cases:</strong> {generatedReport.reportData.riskProjections.worstCaseScenario.projectedCases.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Timeframe:</strong> {generatedReport.reportData.riskProjections.worstCaseScenario.timeframe}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                        <Typography variant="subtitle1" color="warning.main" gutterBottom>
                          Likely Scenario ({generatedReport.reportData.riskProjections.likelyScenario.probability})
                        </Typography>
                        <Typography variant="body2">
                          <strong>Projected Cases:</strong> {generatedReport.reportData.riskProjections.likelyScenario.projectedCases.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Timeframe:</strong> {generatedReport.reportData.riskProjections.likelyScenario.timeframe}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                        <Typography variant="subtitle1" color="success.main" gutterBottom>
                          Best Case Scenario ({generatedReport.reportData.riskProjections.bestCaseScenario.probability})
                        </Typography>
                        <Typography variant="body2">
                          <strong>Projected Cases:</strong> {generatedReport.reportData.riskProjections.bestCaseScenario.projectedCases.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Timeframe:</strong> {generatedReport.reportData.riskProjections.bestCaseScenario.timeframe}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Report Footer */}
              <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Confidence Level
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {generatedReport.reportData.confidence}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Data Quality
                    </Typography>
                    <Typography variant="body1">
                      {generatedReport.reportData.dataQuality}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {generatedReport.reportData.lastUpdated}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>
            Close
          </Button>
          {generatedReport && (
            <Button variant="contained" startIcon={<DownloadIcon />}>
              Download Report
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Outbreak response plan generated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OutbreakMap;