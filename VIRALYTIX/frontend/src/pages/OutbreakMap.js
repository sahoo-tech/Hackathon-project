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
  Alert
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';

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
                  <Button variant="contained">
                    Generate Response Plan
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default OutbreakMap;