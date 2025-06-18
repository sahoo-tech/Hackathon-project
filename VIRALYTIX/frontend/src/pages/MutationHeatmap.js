import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  Chip, 
  IconButton, 
  Button, 
  Divider, 
  Switch, 
  FormControlLabel,
  TextField,
  Tooltip as MuiTooltip,
  Alert,
  Stack
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import LayersIcon from '@mui/icons-material/Layers';
import TimelineIcon from '@mui/icons-material/Timeline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Extended mock mutation data with more details
const mockMutations = [
  {
    id: 'mut-001',
    virus_name: 'SARS-CoV-2',
    location: { lat: 40.7128, lng: -74.0060, country: 'USA', city: 'New York' },
    risk_score: 0.75,
    mutation_type: 'Spike protein',
    date_detected: '2023-06-10',
    genome_sequence: 'ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAT',
    reported_by: 'CDC',
    verified: true,
    human_readable_explanation: 'This mutation affects the spike protein binding domain, potentially increasing transmissibility by 30%.'
  },
  {
    id: 'mut-002',
    virus_name: 'H1N1',
    location: { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo' },
    risk_score: 0.62,
    mutation_type: 'Hemagglutinin',
    date_detected: '2023-06-08',
    genome_sequence: 'GGAAACAAATCGTGCAATCAAATAATAACTCGACAGAGCAGGTTGACACAATAATGGAAAAGAACGTT',
    reported_by: 'Tokyo Medical University',
    verified: true,
    human_readable_explanation: 'This H1N1 mutation shows changes in the hemagglutinin protein that may affect vaccine efficacy.'
  },
  {
    id: 'mut-003',
    virus_name: 'SARS-CoV-2',
    location: { lat: 51.5074, lng: -0.1278, country: 'UK', city: 'London' },
    risk_score: 0.58,
    mutation_type: 'Nucleocapsid',
    date_detected: '2023-06-05',
    genome_sequence: 'CTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAATACCATGTTTG',
    reported_by: 'Imperial College London',
    verified: false,
    human_readable_explanation: 'This mutation in the nucleocapsid protein may affect viral replication efficiency.'
  },
  {
    id: 'mut-004',
    virus_name: 'Dengue',
    location: { lat: 13.7563, lng: 100.5018, country: 'Thailand', city: 'Bangkok' },
    risk_score: 0.67,
    mutation_type: 'Envelope',
    date_detected: '2023-06-01',
    genome_sequence: 'AGTTGTTAGTCTACGTGGACCGACAAGAACAGTTTCGAATCGGAAGCTTGCTTAACGTAGTTCTAACA',
    reported_by: 'Mahidol University',
    verified: true,
    human_readable_explanation: 'This mutation in the envelope protein could impact virus stability and infectivity.'
  },
  {
    id: 'mut-005',
    virus_name: 'Zika',
    location: { lat: -22.9068, lng: -43.1729, country: 'Brazil', city: 'Rio de Janeiro' },
    risk_score: 0.54,
    mutation_type: 'NS5',
    date_detected: '2023-05-28',
    genome_sequence: 'TGCAGACTAGCACTTCACTGCTTGGAACATCATCATGACTGGGAAAAGAGGAAAATGGATGTGGACT',
    reported_by: 'Oswaldo Cruz Foundation',
    verified: false,
    human_readable_explanation: 'This mutation affects the NS5 protein which is involved in viral RNA replication.'
  },
  {
    id: 'mut-006',
    virus_name: 'SARS-CoV-2',
    location: { lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris' },
    risk_score: 0.71,
    mutation_type: 'Spike protein',
    date_detected: '2023-05-25',
    genome_sequence: 'ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAT',
    reported_by: 'Institut Pasteur',
    verified: true,
    human_readable_explanation: 'This variant shows increased binding affinity to ACE2 receptors, potentially enhancing infectivity.'
  },
  {
    id: 'mut-007',
    virus_name: 'Avian Influenza H5N1',
    location: { lat: 39.9042, lng: 116.4074, country: 'China', city: 'Beijing' },
    risk_score: 0.82,
    mutation_type: 'Polymerase',
    date_detected: '2023-05-20',
    genome_sequence: 'GGAAACAAATCGTGCAATCAAATAATAACTCGACAGAGCAGGTTGACACAATAATGGAAAAGAACGTT',
    reported_by: 'Chinese CDC',
    verified: true,
    human_readable_explanation: 'This mutation in the polymerase complex may enhance viral replication in mammalian hosts.'
  },
  {
    id: 'mut-008',
    virus_name: 'Monkeypox',
    location: { lat: 51.1657, lng: 10.4515, country: 'Germany', city: 'Berlin' },
    risk_score: 0.45,
    mutation_type: 'Envelope',
    date_detected: '2023-05-15',
    genome_sequence: 'TGCAGACTAGCACTTCACTGCTTGGAACATCATCATGACTGGGAAAAGAGGAAAATGGATGTGGACT',
    reported_by: 'Robert Koch Institute',
    verified: false,
    human_readable_explanation: 'This mutation appears to be a natural variation with minimal impact on viral function.'
  },
  {
    id: 'mut-009',
    virus_name: 'MERS-CoV',
    location: { lat: 24.7136, lng: 46.6753, country: 'Saudi Arabia', city: 'Riyadh' },
    risk_score: 0.68,
    mutation_type: 'Spike protein',
    date_detected: '2023-05-10',
    genome_sequence: 'ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAT',
    reported_by: 'King Saud University',
    verified: true,
    human_readable_explanation: 'This mutation may enhance the virus\'s ability to enter human cells through the DPP4 receptor.'
  },
  {
    id: 'mut-010',
    virus_name: 'Ebola',
    location: { lat: 9.0820, lng: 8.6753, country: 'Nigeria', city: 'Abuja' },
    risk_score: 0.77,
    mutation_type: 'Glycoprotein',
    date_detected: '2023-05-05',
    genome_sequence: 'TGCAGACTAGCACTTCACTGCTTGGAACATCATCATGACTGGGAAAAGAGGAAAATGGATGTGGACT',
    reported_by: 'Nigeria CDC',
    verified: true,
    human_readable_explanation: 'This glycoprotein mutation may affect virus entry and immune evasion capabilities.'
  },
  {
    id: 'mut-011',
    virus_name: 'SARS-CoV-2',
    location: { lat: 19.4326, lng: -99.1332, country: 'Mexico', city: 'Mexico City' },
    risk_score: 0.63,
    mutation_type: 'ORF1a',
    date_detected: '2023-05-01',
    genome_sequence: 'CTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAATACCATGTTTG',
    reported_by: 'UNAM',
    verified: false,
    human_readable_explanation: 'This mutation in the ORF1a region may affect viral replication complex formation.'
  },
  {
    id: 'mut-012',
    virus_name: 'Chikungunya',
    location: { lat: 18.9712, lng: 72.8063, country: 'India', city: 'Mumbai' },
    risk_score: 0.59,
    mutation_type: 'E1 protein',
    date_detected: '2023-04-28',
    genome_sequence: 'AGTTGTTAGTCTACGTGGACCGACAAGAACAGTTTCGAATCGGAAGCTTGCTTAACGTAGTTCTAACA',
    reported_by: 'Indian Council of Medical Research',
    verified: true,
    human_readable_explanation: 'This E1 protein mutation may enhance the virus\'s ability to infect mosquito vectors.'
  }
];

// Helper functions
const getColorByRisk = (risk) => {
  if (risk > 0.75) return '#d32f2f'; // High risk - dark red
  if (risk > 0.6) return '#f44336';  // Medium-high risk - red
  if (risk > 0.45) return '#ff9800';  // Medium risk - orange
  if (risk > 0.3) return '#ffc107';  // Medium-low risk - amber
  return '#4caf50';                  // Low risk - green
};

const getRadiusByRisk = (risk) => {
  return 8 + (risk * 12); // Scale radius based on risk (8-20)
};

// Map component with heat layer
const HeatMapLayer = ({ mutations, showHeatmap }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);
  
  useEffect(() => {
    if (!showHeatmap) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }
    
    // Create heat map data points
    const heatPoints = mutations.map(mutation => [
      mutation.location.lat,
      mutation.location.lng,
      mutation.risk_score * 10 // Intensity based on risk score
    ]);
    
    // Remove existing heat layer if it exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }
    
    // Create new heat layer
    heatLayerRef.current = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: {
        0.2: '#4caf50', // Low risk - green
        0.4: '#ffc107', // Medium-low risk - amber
        0.6: '#ff9800', // Medium risk - orange
        0.8: '#f44336', // Medium-high risk - red
        1.0: '#d32f2f'  // High risk - dark red
      }
    }).addTo(map);
    
    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, mutations, showHeatmap]);
  
  return null;
};

