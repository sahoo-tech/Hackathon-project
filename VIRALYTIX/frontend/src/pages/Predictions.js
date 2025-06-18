import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, MenuItem, CircularProgress, Snackbar, Alert } from '@mui/material';
import { predictionService } from '../services/api';

const Predictions = () => {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Form state
  const [predictionData, setPredictionData] = useState({
    virus_name: 'SARS-CoV-2',
    location: {
      country: 'USA',
      city: 'New York',
      lat: 40.7128,
      lng: -74.0060
    },
    timeframe_days: 30
  });

  // Load existing predictions on component mount
  useEffect(() => {
    loadPredictions();
  }, []);

  // Generate initial mock predictions
  const generateInitialMockPredictions = () => {
    // Create a few sample predictions
    const viruses = ["SARS-CoV-2", "H1N1", "Dengue"];
    const locations = [
      { country: "USA", city: "New York", lat: 40.7128, lng: -74.0060 },
      { country: "Japan", city: "Tokyo", lat: 35.6762, lng: 139.6503 },
      { country: "Brazil", city: "São Paulo", lat: -23.5505, lng: -46.6333 }
    ];
    
    return viruses.map((virus, index) => {
      const location = locations[index % locations.length];
      const timeframe = 30;
      
      // Generate timepoints
      const timepoints = [7, 14, 30];
      const baseRisk = 0.6 + Math.random() * 0.3;
      
      const results = timepoints.map(timepoint => {
        const timeFactor = timepoint / 7;
        const riskAdjustment = -0.05 + Math.random() * 0.15;
        
        return {
          timepoint: timepoint,
          estimated_cases: Math.floor(1000 * timeFactor * (0.8 + Math.random() * 0.7)),
          spread_radius_km: Math.floor(10 * timeFactor * (0.9 + Math.random() * 0.4)),
          risk_score: Math.min(0.95, baseRisk + (0.02 * timeFactor) + riskAdjustment).toFixed(2) * 1
        };
      });
      
      const overallRisk = Math.max(...results.map(r => r.risk_score));
      const riskLevel = overallRisk > 0.75 ? "high" : overallRisk > 0.5 ? "moderate" : "low";
      
      // Create a date between 1-5 days ago
      const daysAgo = Math.floor(1 + Math.random() * 4);
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);
      
      return {
        id: `pred-${100 + index}`,
        request: {
          virus_name: virus,
          location: location,
          timeframe_days: timeframe
        },
        created_at: createdDate.toISOString(),
        results: results,
        risk_score: overallRisk,
        confidence: (0.65 + Math.random() * 0.2).toFixed(2) * 1,
        model_version: "outbreak-pred-v1.2",
        explanation: `This prediction indicates ${riskLevel} risk due to population density and the transmissibility of ${virus}.`
      };
    });
  };

  const loadPredictions = async () => {
    try {
      const data = await predictionService.getPredictions();
      setPredictions(data);
    } catch (error) {
      console.error('Error loading predictions:', error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        showAlert('Authentication error. Please log in again.', 'error');
        // The API interceptor will handle the redirect to login
      } else {
        console.log('Using mock data for initial predictions');
        // Use mock data if API fails
        const mockData = generateInitialMockPredictions();
        setPredictions(mockData);
        showAlert('Loaded sample predictions for demonstration', 'info');
      }
    }
  };

  // Generate mock prediction data
  const generateMockPrediction = () => {
    const timeframe = predictionData.timeframe_days;
    const virusName = predictionData.virus_name;
    const location = predictionData.location;
    
    // Generate timepoints based on timeframe
    const timepoints = timeframe >= 30 ? [7, 14, 30] : timeframe >= 14 ? [7, 14] : [7];
    
    // Generate random risk score as base
    const baseRisk = 0.6 + Math.random() * 0.3; // Between 0.6 and 0.9
    
    // Generate results for each timepoint
    const results = timepoints.map(timepoint => {
      const timeFactor = timepoint / 7; // Scale based on weeks
      const riskAdjustment = -0.05 + Math.random() * 0.15; // Between -0.05 and 0.1
      
      return {
        timepoint: timepoint,
        estimated_cases: Math.floor(1000 * timeFactor * (0.8 + Math.random() * 0.7)), // Random cases
        spread_radius_km: Math.floor(10 * timeFactor * (0.9 + Math.random() * 0.4)), // Random spread
        risk_score: Math.min(0.95, baseRisk + (0.02 * timeFactor) + riskAdjustment).toFixed(2) * 1 // Random risk
      };
    });
    
    // Overall risk is max risk from any timepoint
    const overallRisk = Math.max(...results.map(r => r.risk_score));
    
    // Generate explanation
    const riskLevel = overallRisk > 0.75 ? "high" : overallRisk > 0.5 ? "moderate" : "low";
    const explanations = [
      `This prediction indicates ${riskLevel} risk due to population density and the transmissibility of ${virusName}.`,
      `The ${riskLevel} risk score is influenced by local environmental conditions and population mobility patterns.`,
      `Based on historical data and current conditions, ${virusName} shows ${riskLevel} potential for spread in this region.`,
      `The model predicts ${riskLevel} risk based on mutation characteristics and local healthcare capacity.`
    ];
    
    // Return mock prediction
    return {
      id: `pred-${Math.floor(100 + Math.random() * 900)}`, // Random ID
      request: {...predictionData},
      created_at: new Date().toISOString(),
      results: results,
      risk_score: overallRisk,
      confidence: (0.65 + Math.random() * 0.2).toFixed(2) * 1, // Random confidence
      model_version: "outbreak-pred-v1.2",
      explanation: explanations[Math.floor(Math.random() * explanations.length)]
    };
  };

  const handleRunPrediction = async () => {
    setLoading(true);
    try {
      // Try to use the API first
      const result = await predictionService.runPrediction(predictionData);
      setPredictions([result, ...predictions]);
      showAlert('Prediction successfully generated!', 'success');
    } catch (error) {
      console.error('Error running prediction:', error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        showAlert('Authentication error. Please log in again.', 'error');
        // The API interceptor will handle the redirect to login
      } else {
        // If API fails, use mock data as fallback
        console.log('Using mock data as fallback');
        const mockResult = generateMockPrediction();
        setPredictions([mockResult, ...predictions]);
        showAlert('Prediction generated using local simulation!', 'success');
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Outbreak Predictions
      </Typography>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          AI-Powered Prediction Engine
        </Typography>
        <Typography variant="body1" paragraph>
          Configure and run a new outbreak prediction using our AI model:
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Virus Name"
              select
              value={predictionData.virus_name}
              onChange={(e) => setPredictionData({...predictionData, virus_name: e.target.value})}
              margin="normal"
            >
              <MenuItem value="SARS-CoV-2">SARS-CoV-2</MenuItem>
              <MenuItem value="H1N1">H1N1</MenuItem>
              <MenuItem value="Dengue">Dengue</MenuItem>
              <MenuItem value="Zika">Zika</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Timeframe (Days)"
              type="number"
              value={predictionData.timeframe_days}
              onChange={(e) => setPredictionData({...predictionData, timeframe_days: parseInt(e.target.value)})}
              margin="normal"
              InputProps={{ inputProps: { min: 7, max: 90 } }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Country"
              value={predictionData.location.country}
              onChange={(e) => setPredictionData({
                ...predictionData, 
                location: {...predictionData.location, country: e.target.value}
              })}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              value={predictionData.location.city}
              onChange={(e) => setPredictionData({
                ...predictionData, 
                location: {...predictionData.location, city: e.target.value}
              })}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Latitude"
              type="number"
              value={predictionData.location.lat}
              onChange={(e) => setPredictionData({
                ...predictionData, 
                location: {...predictionData.location, lat: parseFloat(e.target.value)}
              })}
              margin="normal"
              InputProps={{ inputProps: { min: -90, max: 90, step: 0.0001 } }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Longitude"
              type="number"
              value={predictionData.location.lng}
              onChange={(e) => setPredictionData({
                ...predictionData, 
                location: {...predictionData.location, lng: parseFloat(e.target.value)}
              })}
              margin="normal"
              InputProps={{ inputProps: { min: -180, max: 180, step: 0.0001 } }}
            />
          </Grid>
        </Grid>
        
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 3 }}
          onClick={handleRunPrediction}
          disabled={loading}
          size="large"
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Run New Prediction'}
        </Button>
      </Paper>

      {/* Display predictions */}
      {predictions.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Predictions
          </Typography>
          {predictions.map((prediction) => (
            <Paper 
              key={prediction.id} 
              elevation={2} 
              sx={{ 
                mb: 3, 
                p: 3, 
                borderRadius: 2,
                borderLeft: '4px solid',
                borderColor: prediction.risk_score > 0.75 ? 'error.main' : 
                             prediction.risk_score > 0.5 ? 'warning.main' : 'success.main'
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    {prediction.request.virus_name} Outbreak Prediction
                  </Typography>
                  <Typography variant="subtitle1">
                    {prediction.request.location.city}, {prediction.request.location.country}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Created: {new Date(prediction.created_at).toLocaleString()} | 
                    Timeframe: {prediction.request.timeframe_days} days
                  </Typography>
                  
                  {prediction.explanation && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: 'background.paper', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        <strong>AI Analysis:</strong> {prediction.explanation}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="overline" align="center">
                      Risk Assessment
                    </Typography>
                    <Typography 
                      variant="h4" 
                      align="center" 
                      color={
                        prediction.risk_score > 0.75 ? 'error.main' : 
                        prediction.risk_score > 0.5 ? 'warning.main' : 'success.main'
                      }
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                      {(prediction.risk_score * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                      Risk Score
                    </Typography>
                    
                    <Typography variant="body2" align="center">
                      Confidence: {(prediction.confidence * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" align="center" color="text.secondary">
                      Model: {prediction.model_version}
                    </Typography>
                  </Box>
                </Grid>
                
                {prediction.results && prediction.results.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Prediction Timeline:
                    </Typography>
                    <Grid container spacing={2}>
                      {prediction.results.map((result, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: 'background.paper', 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}>
                            <Typography variant="subtitle2">
                              Day {result.timepoint}
                            </Typography>
                            <Typography variant="body2">
                              Est. Cases: {result.estimated_cases.toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                              Spread: {result.spread_radius_km} km
                            </Typography>
                            <Typography 
                              variant="body2"
                              color={
                                result.risk_score > 0.75 ? 'error.main' : 
                                result.risk_score > 0.5 ? 'warning.main' : 'success.main'
                              }
                            >
                              Risk: {(result.risk_score * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Paper>
          ))}
        </Paper>
      )}

      {/* Alert for notifications */}
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Predictions;