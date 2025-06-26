import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Icons
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BiotechIcon from '@mui/icons-material/Biotech';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';

// Mock data
const mockData = {
  activeMutations: 12,
  activeOutbreaks: 5,
  riskScore: 0.68,
  recentMutations: [
    { id: 'mut-001', virus: 'SARS-CoV-2', type: 'Spike protein', location: 'New York, USA', risk: 0.75, date: '2023-06-10' },
    { id: 'mut-002', virus: 'H1N1', type: 'Hemagglutinin', location: 'Tokyo, Japan', risk: 0.62, date: '2023-06-08' },
    { id: 'mut-003', virus: 'SARS-CoV-2', type: 'Nucleocapsid', location: 'London, UK', risk: 0.58, date: '2023-06-05' },
  ],
  recentOutbreaks: [
    { id: 'ob-001', virus: 'SARS-CoV-2', location: 'New York, USA', cases: 5000, status: 'active', trend: 'up' },
    { id: 'ob-002', virus: 'H1N1', location: 'Tokyo, Japan', cases: 3000, status: 'contained', trend: 'down' },
  ],
  globalHotspots: [
    { location: 'New York, USA', risk: 0.85, viruses: ['SARS-CoV-2', 'H1N1'] },
    { location: 'Tokyo, Japan', risk: 0.72, viruses: ['H1N1'] },
    { location: 'Mexico City, Mexico', risk: 0.68, viruses: ['SARS-CoV-2', 'Dengue'] },
    { location: 'New Delhi, India', risk: 0.79, viruses: ['SARS-CoV-2', 'H1N1', 'Dengue'] },
    { location: 'São Paulo, Brazil', risk: 0.76, viruses: ['SARS-CoV-2', 'Dengue', 'Zika'] },
  ]
};

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: 12,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: isMobile ? 2 : 3,
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? 1 : 0
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom={!isSmallMobile}
          sx={{ 
            fontSize: isSmallMobile ? '1.5rem' : undefined,
            textAlign: isSmallMobile ? 'center' : 'left'
          }}
        >
          Dashboard
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton size={isMobile ? "small" : "medium"}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 3 : 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Active Mutations
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {mockData.activeMutations}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last 30 days
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Active Outbreaks
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {mockData.activeOutbreaks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Worldwide
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <StatCard>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Global Risk Score
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                color: mockData.riskScore > 0.7 ? 'error.main' : 
                       mockData.riskScore > 0.4 ? 'warning.main' : 'success.main'
              }}
            >
              {(mockData.riskScore * 100).toFixed(0)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mockData.riskScore > 0.7 ? 'High' : 
               mockData.riskScore > 0.4 ? 'Moderate' : 'Low'} Alert Level
            </Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Recent Mutations */}
        <Grid item xs={12} lg={6}>
          <StyledCard>
            <CardHeader
              title="Recent Mutations"
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1, p: 0 }}>
              <List>
                {mockData.recentMutations.map((mutation, index) => (
                  <React.Fragment key={mutation.id}>
                    <ListItem
                      secondaryAction={
                        <Chip 
                          label={`Risk: ${(mutation.risk * 100).toFixed(0)}%`}
                          color={mutation.risk > 0.7 ? 'error' : 
                                 mutation.risk > 0.4 ? 'warning' : 'success'}
                          size="small"
                        />
                      }
                    >
                      <ListItemIcon>
                        <BiotechIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${mutation.virus} (${mutation.type})`}
                        secondary={`${mutation.location} • ${mutation.date}`}
                        primaryTypographyProps={{
                          fontSize: isMobile ? '0.875rem' : undefined,
                          noWrap: isSmallMobile
                        }}
                        secondaryTypographyProps={{
                          fontSize: isMobile ? '0.75rem' : undefined,
                          noWrap: isSmallMobile
                        }}
                      />
                    </ListItem>
                    {index < mockData.recentMutations.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
            <Divider />
            <Box sx={{ 
              p: isMobile ? 1.5 : 2, 
              display: 'flex', 
              justifyContent: isSmallMobile ? 'center' : 'flex-end' 
            }}>
              <Button 
                size={isMobile ? "small" : "small"}
                color="primary"
                onClick={() => navigate('/mutations')}
                fullWidth={isSmallMobile}
                sx={{
                  fontSize: isSmallMobile ? '0.75rem' : undefined
                }}
              >
                View All Mutations
              </Button>
            </Box>
          </StyledCard>
        </Grid>

        {/* Recent Outbreaks */}
        <Grid item xs={12} lg={6}>
          <StyledCard>
            <CardHeader
              title="Active Outbreaks"
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1, p: 0 }}>
              <List>
                {mockData.recentOutbreaks.map((outbreak, index) => (
                  <React.Fragment key={outbreak.id}>
                    <ListItem
                      secondaryAction={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          flexDirection: isSmallMobile ? 'column' : 'row',
                          gap: isSmallMobile ? 0.5 : 0
                        }}>
                          {outbreak.trend === 'up' ? (
                            <TrendingUpIcon 
                              color="error" 
                              sx={{ 
                                mr: isSmallMobile ? 0 : 1,
                                fontSize: isMobile ? '1rem' : undefined
                              }} 
                            />
                          ) : (
                            <TrendingDownIcon 
                              color="success" 
                              sx={{ 
                                mr: isSmallMobile ? 0 : 1,
                                fontSize: isMobile ? '1rem' : undefined
                              }} 
                            />
                          )}
                          <Chip 
                            label={outbreak.status}
                            color={outbreak.status === 'active' ? 'error' : 
                                   outbreak.status === 'contained' ? 'warning' : 'success'}
                            size={isMobile ? "small" : "small"}
                            sx={{
                              fontSize: isSmallMobile ? '0.7rem' : undefined,
                              height: isSmallMobile ? '20px' : undefined
                            }}
                          />
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <CoronavirusIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${outbreak.virus} in ${outbreak.location}`}
                        secondary={`${outbreak.cases.toLocaleString()} confirmed cases`}
                        primaryTypographyProps={{
                          fontSize: isMobile ? '0.875rem' : undefined,
                          noWrap: isSmallMobile
                        }}
                        secondaryTypographyProps={{
                          fontSize: isMobile ? '0.75rem' : undefined,
                          noWrap: isSmallMobile
                        }}
                      />
                    </ListItem>
                    {index < mockData.recentOutbreaks.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
            <Divider />
            <Box sx={{ 
              p: isMobile ? 1.5 : 2, 
              display: 'flex', 
              justifyContent: isSmallMobile ? 'center' : 'flex-end' 
            }}>
              <Button 
                size={isMobile ? "small" : "small"}
                color="primary"
                onClick={() => navigate('/outbreaks')}
                fullWidth={isSmallMobile}
                sx={{
                  fontSize: isSmallMobile ? '0.75rem' : undefined
                }}
              >
                View Outbreak Map
              </Button>
            </Box>
          </StyledCard>
        </Grid>

        {/* Global Hotspots */}
        <Grid item xs={12}>
          <StyledCard>
            <CardHeader
              title="Global Hotspots"
              subheader="Regions with highest risk scores"
              action={
                <Tooltip title="Risk is calculated based on active mutations, outbreaks, and environmental factors">
                  <IconButton aria-label="info">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {mockData.globalHotspots.map((hotspot) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={hotspot.location}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <WarningIcon 
                          color={hotspot.risk > 0.7 ? 'error' : 'warning'} 
                          sx={{ mr: 1 }} 
                        />
                        <Typography variant="h6" component="div">
                          {(hotspot.risk * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <Typography variant="body2" gutterBottom>
                        {hotspot.location}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                        {hotspot.viruses.map((virus) => (
                          <Chip 
                            key={virus} 
                            label={virus} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                color="primary"
                onClick={() => navigate('/simulation/city-twin')}
              >
                Build Digital Twin
              </Button>
            </Box>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;