const MutationHeatmap = () => {
  // State variables
  const [mutations, setMutations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [virusFilter, setVirusFilter] = useState('all');
  const [riskRangeFilter, setRiskRangeFilter] = useState([0, 1]);
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [mapStyle, setMapStyle] = useState('standard');
  const [selectedMutation, setSelectedMutation] = useState(null);
  const [stats, setStats] = useState({
    totalMutations: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
    virusCounts: {}
  });

  // Get unique virus names for filter dropdown
  const virusNames = [...new Set(mockMutations.map(mutation => mutation.virus_name))];

  // Load mutations
  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    setTimeout(() => {
      setMutations(mockMutations);
      setLoading(false);
      
      // Calculate stats
      const virusCounts = {};
      let highRiskCount = 0;
      let mediumRiskCount = 0;
      let lowRiskCount = 0;
      
      mockMutations.forEach(mutation => {
        // Count by virus
        virusCounts[mutation.virus_name] = (virusCounts[mutation.virus_name] || 0) + 1;
        
        // Count by risk level
        if (mutation.risk_score > 0.7) highRiskCount++;
        else if (mutation.risk_score > 0.4) mediumRiskCount++;
        else lowRiskCount++;
      });
      
      setStats({
        totalMutations: mockMutations.length,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        virusCounts
      });
    }, 1000);
  }, []);

  // Filter mutations based on all filters
  const filteredMutations = mutations.filter(mutation => {
    // Virus filter
    const matchesVirus = virusFilter === 'all' || mutation.virus_name === virusFilter;
    
    // Risk range filter
    const matchesRiskRange = 
      mutation.risk_score >= riskRangeFilter[0] && 
      mutation.risk_score <= riskRangeFilter[1];
    
    // Date range filter
    const mutationDate = new Date(mutation.date_detected);
    const matchesDateRange = 
      (!dateRangeFilter[0] || mutationDate >= dateRangeFilter[0]) && 
      (!dateRangeFilter[1] || mutationDate <= dateRangeFilter[1]);
    
    // Verification filter
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && mutation.verified) ||
      (verificationFilter === 'unverified' && !mutation.verified);
    
    // Search query
    const matchesSearch = 
      searchQuery === '' || 
      mutation.virus_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mutation.mutation_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mutation.location.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mutation.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mutation.reported_by.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesVirus && matchesRiskRange && matchesDateRange && matchesVerification && matchesSearch;
  });

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // In a real implementation, this would fetch fresh data
    setTimeout(() => {
      setMutations(mockMutations);
      setLoading(false);
    }, 1000);
  };

  // Handle map style change
  const handleMapStyleChange = (event) => {
    setMapStyle(event.target.value);
  };

  // Reset filters
  const handleResetFilters = () => {
    setVirusFilter('all');
    setRiskRangeFilter([0, 1]);
    setDateRangeFilter([null, null]);
    setVerificationFilter('all');
    setSearchQuery('');
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
      case 'light':
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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

  // Export data as CSV
  const exportCSV = () => {
    const headers = [
      'ID', 'Virus', 'Mutation Type', 'Risk Score', 
      'Country', 'City', 'Latitude', 'Longitude', 
      'Date Detected', 'Reported By', 'Verified'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredMutations.map(mutation => [
        mutation.id,
        mutation.virus_name,
        mutation.mutation_type,
        mutation.risk_score,
        mutation.location.country,
        mutation.location.city,
        mutation.location.lat,
        mutation.location.lng,
        mutation.date_detected,
        mutation.reported_by,
        mutation.verified ? 'Yes' : 'No'
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mutation_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">
              Interactive Global Mutation Heatmap
            </Typography>
            <Box>
              <MuiTooltip title="Refresh data">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Export filtered data as CSV">
                <IconButton onClick={exportCSV} disabled={loading}>
                  <DownloadIcon />
                </IconButton>
              </MuiTooltip>
            </Box>
          </Box>
        </Grid>
        
        {/* Filters and Controls */}
        <Grid item xs={12} md={3}>
          <Stack spacing={2}>
            {/* Search */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Search & Filters
              </Typography>
              <TextField
                fullWidth
                placeholder="Search mutations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  size: "small"
                }}
                sx={{ mb: 2 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              {/* Virus Filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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
              
              {/* Risk Range Filter */}
              <Box sx={{ mb: 2 }}>
                <Typography id="risk-range-slider" gutterBottom>
                  Risk Score Range
                </Typography>
                <Slider
                  value={riskRangeFilter}
                  onChange={(e, newValue) => setRiskRangeFilter(newValue)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                  min={0}
                  max={1}
                  step={0.05}
                  aria-labelledby="risk-range-slider"
                />
              </Box>
              
              {/* Date Range Filter */}
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Date Range
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <DatePicker
                        label="From"
                        value={dateRangeFilter[0]}
                        onChange={(date) => setDateRangeFilter([date, dateRangeFilter[1]])}
                        renderInput={(params) => <TextField size="small" {...params} />}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <DatePicker
                        label="To"
                        value={dateRangeFilter[1]}
                        onChange={(date) => setDateRangeFilter([dateRangeFilter[0], date])}
                        renderInput={(params) => <TextField size="small" {...params} />}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </LocalizationProvider>
              
              {/* Verification Filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="verification-filter-label">Verification</InputLabel>
                <Select
                  labelId="verification-filter-label"
                  id="verification-filter"
                  value={verificationFilter}
                  label="Verification"
                  onChange={(e) => setVerificationFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="unverified">Unverified</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleResetFilters}
                startIcon={<FilterListIcon />}
              >
                Reset Filters
              </Button>
            </Paper>
            
            {/* Map Controls */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Map Controls
              </Typography>
              
              {/* Map Style */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="map-style-label">Map Style</InputLabel>
                <Select
                  labelId="map-style-label"
                  id="map-style"
                  value={mapStyle}
                  label="Map Style"
                  onChange={handleMapStyleChange}
                  startAdornment={<LayersIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="satellite">Satellite</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                </Select>
              </FormControl>
              
              {/* Layer Controls */}
              <Typography variant="subtitle2" gutterBottom>
                Layers
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={showHeatmap} 
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    color="primary"
                  />
                }
                label="Heat Map"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={showMarkers} 
                    onChange={(e) => setShowMarkers(e.target.checked)}
                    color="primary"
                  />
                }
                label="Mutation Markers"
              />
            </Paper>
            
            {/* Stats */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Mutations:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">
                    {filteredMutations.length}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    High Risk:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="error">
                    {filteredMutations.filter(m => m.risk_score > 0.7).length}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Medium Risk:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="warning.main">
                    {filteredMutations.filter(m => m.risk_score > 0.4 && m.risk_score <= 0.7).length}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Low Risk:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="success.main">
                    {filteredMutations.filter(m => m.risk_score <= 0.4).length}
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Top viruses */}
              {virusFilter === 'all' && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Top Viruses
                  </Typography>
                  {Object.entries(stats.virusCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([virus, count]) => (
                      <Chip 
                        key={virus}
                        label={`${virus}: ${count}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                        onClick={() => setVirusFilter(virus)}
                      />
                    ))
                  }
                </>
              )}
            </Paper>
          </Stack>
        </Grid>
        
        {/* Map */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: 'calc(100vh - 140px)', borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : filteredMutations.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
                <Alert severity="info" sx={{ width: '100%' }}>
                  No mutations match your current filter criteria. Try adjusting your filters.
                </Alert>
              </Box>
            ) : (
              <MapContainer 
                center={[20, 0]} 
                zoom={2} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                {getTileLayer()}
                <ZoomControl position="bottomright" />
                
                {/* Heat map layer */}
                <HeatMapLayer mutations={filteredMutations} showHeatmap={showHeatmap} />
                
                {/* Mutation markers */}
                {showMarkers && filteredMutations.map((mutation) => (
                  <CircleMarker
                    key={mutation.id}
                    center={[mutation.location.lat, mutation.location.lng]}
                    radius={getRadiusByRisk(mutation.risk_score)}
                    fillColor={getColorByRisk(mutation.risk_score)}
                    color={getColorByRisk(mutation.risk_score)}
                    fillOpacity={0.7}
                    weight={2}
                    eventHandlers={{
                      click: () => setSelectedMutation(mutation)
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                      <div>
                        <strong>{mutation.virus_name}</strong><br />
                        {mutation.mutation_type}<br />
                        Location: {mutation.location.city}, {mutation.location.country}<br />
                        Risk: {(mutation.risk_score * 100).toFixed(0)}%<br />
                        Detected: {mutation.date_detected}
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
                
                {/* Popup for selected mutation */}
                {selectedMutation && (
                  <Popup
                    position={[selectedMutation.location.lat, selectedMutation.location.lng]}
                    onClose={() => setSelectedMutation(null)}
                  >
                    <div style={{ maxWidth: 300 }}>
                      <Typography variant="h6" gutterBottom>
                        {selectedMutation.virus_name}
                      </Typography>
                      <Chip 
                        label={`Risk: ${(selectedMutation.risk_score * 100).toFixed(0)}%`}
                        color={selectedMutation.risk_score > 0.7 ? 'error' : selectedMutation.risk_score > 0.4 ? 'warning' : 'success'}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Chip 
                        label={selectedMutation.verified ? 'Verified' : 'Unverified'}
                        color={selectedMutation.verified ? 'primary' : 'default'}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1, mb: 1 }}
                      />
                      
                      <Typography variant="subtitle2">
                        Mutation Type:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {selectedMutation.mutation_type}
                      </Typography>
                      
                      <Typography variant="subtitle2">
                        Location:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {selectedMutation.location.city}, {selectedMutation.location.country}
                      </Typography>
                      
                      <Typography variant="subtitle2">
                        Date Detected:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {selectedMutation.date_detected}
                      </Typography>
                      
                      <Typography variant="subtitle2">
                        Reported By:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {selectedMutation.reported_by}
                      </Typography>
                      
                      <Typography variant="subtitle2">
                        Analysis:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {selectedMutation.human_readable_explanation}
                      </Typography>
                      
                      <Typography variant="subtitle2">
                        Genome Sequence:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.7rem',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        bgcolor: 'background.default',
                        p: 1,
                        borderRadius: 1
                      }}>
                        {selectedMutation.genome_sequence}
                      </Typography>
                    </div>
                  </Popup>
                )}
              </MapContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MutationHeatmap;
