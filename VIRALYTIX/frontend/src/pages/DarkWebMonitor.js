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

  // Generate mock dark web report for demo purposes
  const generateMockReport = () => {
    const threatLevels = ["Low", "Moderate", "Elevated", "High", "Severe"];
    const threatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];
    
    const summaries = [
      `Analysis of dark web forums and marketplaces over the past ${timeframe} days has identified ${Math.floor(Math.random() * 10) + 3} discussions related to the monitored keywords. Most activity appears to be academic or speculative in nature, with no credible threats identified.`,
      `Monitoring has detected an ${Math.floor(Math.random() * 20) + 10}% increase in discussions related to viral mutations and bioengineering techniques. While most content remains theoretical, several users have expressed interest in practical applications.`,
      `Surveillance has identified a coordinated discussion thread across multiple forums regarding methods to synthesize viral vectors. The technical sophistication of these discussions suggests participants with advanced knowledge in molecular biology.`
    ];
    
    const findingsTemplates = [
      "1. Increased mention of {keyword} in specialized forums, primarily academic discussions\n2. Several users requesting information about {keyword2} synthesis protocols\n3. No evidence of actual bioengineering attempts\n4. One user claiming to have access to laboratory equipment",
      "1. Identified a closed group discussing {keyword} modification techniques\n2. Multiple references to published research on {keyword2}\n3. Sharing of publicly available genomic databases\n4. Discussion of hypothetical pandemic scenarios",
      "1. Detection of unusual terminology potentially used as code for {keyword}\n2. Users sharing links to academic papers on {keyword2}\n3. Discussion of laboratory security vulnerabilities\n4. Mention of specific geographic regions for potential release"
    ];
    
    const recommendationsTemplates = [
      "1. Continue monitoring mentioned forums for escalation\n2. Cross-reference usernames with known threat actors\n3. No immediate action required beyond standard surveillance",
      "1. Increase monitoring frequency for identified forums\n2. Alert relevant research institutions about potential security concerns\n3. Review access controls for public genomic databases\n4. Prepare briefing for health security officials",
      "1. Immediate notification to relevant authorities\n2. Enhanced monitoring of identified users\n3. Coordinate with international partners on cross-border threats\n4. Review biosecurity protocols at mentioned facilities"
    ];
    
    // Generate report components
    const summary = summaries[Math.floor(Math.random() * summaries.length)];
    
    // Select two random keywords for the findings
    const selectedKeywords = keywords.length >= 2 
      ? keywords.sort(() => 0.5 - Math.random()).slice(0, 2) 
      : [...keywords, ...keywords];
    
    const findingsTemplate = findingsTemplates[Math.floor(Math.random() * findingsTemplates.length)];
    const findings = findingsTemplate
      .replace("{keyword}", selectedKeywords[0])
      .replace("{keyword2}", selectedKeywords[1] || selectedKeywords[0]);
    
    const details = `Detailed analysis of ${Math.floor(Math.random() * 80) + 20} forum posts and ${Math.floor(Math.random() * 25) + 5} marketplace listings revealed patterns consistent with ${["academic interest", "conspiracy theories", "potential threat actors", "disinformation campaigns"][Math.floor(Math.random() * 4)]}. Technical language analysis suggests participants have ${["basic", "intermediate", "advanced"][Math.floor(Math.random() * 3)]} knowledge of virology and molecular biology.`;
    
    const recommendations = recommendationsTemplates[Math.floor(Math.random() * recommendationsTemplates.length)];
    
    const credibility = `${Math.floor(Math.random() * 60) + 30}%`;
    const impact = ["Limited", "Moderate", "Significant", "Severe"][Math.floor(Math.random() * 4)];
    
    // Generate sources section if requested
    let sourcesSection = "";
    if (includeSources) {
      sourcesSection = `
## Sources
1. Forum: ${["DarkBioTalk", "ShadowLab", "BioCrypt", "NexusResearch"][Math.floor(Math.random() * 4)]} - ${Math.floor(Math.random() * 15) + 5} relevant posts
2. Marketplace: ${["BlackMarket", "HiddenExchange", "DarkBazaar"][Math.floor(Math.random() * 3)]} - ${Math.floor(Math.random() * 7) + 1} listings
3. Telegram group: ${["ViralResearch", "BioHackers", "SyntheticLife"][Math.floor(Math.random() * 3)]} - ${Math.floor(Math.random() * 40) + 10} messages
`;
    }
    
    // Format the current date
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
    
    // Assemble the report
    return `
# Dark Web Surveillance Report
**Generated:** ${formattedDate}
**Timeframe:** Past ${timeframe} days
**Keywords monitored:** ${keywords.join(", ")}
**Confidence level:** ${Math.floor(Math.random() * 35) + 60}%

## Executive Summary
${summary}

## Key Findings
${findings}

## Threat Assessment
**Overall threat level:** ${threatLevel}
**Credibility of information:** ${credibility}
**Potential impact:** ${impact}

## Detailed Intelligence
${details}

## Recommended Actions
${recommendations}

${sourcesSection}

**CONFIDENTIAL - FOR AUTHORIZED PERSONNEL ONLY**
`;
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
      // For demo purposes, use mock data instead of making an actual API call
      setTimeout(() => {
        const mockReport = generateMockReport();
        setReport(mockReport);
        setLoading(false);
      }, 1500); // Simulate network delay
      
      // In a production environment, you would use this code:
      /*
      const response = await axios.post('/api/llm/dark-web-surveillance', {
        keywords,
        timeframe_days: timeframe,
        include_sources: includeSources,
      });
      setReport(response.data.content);
      */
    } catch (err) {
      setError('Failed to fetch surveillance report. Please try again.');
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
