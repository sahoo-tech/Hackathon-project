import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
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
  Slider, 
  IconButton, 
  Tooltip as MuiTooltip, 
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import SchoolIcon from '@mui/icons-material/School';
import ElderlyIcon from '@mui/icons-material/Elderly';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

// Extended mock data for vulnerable zones
const mockZones = [
  {
    id: 'zone-001',
    name: 'South Bronx, NY',
    city: 'New York City',
    state: 'New York',
    country: 'USA',
    location: { lat: 40.8167, lng: -73.9184 },
    poverty_rate: 0.38,
    infection_rate: 0.14,
    hospital_access: 0.55,
    vaccination_rate: 0.62,
    population_density: 32000,
    median_income: 28000,
    uninsured_rate: 0.18,
    elderly_population: 0.12,
    child_population: 0.24,
    disabled_population: 0.15,
    education_level: 0.65, // % with high school diploma or higher
    equity_score: 0.35,
    risk_factors: [
      'High population density',
      'Limited healthcare access',
      'High poverty rate',
      'High uninsured rate'
    ],
    recommendations: [
      'Mobile vaccination clinics',
      'Multilingual health information',
      'Rental assistance programs',
      'Free testing sites'
    ]
  },
  {
    id: 'zone-002',
    name: 'South Los Angeles, CA',
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    location: { lat: 33.9897, lng: -118.2912 },
    poverty_rate: 0.32,
    infection_rate: 0.16,
    hospital_access: 0.48,
    vaccination_rate: 0.58,
    population_density: 12000,
    median_income: 35000,
    uninsured_rate: 0.22,
    elderly_population: 0.09,
    child_population: 0.28,
    disabled_population: 0.12,
    education_level: 0.72,
    equity_score: 0.42,
    risk_factors: [
      'Limited healthcare facilities',
      'High uninsured rate',
      'Language barriers',
      'Transportation challenges'
    ],
    recommendations: [
      'Community health workers',
      'Transportation to vaccination sites',
      'Expanded telehealth services',
      'School-based health programs'
    ]
  },
  {
    id: 'zone-003',
    name: 'Fifth Ward, Houston, TX',
    city: 'Houston',
    state: 'Texas',
    country: 'USA',
    location: { lat: 29.7677, lng: -95.3143 },
    poverty_rate: 0.41,
    infection_rate: 0.19,
    hospital_access: 0.35,
    vaccination_rate: 0.51,
    population_density: 8000,
    median_income: 30000,
    uninsured_rate: 0.28,
    elderly_population: 0.11,
    child_population: 0.26,
    disabled_population: 0.14,
    education_level: 0.68,
    equity_score: 0.31,
    risk_factors: [
      'Healthcare deserts',
      'High poverty rate',
      'Limited internet access',
      'Environmental hazards'
    ],
    recommendations: [
      'Door-to-door vaccination outreach',
      'Community health centers',
      'Air quality monitoring',
      'Digital access programs'
    ]
  },
  {
    id: 'zone-004',
    name: 'West Side, Chicago, IL',
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    location: { lat: 41.8781, lng: -87.6298 },
    poverty_rate: 0.36,
    infection_rate: 0.17,
    hospital_access: 0.42,
    vaccination_rate: 0.56,
    population_density: 15000,
    median_income: 32000,
    uninsured_rate: 0.19,
    elderly_population: 0.13,
    child_population: 0.23,
    disabled_population: 0.16,
    education_level: 0.71,
    equity_score: 0.38,
    risk_factors: [
      'Food deserts',
      'Limited healthcare access',
      'Housing instability',
      'High chronic disease rates'
    ],
    recommendations: [
      'Food assistance programs',
      'Rental stabilization',
      'Chronic disease management',
      'Community health workers'
    ]
  },
  {
    id: 'zone-005',
    name: 'Liberty City, Miami, FL',
    city: 'Miami',
    state: 'Florida',
    country: 'USA',
    location: { lat: 25.8352, lng: -80.2124 },
    poverty_rate: 0.39,
    infection_rate: 0.15,
    hospital_access: 0.45,
    vaccination_rate: 0.54,
    population_density: 10000,
    median_income: 29000,
    uninsured_rate: 0.25,
    elderly_population: 0.14,
    child_population: 0.22,
    disabled_population: 0.13,
    education_level: 0.69,
    equity_score: 0.36,
    risk_factors: [
      'Limited healthcare facilities',
      'High elderly population',
      'Language barriers',
      'Climate vulnerability'
    ],
    recommendations: [
      'Multilingual outreach',
      'Elder care programs',
      'Hurricane preparedness',
      'Community cooling centers'
    ]
  },
  {
    id: 'zone-006',
    name: 'Pine Ridge Reservation, SD',
    city: 'Pine Ridge',
    state: 'South Dakota',
    country: 'USA',
    location: { lat: 43.0324, lng: -102.5528 },
    poverty_rate: 0.54,
    infection_rate: 0.22,
    hospital_access: 0.25,
    vaccination_rate: 0.48,
    population_density: 200,
    median_income: 21000,
    uninsured_rate: 0.31,
    elderly_population: 0.09,
    child_population: 0.33,
    disabled_population: 0.18,
    education_level: 0.62,
    equity_score: 0.22,
    risk_factors: [
      'Extreme healthcare deserts',
      'Highest poverty rate',
      'Limited infrastructure',
      'Water access issues'
    ],
    recommendations: [
      'Mobile health clinics',
      'Water infrastructure',
      'Telehealth expansion',
      'Community health representatives'
    ]
  },
  {
    id: 'zone-007',
    name: 'East Oakland, CA',
    city: 'Oakland',
    state: 'California',
    country: 'USA',
    location: { lat: 37.7652, lng: -122.1676 },
    poverty_rate: 0.33,
    infection_rate: 0.13,
    hospital_access: 0.52,
    vaccination_rate: 0.61,
    population_density: 7500,
    median_income: 38000,
    uninsured_rate: 0.17,
    elderly_population: 0.11,
    child_population: 0.24,
    disabled_population: 0.14,
    education_level: 0.75,
    equity_score: 0.44,
    risk_factors: [
      'Air pollution',
      'Housing instability',
      'Food insecurity',
      'Transportation barriers'
    ],
    recommendations: [
      'Air quality monitoring',
      'Housing assistance',
      'Food distribution centers',
      'Transportation vouchers'
    ]
  },
  {
    id: 'zone-008',
    name: 'Navajo Nation, AZ/NM/UT',
    city: 'Window Rock',
    state: 'Arizona',
    country: 'USA',
    location: { lat: 35.6528, lng: -109.3453 },
    poverty_rate: 0.43,
    infection_rate: 0.24,
    hospital_access: 0.22,
    vaccination_rate: 0.53,
    population_density: 7,
    median_income: 25000,
    uninsured_rate: 0.29,
    elderly_population: 0.10,
    child_population: 0.31,
    disabled_population: 0.16,
    education_level: 0.67,
    equity_score: 0.28,
    risk_factors: [
      'Extreme rural isolation',
      'Limited water access',
      'Healthcare deserts',
      'Multi-generational housing'
    ],
    recommendations: [
      'Water delivery systems',
      'Mobile health units',
      'Satellite internet access',
      'Community health workers'
    ]
  }
];

