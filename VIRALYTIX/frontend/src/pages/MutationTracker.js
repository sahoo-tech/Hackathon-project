import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import RecommendIcon from '@mui/icons-material/Recommend';
import DownloadIcon from '@mui/icons-material/Download';

// Mock data
const mockMutations = [
  {
    id: 'mut-001',
    virus_name: 'SARS-CoV-2',
    genome_sequence: 'ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAT',
    mutation_type: 'Spike protein',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      country: 'USA',
      city: 'New York'
    },
    date_detected: '2023-06-10',
    risk_score: 0.75,
    reported_by: 'labuser',
    verified: true,
    blockchain_hash: '0x7b5d8c8d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
    human_readable_explanation: 'This mutation affects the spike protein binding domain, potentially increasing transmissibility by 30%.'
  },
  {
    id: 'mut-002',
    virus_name: 'H1N1',
    genome_sequence: 'GGAAACAAATCGTGCAATCAAATAATAACTCGACAGAGCAGGTTGACACAATAATGGAAAAGAACGTT',
    mutation_type: 'Hemagglutinin',
    location: {
      lat: 35.6762,
      lng: 139.6503,
      country: 'Japan',
      city: 'Tokyo'
    },
    date_detected: '2023-06-08',
    risk_score: 0.62,
    reported_by: 'labuser',
    verified: true,
    blockchain_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
    human_readable_explanation: 'This H1N1 mutation shows changes in the hemagglutinin protein that may affect vaccine efficacy.'
  },
  {
    id: 'mut-003',
    virus_name: 'SARS-CoV-2',
    genome_sequence: 'CTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAATACCATGTTTG',
    mutation_type: 'Nucleocapsid',
    location: {
      lat: 51.5074,
      lng: -0.1278,
      country: 'UK',
      city: 'London'
    },
    date_detected: '2023-06-05',
    risk_score: 0.58,
    reported_by: 'labuser',
    verified: false,
    blockchain_hash: null,
    human_readable_explanation: 'This mutation in the nucleocapsid protein may affect viral replication efficiency.'
  },
  {
    id: 'mut-004',
    virus_name: 'Dengue',
    genome_sequence: 'AGTTGTTAGTCTACGTGGACCGACAAGAACAGTTTCGAATCGGAAGCTTGCTTAACGTAGTTCTAACA',
    mutation_type: 'Envelope',
    location: {
      lat: 13.7563,
      lng: 100.5018,
      country: 'Thailand',
      city: 'Bangkok'
    },
    date_detected: '2023-06-01',
    risk_score: 0.67,
    reported_by: 'labuser',
    verified: true,
    blockchain_hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    human_readable_explanation: 'This mutation in the envelope protein could impact virus stability and infectivity.'
  },
  {
    id: 'mut-005',
    virus_name: 'Zika',
    genome_sequence: 'TGCAGACTAGCACTTCACTGCTTGGAACATCATCATGACTGGGAAAAGAGGAAAATGGATGTGGACT',
    mutation_type: 'NS5',
    location: {
      lat: -22.9068,
      lng: -43.1729,
      country: 'Brazil',
      city: 'Rio de Janeiro'
    },
    date_detected: '2023-05-28',
    risk_score: 0.54,
    reported_by: 'labuser',
    verified: false,
    blockchain_hash: null,
    human_readable_explanation: 'This mutation affects the NS5 protein which is involved in viral RNA replication.'
  }
];

