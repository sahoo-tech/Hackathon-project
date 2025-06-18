import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, Chip, CircularProgress } from '@mui/material';
import axios from 'axios';

const DarkWebMonitor = () => {
  const [keywords, setKeywords] = useState([]);
  const [inputKeyword, setInputKeyword] = useState('');
  const [timeframe, setTimeframe] = useState(7);
  const [includeSources, setIncludeSources] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleAddKeyword = () => {
    if (inputKeyword.trim() && !keywords.includes(inputKeyword.trim())) {
      setKeywords([...keywords, inputKeyword.trim()]);
      setInputKeyword('');
    }
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    setKeywords(keywords.filter((kw) => kw !== keywordToDelete));
  };

  const handleRunSurveillance = async () => {
    if (keywords.length === 0) {
      setError('Please add at least one keyword.');
      return;
    }
    setError(null);
    setLoading(true);
    setReport(null);
    try {
      const response = await axios.post('/api/llm/dark-web-surveillance', {
        keywords,
        timeframe_days: timeframe,
        include_sources: includeSources,
      });
      setReport(response.data.content);
    } catch (err) {
      setError('Failed to fetch surveillance report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dark Web Surveillance
      </Typography>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          LLM-Powered Dark Web Monitoring
        </Typography>
        <Typography variant="body1" paragraph>
          Monitor dark web forums for discussions about engineered bioweapons, track potential biothreats, and generate intelligence reports.
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              label="Add Keyword"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="outlined" onClick={handleAddKeyword} fullWidth>
              Add
            </Button>
          </Grid>
          <Grid item xs={12}>
            {keywords.map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                onDelete={() => handleDeleteKeyword(keyword)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Timeframe (days)"
              type="number"
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
              inputProps={{ min: 1, max: 30 }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant={includeSources ? 'contained' : 'outlined'}
              onClick={() => setIncludeSources(!includeSources)}
              fullWidth
            >
              {includeSources ? 'Include Sources' : 'Exclude Sources'}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRunSurveillance}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Run Surveillance'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {report && (
        <Paper sx={{ p: 3, whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5' }}>
          <Typography variant="body1">{report}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DarkWebMonitor;