// Helper functions
const getColor = (equity_score) => {
  if (equity_score < 0.3) return '#d32f2f'; // Very high vulnerability - dark red
  if (equity_score < 0.4) return '#f44336'; // High vulnerability - red
  if (equity_score < 0.5) return '#ff9800'; // Moderate vulnerability - orange
  if (equity_score < 0.6) return '#ffc107'; // Low vulnerability - amber
  return '#4caf50';                         // Very low vulnerability - green
};

const getRadius = (population_density) => {
  // Scale radius based on population density, but keep it within reasonable bounds
  const baseRadius = 10;
  const scaleFactor = Math.log(population_density + 1) / 10; // Using log scale to handle wide range
  return baseRadius + (scaleFactor * 15);
};

const calculateEquityScore = (zone) => {
  // Higher score is better (more equitable)
  return (
    (1 - zone.poverty_rate) * 0.25 +
    (1 - zone.infection_rate) * 0.25 +
    zone.hospital_access * 0.2 +
    zone.vaccination_rate * 0.15 +
    (1 - zone.uninsured_rate) * 0.15
  );
};

const EquityMap = () => {
  // State variables
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [filterPoverty, setFilterPoverty] = useState([0, 1]);
  const [filterInfection, setFilterInfection] = useState([0, 1]);
  const [filterHospital, setFilterHospital] = useState([0, 1]);
  const [filterEquity, setFilterEquity] = useState([0, 1]);
  const [showFilters, setShowFilters] = useState(false);
  const [mapStyle, setMapStyle] = useState('standard');
  const [searchQuery, setSearchQuery] = useState('');

  // Load zones data
  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    setTimeout(() => {
      // Calculate equity scores for each zone if not already present
      const zonesWithScores = mockZones.map(zone => {
        if (!zone.equity_score) {
          return { ...zone, equity_score: calculateEquityScore(zone) };
        }
        return zone;
      });
      
      setZones(zonesWithScores);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter zones based on criteria
  const filteredZones = zones.filter(zone => {
    const matchesPoverty = zone.poverty_rate >= filterPoverty[0] && zone.poverty_rate <= filterPoverty[1];
    const matchesInfection = zone.infection_rate >= filterInfection[0] && zone.infection_rate <= filterInfection[1];
    const matchesHospital = zone.hospital_access >= filterHospital[0] && zone.hospital_access <= filterHospital[1];
    const matchesEquity = zone.equity_score >= filterEquity[0] && zone.equity_score <= filterEquity[1];
    
    const matchesSearch = searchQuery === '' || 
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.state.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPoverty && matchesInfection && matchesHospital && matchesEquity && matchesSearch;
  });

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // In a real implementation, this would fetch fresh data
    setTimeout(() => {
      setZones(mockZones);
      setLoading(false);
    }, 1000);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterPoverty([0, 1]);
    setFilterInfection([0, 1]);
    setFilterHospital([0, 1]);
    setFilterEquity([0, 1]);
    setSearchQuery('');
  };

  // Export data as CSV
  const handleExportData = () => {
    const headers = [
      'ID', 'Name', 'City', 'State', 'Country', 
      'Poverty Rate', 'Infection Rate', 'Hospital Access', 
      'Vaccination Rate', 'Equity Score'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredZones.map(zone => [
        zone.id,
        zone.name,
        zone.city,
        zone.state,
        zone.country,
        zone.poverty_rate.toFixed(2),
        zone.infection_rate.toFixed(2),
        zone.hospital_access.toFixed(2),
        zone.vaccination_rate.toFixed(2),
        zone.equity_score.toFixed(2)
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `equity_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Map tile layers based on style
  const getTileLayer = () => {
    switch (mapStyle) {
      case 'satellite':
        return (
          <TileLayer
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        );
      case 'dark':
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        );
      default: // standard
        return (
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        );
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">
              Viral Impact on Vulnerable Zones (Equity Map)
            </Typography>
            <Box>
              <MuiTooltip title="Toggle filters">
                <IconButton onClick={() => setShowFilters(!showFilters)}>
                  <FilterListIcon />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Refresh data">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Export data">
                <IconButton onClick={handleExportData} disabled={loading}>
                  <DownloadIcon />
                </IconButton>
              </MuiTooltip>
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This map visualizes the intersection of socioeconomic factors, healthcare access, and viral infection rates to identify vulnerable communities that may need targeted support during outbreaks.
          </Alert>
        </Grid>
        
        {/* Filters */}
        {showFilters && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="map-style-label">Map Style</InputLabel>
                    <Select
                      labelId="map-style-label"
                      id="map-style"
                      value={mapStyle}
                      label="Map Style"
                      onChange={(e) => setMapStyle(e.target.value)}
                    >
                      <MenuItem value="standard">Standard</MenuItem>
                      <MenuItem value="satellite">Satellite</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Button 
                    variant="outlined" 
                    onClick={handleResetFilters}
                    startIcon={<FilterListIcon />}
                    sx={{ float: 'right' }}
                  >
                    Reset Filters
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography id="poverty-range-slider" gutterBottom>
                    Poverty Rate
                  </Typography>
                  <Slider
                    value={filterPoverty}
                    onChange={(e, newValue) => setFilterPoverty(newValue)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                    min={0}
                    max={1}
                    step={0.05}
                    aria-labelledby="poverty-range-slider"
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography id="infection-range-slider" gutterBottom>
                    Infection Rate
                  </Typography>
                  <Slider
                    value={filterInfection}
                    onChange={(e, newValue) => setFilterInfection(newValue)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                    min={0}
                    max={1}
                    step={0.05}
                    aria-labelledby="infection-range-slider"
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography id="hospital-range-slider" gutterBottom>
                    Hospital Access
                  </Typography>
                  <Slider
                    value={filterHospital}
                    onChange={(e, newValue) => setFilterHospital(newValue)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                    min={0}
                    max={1}
                    step={0.05}
                    aria-labelledby="hospital-range-slider"
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography id="equity-range-slider" gutterBottom>
                    Equity Score
                  </Typography>
                  <Slider
                    value={filterEquity}
                    onChange={(e, newValue) => setFilterEquity(newValue)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                    min={0}
                    max={1}
                    step={0.05}
                    aria-labelledby="equity-range-slider"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        
        {/* Map and Details */}
        <Grid item xs={12} md={selectedZone ? 8 : 12}>
          <Paper sx={{ height: selectedZone ? 'calc(100vh - 250px)' : 'calc(100vh - 200px)', borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : filteredZones.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
                <Alert severity="info" sx={{ width: '100%' }}>
                  No zones match your current filter criteria. Try adjusting your filters.
                </Alert>
              </Box>
            ) : (
              <MapContainer 
                center={[39.8283, -98.5795]} 
                zoom={4} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                {getTileLayer()}
                <ZoomControl position="bottomright" />
                
                {filteredZones.map((zone) => (
                  <CircleMarker
                    key={zone.id}
                    center={[zone.location.lat, zone.location.lng]}
                    radius={getRadius(zone.population_density)}
                    fillColor={getColor(zone.equity_score)}
                    color={getColor(zone.equity_score)}
                    fillOpacity={0.7}
                    weight={2}
                    eventHandlers={{
                      click: () => setSelectedZone(zone)
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                      <div>
                        <strong>{zone.name}</strong><br />
                        Equity Score: {(zone.equity_score * 100).toFixed(0)}%<br />
                        Poverty Rate: {(zone.poverty_rate * 100).toFixed(0)}%<br />
                        Infection Rate: {(zone.infection_rate * 100).toFixed(0)}%<br />
                        Hospital Access: {(zone.hospital_access * 100).toFixed(0)}%
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </Paper>
          
          {/* Legend */}
          <Paper sx={{ mt: 2, p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Legend
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#d32f2f', mr: 1 }} />
                    <Typography variant="body2">Very High Vulnerability</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#f44336', mr: 1 }} />
                    <Typography variant="body2">High Vulnerability</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#ff9800', mr: 1 }} />
                    <Typography variant="body2">Moderate Vulnerability</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4caf50', mr: 1 }} />
                    <Typography variant="body2">Low Vulnerability</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Circle size indicates population density. Click on a zone to view detailed information and recommendations.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Selected Zone Details */}
        {selectedZone && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                  {selectedZone.name}
                </Typography>
                <Chip 
                  label={`Equity Score: ${(selectedZone.equity_score * 100).toFixed(0)}%`}
                  color={selectedZone.equity_score < 0.4 ? 'error' : selectedZone.equity_score < 0.6 ? 'warning' : 'success'}
                />
              </Box>
              
              <Typography variant="subtitle2" color="text.secondary">
                {selectedZone.city}, {selectedZone.state}, {selectedZone.country}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Key Metrics */}
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon color="error" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Poverty Rate
                          </Typography>
                          <Typography variant="h6">
                            {(selectedZone.poverty_rate * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CoronavirusIcon color="error" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Infection Rate
                          </Typography>
                          <Typography variant="h6">
                            {(selectedZone.infection_rate * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalHospitalIcon color={selectedZone.hospital_access < 0.4 ? 'error' : 'primary'} sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Hospital Access
                          </Typography>
                          <Typography variant="h6">
                            {(selectedZone.hospital_access * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Vaccination Rate
                          </Typography>
                          <Typography variant="h6">
                            {(selectedZone.vaccination_rate * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Additional Metrics */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Demographic Information
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                          Population Density
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {selectedZone.population_density.toLocaleString()} people/km²
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                          Median Income
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${selectedZone.median_income.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalHospitalIcon fontSize="small" sx={{ mr: 1 }} />
                          Uninsured Rate
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {(selectedZone.uninsured_rate * 100).toFixed(0)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ElderlyIcon fontSize="small" sx={{ mr: 1 }} />
                          Elderly Population
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {(selectedZone.elderly_population * 100).toFixed(0)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ChildCareIcon fontSize="small" sx={{ mr: 1 }} />
                          Child Population
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {(selectedZone.child_population * 100).toFixed(0)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessibleIcon fontSize="small" sx={{ mr: 1 }} />
                          Disabled Population
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {(selectedZone.disabled_population * 100).toFixed(0)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                          Education Level
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {(selectedZone.education_level * 100).toFixed(0)}% high school+
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Risk Factors */}
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                Key Risk Factors
              </Typography>
              <List dense>
                {selectedZone.risk_factors.map((factor, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText primary={factor} />
                  </ListItem>
                ))}
              </List>
              
              {/* Recommendations */}
              <Typography variant="h6" sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <VolunteerActivismIcon color="primary" sx={{ mr: 1 }} />
                Recommendations
              </Typography>
              <List dense>
                {selectedZone.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setSelectedZone(null)}
                >
                  Close Details
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                >
                  Generate Full Report
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EquityMap;