const MutationTracker = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mutations, setMutations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 3 : 5);
  const [selectedMutation, setSelectedMutation] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addMutationOpen, setAddMutationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [virusFilter, setVirusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Get unique virus names for filter dropdown
  const virusNames = [...new Set(mockMutations.map(mutation => mutation.virus_name))];

  // Load mutations
  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    setTimeout(() => {
      setMutations(mockMutations);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter mutations based on search query and filters
  const filteredMutations = mutations.filter(mutation => {
    const matchesSearch = 
      searchQuery === '' || 
      mutation.virus_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mutation.mutation_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mutation.location.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mutation.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVirus = virusFilter === 'all' || mutation.virus_name === virusFilter;
    
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && mutation.verified) ||
      (verificationFilter === 'unverified' && !mutation.verified);
    
    return matchesSearch && matchesVirus && matchesVerification;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (mutation) => {
    setSelectedMutation(mutation);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const handleAddMutation = () => {
    setAddMutationOpen(true);
  };

  const handleCloseAddMutation = () => {
    setAddMutationOpen(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    // In a real implementation, this would fetch fresh data
    setTimeout(() => {
      setMutations(mockMutations);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyMutation = (id) => {
    // In a real implementation, this would call the API to verify the mutation
    setMutations(mutations.map(mutation => 
      mutation.id === id 
        ? { 
            ...mutation, 
            verified: true, 
            blockchain_hash: `0x${Math.random().toString(16).substr(2, 64)}`
          } 
        : mutation
    ));
  };

  const handleRunAnalysis = async (mutation) => {
    setAnalysisLoading(true);
    setAnalysisOpen(true);
    
    // Simulate analysis processing
    setTimeout(() => {
      const report = generateAnalysisReport(mutation);
      setAnalysisReport(report);
      setAnalysisLoading(false);
      setSnackbarOpen(true);
    }, 3000);
  };

  const generateAnalysisReport = (mutation) => {
    const currentDate = new Date().toLocaleDateString();
    const reportId = `ANALYSIS-${mutation.id}-${Date.now()}`;
    
    return {
      id: reportId,
      mutation: mutation,
      generatedDate: currentDate,
      analysisResults: {
        riskAssessment: {
          overallRisk: mutation.risk_score,
          transmissibilityRisk: Math.min(mutation.risk_score + 0.1, 1.0),
          severityRisk: Math.max(mutation.risk_score - 0.15, 0.1),
          vaccineEvasionRisk: mutation.risk_score * 0.8,
          therapeuticResistanceRisk: mutation.risk_score * 0.6
        },
        genomicAnalysis: {
          sequenceLength: mutation.genome_sequence.length,
          gcContent: calculateGCContent(mutation.genome_sequence),
          novelMutations: Math.floor(Math.random() * 5) + 1,
          conservedRegions: Math.floor(Math.random() * 3) + 2,
          functionalDomains: getFunctionalDomains(mutation.mutation_type)
        },
        epidemiologicalImpact: {
          estimatedR0Change: ((mutation.risk_score - 0.5) * 2).toFixed(2),
          populationAtRisk: Math.floor(Math.random() * 50000000) + 10000000,
          geographicSpread: getGeographicSpread(mutation.location.country),
          timeToDoubling: Math.floor(Math.random() * 14) + 3
        },
        recommendations: getRecommendations(mutation),
        confidence: Math.floor(mutation.risk_score * 100),
        dataQuality: mutation.verified ? 'High' : 'Medium'
      }
    };
  };

  const calculateGCContent = (sequence) => {
    const gcCount = (sequence.match(/[GC]/g) || []).length;
    return ((gcCount / sequence.length) * 100).toFixed(1);
  };

  const getFunctionalDomains = (mutationType) => {
    const domains = {
      'Spike protein': ['Receptor Binding Domain', 'Furin Cleavage Site', 'Fusion Peptide'],
      'Hemagglutinin': ['Receptor Binding Site', 'Fusion Domain', 'Antigenic Sites'],
      'Nucleocapsid': ['RNA Binding Domain', 'Dimerization Domain', 'Nuclear Localization Signal'],
      'Envelope': ['Membrane Fusion Domain', 'Glycosylation Sites', 'Antigenic Loops'],
      'NS5': ['RNA Polymerase Domain', 'Methyltransferase Domain', 'Nuclear Localization Signal']
    };
    return domains[mutationType] || ['Unknown Domain 1', 'Unknown Domain 2'];
  };

  const getGeographicSpread = (country) => {
    const spreads = {
      'USA': 'Continental spread likely within 2-3 weeks',
      'Japan': 'Regional spread across Asia-Pacific expected',
      'UK': 'European spread anticipated within 1-2 weeks',
      'Thailand': 'Southeast Asian regional spread probable',
      'Brazil': 'South American continental spread expected'
    };
    return spreads[country] || 'Regional spread pattern under assessment';
  };

  const getRecommendations = (mutation) => {
    const baseRecommendations = [
      'Enhanced surveillance in affected regions',
      'Accelerated vaccine effectiveness studies',
      'Updated diagnostic test validation'
    ];

    if (mutation.risk_score > 0.7) {
      return [
        ...baseRecommendations,
        'Immediate public health response activation',
        'Emergency vaccine strain update consideration',
        'International travel monitoring enhancement',
        'Hospital capacity planning and resource allocation'
      ];
    } else if (mutation.risk_score > 0.5) {
      return [
        ...baseRecommendations,
        'Increased testing and contact tracing',
        'Vaccine booster strategy review',
        'Healthcare system preparedness assessment'
      ];
    } else {
      return [
        ...baseRecommendations,
        'Continued monitoring and data collection',
        'Research collaboration enhancement'
      ];
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mutation Tracker
        </Typography>
        <Box>
          <Tooltip title="Add new mutation">
            <IconButton onClick={handleAddMutation} sx={{ mr: 1 }}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search mutations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                size: "small"
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <FilterListIcon color="primary" />
              </Grid>
              <Grid item xs={12} sm>
                <Typography variant="body2" sx={{ mb: { xs: 1, sm: 0 } }}>
                  Filters:
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
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
              <Grid item xs={6} sm={4} md={3}>
                <FormControl fullWidth size="small">
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
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Mutations Table */}
      <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }} aria-label="mutations table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Virus</TableCell>
                  <TableCell>Mutation Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Date Detected</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Verification</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMutations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((mutation) => (
                    <TableRow
                      key={mutation.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {mutation.id}
                      </TableCell>
                      <TableCell>{mutation.virus_name}</TableCell>
                      <TableCell>{mutation.mutation_type}</TableCell>
                      <TableCell>{`${mutation.location.city}, ${mutation.location.country}`}</TableCell>
                      <TableCell>{mutation.date_detected}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${(mutation.risk_score * 100).toFixed(0)}%`}
                          color={
                            mutation.risk_score > 0.7 ? 'error' :
                            mutation.risk_score > 0.4 ? 'warning' : 'success'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {mutation.verified ? (
                          <Chip 
                            icon={<VerifiedIcon />} 
                            label="Verified" 
                            color="primary" 
                            size="small" 
                            variant="outlined"
                          />
                        ) : (
                          <Chip 
                            label="Unverified" 
                            color="default" 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(mutation)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!mutation.verified && (
                          <Tooltip title="Verify mutation">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleVerifyMutation(mutation.id)}
                            >
                              <VerifiedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredMutations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No mutations found matching the current filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMutations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Mutation Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedMutation && (
          <>
            <DialogTitle>
              Mutation Details: {selectedMutation.id}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Virus
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedMutation.virus_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Mutation Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedMutation.mutation_type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {`${selectedMutation.location.city}, ${selectedMutation.location.country}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Date Detected
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedMutation.date_detected}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Risk Score
                  </Typography>
                  <Chip 
                    label={`${(selectedMutation.risk_score * 100).toFixed(0)}%`}
                    color={
                      selectedMutation.risk_score > 0.7 ? 'error' :
                      selectedMutation.risk_score > 0.4 ? 'warning' : 'success'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Verification Status
                  </Typography>
                  {selectedMutation.verified ? (
                    <Chip 
                      icon={<VerifiedIcon />} 
                      label="Verified" 
                      color="primary" 
                    />
                  ) : (
                    <Chip 
                      label="Unverified" 
                      color="default" 
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Genome Sequence
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      fontFamily: 'monospace', 
                      fontSize: '0.875rem',
                      overflowX: 'auto'
                    }}
                  >
                    {selectedMutation.genome_sequence}
                  </Paper>
                </Grid>
                {selectedMutation.blockchain_hash && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Blockchain Hash
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        fontFamily: 'monospace', 
                        fontSize: '0.875rem',
                        overflowX: 'auto'
                      }}
                    >
                      {selectedMutation.blockchain_hash}
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Explanation
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2 }}
                  >
                    <Typography variant="body1">
                      {selectedMutation.human_readable_explanation}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {!selectedMutation.verified && (
                <Button 
                  onClick={() => {
                    handleVerifyMutation(selectedMutation.id);
                    handleCloseDetails();
                  }}
                  color="primary"
                  startIcon={<VerifiedIcon />}
                >
                  Verify Mutation
                </Button>
              )}
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<InfoIcon />}
                onClick={() => {
                  handleCloseDetails();
                  handleRunAnalysis(selectedMutation);
                }}
              >
                Run Analysis
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Mutation Dialog */}
      <Dialog
        open={addMutationOpen}
        onClose={handleCloseAddMutation}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Mutation</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Virus Name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mutation Type"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Genome Sequence"
                required
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddMutation}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCloseAddMutation}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analysis Report Dialog */}
      <Dialog
        open={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            <Typography variant="h6">
              Mutation Analysis Report
            </Typography>
            {analysisReport && (
              <Chip 
                label={`Confidence: ${analysisReport.analysisResults.confidence}%`}
                color="primary"
                size="small"
              />
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {analysisLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Analyzing Mutation...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Running genomic analysis, risk assessment, and epidemiological modeling
              </Typography>
              <LinearProgress sx={{ mt: 3, mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                This may take a few moments
              </Typography>
            </Box>
          ) : analysisReport ? (
            <Box>
              {/* Report Header */}
              <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" gutterBottom>
                        {analysisReport.mutation.virus_name} - {analysisReport.mutation.mutation_type}
                      </Typography>
                      <Typography variant="body2">
                        Report ID: {analysisReport.id}
                      </Typography>
                      <Typography variant="body2">
                        Generated: {analysisReport.generatedDate}
                      </Typography>
                      <Typography variant="body2">
                        Location: {analysisReport.mutation.location.city}, {analysisReport.mutation.location.country}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold">
                          {(analysisReport.analysisResults.riskAssessment.overallRisk * 100).toFixed(0)}%
                        </Typography>
                        <Typography variant="body2">
                          Overall Risk Score
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="error" />
                    <Typography variant="h6">Risk Assessment</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>Transmissibility Risk</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={analysisReport.analysisResults.riskAssessment.transmissibilityRisk * 100}
                        color={analysisReport.analysisResults.riskAssessment.transmissibilityRisk > 0.7 ? 'error' : 'warning'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {(analysisReport.analysisResults.riskAssessment.transmissibilityRisk * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>Severity Risk</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={analysisReport.analysisResults.riskAssessment.severityRisk * 100}
                        color={analysisReport.analysisResults.riskAssessment.severityRisk > 0.7 ? 'error' : 'warning'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {(analysisReport.analysisResults.riskAssessment.severityRisk * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>Vaccine Evasion Risk</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={analysisReport.analysisResults.riskAssessment.vaccineEvasionRisk * 100}
                        color={analysisReport.analysisResults.riskAssessment.vaccineEvasionRisk > 0.7 ? 'error' : 'warning'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {(analysisReport.analysisResults.riskAssessment.vaccineEvasionRisk * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>Therapeutic Resistance Risk</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={analysisReport.analysisResults.riskAssessment.therapeuticResistanceRisk * 100}
                        color={analysisReport.analysisResults.riskAssessment.therapeuticResistanceRisk > 0.7 ? 'error' : 'warning'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {(analysisReport.analysisResults.riskAssessment.therapeuticResistanceRisk * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Genomic Analysis */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" />
                    <Typography variant="h6">Genomic Analysis</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>Sequence Properties</Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Sequence Length" 
                                secondary={`${analysisReport.analysisResults.genomicAnalysis.sequenceLength} nucleotides`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="GC Content" 
                                secondary={`${analysisReport.analysisResults.genomicAnalysis.gcContent}%`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Novel Mutations" 
                                secondary={`${analysisReport.analysisResults.genomicAnalysis.novelMutations} identified`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Conserved Regions" 
                                secondary={`${analysisReport.analysisResults.genomicAnalysis.conservedRegions} maintained`}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>Functional Domains</Typography>
                          <List dense>
                            {analysisReport.analysisResults.genomicAnalysis.functionalDomains.map((domain, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <Chip label={index + 1} size="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={domain} />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Epidemiological Impact */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PublicIcon color="warning" />
                    <Typography variant="h6">Epidemiological Impact</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary">
                          {analysisReport.analysisResults.epidemiologicalImpact.estimatedR0Change > 0 ? '+' : ''}
                          {analysisReport.analysisResults.epidemiologicalImpact.estimatedR0Change}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Estimated R₀ Change
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary">
                          {(analysisReport.analysisResults.epidemiologicalImpact.populationAtRisk / 1000000).toFixed(1)}M
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Population at Risk
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary">
                          {analysisReport.analysisResults.epidemiologicalImpact.timeToDoubling}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Days to Doubling
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary">
                          {analysisReport.analysisResults.dataQuality}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Data Quality
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="subtitle2" gutterBottom>Geographic Spread Prediction</Typography>
                        <Typography variant="body2">
                          {analysisReport.analysisResults.epidemiologicalImpact.geographicSpread}
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Recommendations */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RecommendIcon color="success" />
                    <Typography variant="h6">Recommendations</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {analysisReport.analysisResults.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            color={index < 3 ? "error" : index < 5 ? "warning" : "success"} 
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={recommendation}
                          secondary={index < 3 ? "High Priority" : index < 5 ? "Medium Priority" : "Standard Priority"}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : null}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAnalysisOpen(false)}>
            Close
          </Button>
          {analysisReport && (
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Generate and download report
                const reportContent = `
VIRALYTIX MUTATION ANALYSIS REPORT
Report ID: ${analysisReport.id}
Generated: ${analysisReport.generatedDate}

MUTATION DETAILS:
- Virus: ${analysisReport.mutation.virus_name}
- Type: ${analysisReport.mutation.mutation_type}
- Location: ${analysisReport.mutation.location.city}, ${analysisReport.mutation.location.country}
- Detection Date: ${analysisReport.mutation.date_detected}

RISK ASSESSMENT:
- Overall Risk: ${(analysisReport.analysisResults.riskAssessment.overallRisk * 100).toFixed(1)}%
- Transmissibility Risk: ${(analysisReport.analysisResults.riskAssessment.transmissibilityRisk * 100).toFixed(1)}%
- Severity Risk: ${(analysisReport.analysisResults.riskAssessment.severityRisk * 100).toFixed(1)}%
- Vaccine Evasion Risk: ${(analysisReport.analysisResults.riskAssessment.vaccineEvasionRisk * 100).toFixed(1)}%

GENOMIC ANALYSIS:
- Sequence Length: ${analysisReport.analysisResults.genomicAnalysis.sequenceLength} nucleotides
- GC Content: ${analysisReport.analysisResults.genomicAnalysis.gcContent}%
- Novel Mutations: ${analysisReport.analysisResults.genomicAnalysis.novelMutations}
- Functional Domains: ${analysisReport.analysisResults.genomicAnalysis.functionalDomains.join(', ')}

EPIDEMIOLOGICAL IMPACT:
- R₀ Change: ${analysisReport.analysisResults.epidemiologicalImpact.estimatedR0Change}
- Population at Risk: ${analysisReport.analysisResults.epidemiologicalImpact.populationAtRisk.toLocaleString()}
- Time to Doubling: ${analysisReport.analysisResults.epidemiologicalImpact.timeToDoubling} days
- Geographic Spread: ${analysisReport.analysisResults.epidemiologicalImpact.geographicSpread}

RECOMMENDATIONS:
${analysisReport.analysisResults.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

Analysis Confidence: ${analysisReport.analysisResults.confidence}%
Data Quality: ${analysisReport.analysisResults.dataQuality}

Generated by VIRALYTIX AI Platform
                `;
                
                const blob = new Blob([reportContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `mutation_analysis_${analysisReport.mutation.id}_${new Date().toISOString().split('T')[0]}.txt`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
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
          Analysis completed successfully! Report is ready for review.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MutationTracker;