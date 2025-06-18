import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Tabs, 
  Tab, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  Divider, 
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ScienceIcon from '@mui/icons-material/Science';
import PolicyIcon from '@mui/icons-material/Policy';
import { useNavigate, useLocation } from 'react-router-dom';
import { simulationService } from '../services/api';

const Simulation = ({ initialTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set the active tab based on the URL when the component mounts or the URL changes
  useEffect(() => {
    if (location.pathname === '/simulation/city-twin') {
      setActiveTab(0);
    } else if (location.pathname === '/simulation/policy') {
      setActiveTab(1);
    }
  }, [location.pathname]);

  // City Twin Simulation Form State
  const [cityName, setCityName] = useState('');
  const [population, setPopulation] = useState(1000000);
  const [initialCases, setInitialCases] = useState(100);
  const [rValue, setRValue] = useState(2.5);
  const [simulationDays, setSimulationDays] = useState(90);
  const [interventions, setInterventions] = useState([
    { type: 'social_distancing', effectiveness: 0.3 },
    { type: 'masking', effectiveness: 0.2 }
  ]);

  // Policy Simulation Form State
  const [region, setRegion] = useState('');
  const [policyPopulation, setPolicyPopulation] = useState(1000000);
  const [currentCases, setCurrentCases] = useState(500);
  const [availablePolicies, setAvailablePolicies] = useState([
    'social_distancing',
    'masking',
    'testing',
    'contact_tracing',
    'travel_restrictions',
    'vaccination'
  ]);
  const [policySimulationDays, setPolicySimulationDays] = useState(180);
  const [policyResults, setPolicyResults] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset results when switching tabs
    setSimulationResults(null);
    setPolicyResults(null);
    
    // Update the URL based on the selected tab
    if (newValue === 0) {
      navigate('/simulation/city-twin');
    } else if (newValue === 1) {
      navigate('/simulation/policy');
    }
  };

  const handleInterventionChange = (index, field, value) => {
    const updatedInterventions = [...interventions];
    updatedInterventions[index][field] = value;
    setInterventions(updatedInterventions);
  };

  const addIntervention = () => {
    setInterventions([...interventions, { type: 'social_distancing', effectiveness: 0.3 }]);
  };

  const removeIntervention = (index) => {
    const updatedInterventions = interventions.filter((_, i) => i !== index);
    setInterventions(updatedInterventions);
  };

  const runCityTwinSimulation = async () => {
    if (!cityName || population <= 0 || initialCases <= 0) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields with valid values.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a deep copy of interventions to ensure it's properly serialized
      const interventionsCopy = interventions.map(intervention => ({
        type: intervention.type,
        effectiveness: intervention.effectiveness
      }));
      
      const simulationData = {
        city_name: cityName,
        population: population,
        initial_cases: initialCases,
        r_value: rValue,
        simulation_days: simulationDays,
        intervention_measures: interventionsCopy,
        virus_name: 'SARS-CoV-2 Variant'
      };
      
      console.log('Sending simulation data:', JSON.stringify(simulationData));
      
      const response = await simulationService.runCityTwinSimulation(simulationData);
      console.log('Received simulation response:', response);
      
      setSimulationResults(response);
      setSnackbar({
        open: true,
        message: 'Simulation completed successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error running simulation:', err);
      setError(err.response?.data?.detail || 'Failed to run simulation. Please try again.');
      setSnackbar({
        open: true,
        message: 'Error running simulation. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const runPolicySimulation = async () => {
    if (!region || policyPopulation <= 0 || currentCases <= 0) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields with valid values.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a deep copy of available policies to ensure proper serialization
      const policiesCopy = [...availablePolicies];
      
      const simulationData = {
        region: region,
        population: policyPopulation,
        current_cases: currentCases,
        virus_properties: {
          r0: rValue,
          severity: 'moderate'
        },
        available_policies: policiesCopy,
        simulation_days: policySimulationDays
      };
      
      console.log('Sending policy simulation data:', JSON.stringify(simulationData));
      
      const response = await simulationService.runPolicySimulation(simulationData);
      console.log('Received policy simulation response:', response);
      
      setPolicyResults(response);
      setSnackbar({
        open: true,
        message: 'Policy simulation completed successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error running policy simulation:', err);
      setError(err.response?.data?.detail || 'Failed to run policy simulation. Please try again.');
      setSnackbar({
        open: true,
        message: 'Error running policy simulation. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Simulations
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab icon={<ScienceIcon />} label="Bio-Digital Twin" />
        <Tab icon={<PolicyIcon />} label="Policy Simulator" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                City Twin Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="City Name"
                    fullWidth
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Population"
                    type="number"
                    fullWidth
                    value={population}
                    onChange={(e) => setPopulation(Number(e.target.value))}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Initial Cases"
                    type="number"
                    fullWidth
                    value={initialCases}
                    onChange={(e) => setInitialCases(Number(e.target.value))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>R Value (Basic Reproduction Number)</Typography>
                  <Slider
                    value={rValue}
                    min={0.5}
                    max={5}
                    step={0.1}
                    onChange={(e, newValue) => setRValue(newValue)}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0.5, label: '0.5' },
                      { value: 2.5, label: '2.5' },
                      { value: 5, label: '5' }
                    ]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Simulation Days"
                    type="number"
                    fullWidth
                    value={simulationDays}
                    onChange={(e) => setSimulationDays(Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Intervention Measures
                  </Typography>
                  {interventions.map((intervention, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Intervention Type</InputLabel>
                            <Select
                              value={intervention.type}
                              label="Intervention Type"
                              onChange={(e) => handleInterventionChange(index, 'type', e.target.value)}
                            >
                              <MenuItem value="social_distancing">Social Distancing</MenuItem>
                              <MenuItem value="masking">Masking</MenuItem>
                              <MenuItem value="testing">Testing</MenuItem>
                              <MenuItem value="contact_tracing">Contact Tracing</MenuItem>
                              <MenuItem value="travel_restrictions">Travel Restrictions</MenuItem>
                              <MenuItem value="vaccination">Vaccination</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography gutterBottom>
                            Effectiveness: {intervention.effectiveness}
                          </Typography>
                          <Slider
                            value={intervention.effectiveness}
                            min={0}
                            max={1}
                            step={0.05}
                            onChange={(e, newValue) => handleInterventionChange(index, 'effectiveness', newValue)}
                            valueLabelDisplay="auto"
                          />
                        </Grid>
                      </Grid>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => removeIntervention(index)}
                        disabled={interventions.length <= 1}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <Button variant="outlined" onClick={addIntervention}>
                    Add Intervention
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={runCityTwinSimulation}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Run Simulation'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Simulation Results
              </Typography>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {simulationResults && (
                <Box>
                  <Typography variant="subtitle1">
                    Summary for {simulationResults.request.city_name}
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" color="primary">
                            {simulationResults.summary.total_cases.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Cases
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" color="error">
                            {simulationResults.summary.total_deaths.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Deaths
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" color="warning.main">
                            {simulationResults.summary.peak_active_cases.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Peak Cases
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" color="info.main">
                            {simulationResults.summary.duration_days}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Duration (days)
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Outbreak Progression
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={simulationResults.results}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="active_cases" stroke="#8884d8" name="Active Cases" />
                      <Line type="monotone" dataKey="hospitalized" stroke="#82ca9d" name="Hospitalized" />
                      <Line type="monotone" dataKey="deaths" stroke="#ff7300" name="Deaths" />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <Chip 
                    label={simulationResults.summary.contained ? "Outbreak Contained" : "Outbreak Ongoing"} 
                    color={simulationResults.summary.contained ? "success" : "warning"}
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}
              {!simulationResults && !loading && !error && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
                  Configure and run a simulation to see results here
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Policy Simulation Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Region Name"
                    fullWidth
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Population"
                    type="number"
                    fullWidth
                    value={policyPopulation}
                    onChange={(e) => setPolicyPopulation(Number(e.target.value))}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Current Cases"
                    type="number"
                    fullWidth
                    value={currentCases}
                    onChange={(e) => setCurrentCases(Number(e.target.value))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>R Value (Basic Reproduction Number)</Typography>
                  <Slider
                    value={rValue}
                    min={0.5}
                    max={5}
                    step={0.1}
                    onChange={(e, newValue) => setRValue(newValue)}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0.5, label: '0.5' },
                      { value: 2.5, label: '2.5' },
                      { value: 5, label: '5' }
                    ]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Simulation Days"
                    type="number"
                    fullWidth
                    value={policySimulationDays}
                    onChange={(e) => setPolicySimulationDays(Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Available Policies
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    <Chip label="Social Distancing" color="primary" />
                    <Chip label="Masking" color="primary" />
                    <Chip label="Testing" color="primary" />
                    <Chip label="Contact Tracing" color="primary" />
                    <Chip label="Travel Restrictions" color="primary" />
                    <Chip label="Vaccination" color="primary" />
                    <Chip label="Economic Support" color="primary" />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={runPolicySimulation}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Run Policy Simulation'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Policy Simulation Results
              </Typography>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {policyResults && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Optimal Policy Strategy
                  </Typography>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Recommended Policy Package
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(policyResults.optimal_strategy.policy).map(([key, value]) => (
                          <Grid item xs={6} sm={4} key={key}>
                            <Typography variant="body2" color="text.secondary">
                              {key.replace(/_/g, ' ')}
                            </Typography>
                            <Typography variant="body1">
                              {value}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Impact Scores
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(policyResults.optimal_strategy.impact_scores).map(([key, value]) => (
                          <Grid item xs={6} sm={4} md={2} key={key}>
                            <Typography variant="body2" color="text.secondary">
                              {key.replace(/_/g, ' ')}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {Math.round(value)}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Policy Comparison
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="health_score" stroke="#8884d8" name="Health Impact" />
                      <Line type="monotone" dataKey="economic_score" stroke="#82ca9d" name="Economic Impact" />
                      <Line type="monotone" dataKey="social_score" stroke="#ff7300" name="Social Impact" />
                      <Line type="monotone" dataKey="overall_score" stroke="#0088FE" name="Overall Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
              {!policyResults && !loading && !error && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
                  Configure and run a policy simulation to see results here
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Simulation;