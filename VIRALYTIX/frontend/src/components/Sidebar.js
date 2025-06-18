import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box, 
  Toolbar,
  Typography,
  Collapse
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import BiotechIcon from '@mui/icons-material/Biotech';
import PublicIcon from '@mui/icons-material/Public';
import TimelineIcon from '@mui/icons-material/Timeline';
import ScienceIcon from '@mui/icons-material/Science';
import SecurityIcon from '@mui/icons-material/Security';
import GroupsIcon from '@mui/icons-material/Groups';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import ExploreIcon from '@mui/icons-material/Explore';
import AccessibilityIcon from '@mui/icons-material/Accessibility';

const drawerWidth = 240;

const Sidebar = ({ open, onClose, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [simulationOpen, setSimulationOpen] = React.useState(false);

  const handleSimulationClick = () => {
    setSimulationOpen(!simulationOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 600) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define menu items
  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/',
      roles: ['user', 'lab', 'government', 'ngo']
    },
    { 
      text: 'Mutation Tracker', 
      icon: <BiotechIcon />, 
      path: '/mutations',
      roles: ['user', 'lab', 'government', 'ngo']
    },
    { 
      text: 'Mutation Heatmap', 
      icon: <ExploreIcon />, 
      path: '/mutation-heatmap',
      roles: ['user', 'lab', 'government', 'ngo']
    },
    { 
      text: 'Outbreak Map', 
      icon: <PublicIcon />, 
      path: '/outbreaks',
      roles: ['user', 'lab', 'government', 'ngo']
    },
    { 
      text: 'Predictions', 
      icon: <TimelineIcon />, 
      path: '/predictions',
      roles: ['user', 'lab', 'government', 'ngo']
    },
    { 
      text: 'Simulations', 
      icon: <ScienceIcon />, 
      path: '/simulation',
      submenu: true,
      roles: ['lab', 'government', 'ngo'],
      subItems: [
        { 
          text: 'Bio-Digital Twin', 
          icon: <MapIcon />, 
          path: '/simulation/city-twin',
          roles: ['lab', 'government', 'ngo']
        },
        { 
          text: 'Policy Simulator', 
          icon: <BarChartIcon />, 
          path: '/simulation/policy',
          roles: ['government']
        }
      ]
    },
    { 
      text: 'Risk Explainability', 
      icon: <EqualizerIcon />, 
      path: '/explainability',
      roles: ['user', 'lab', 'government', 'ngo']
    },
    { 
      text: 'Equity Impact Map', 
      icon: <AccessibilityIcon />, 
      path: '/equity-map',
      roles: ['government', 'ngo']
    },
    { 
      text: 'Anonymous Alert', 
      icon: <NotificationsIcon />, 
      path: '/anonymous-alert',
      roles: ['user', 'lab', 'government', 'ngo']
    },
    { 
      text: 'Dark Web Monitor', 
      icon: <SecurityIcon />, 
      path: '/dark-web',
      roles: ['government']
    },
    { 
      text: 'Open Science DAO', 
      icon: <GroupsIcon />, 
      path: '/dao',
      roles: ['lab', 'government', 'ngo']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    !user?.role || item.roles.includes(user.role)
  );

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {filteredMenuItems.map((item) => (
            item.submenu ? (
              <React.Fragment key={item.text}>
                <ListItem 
                  button 
                  onClick={handleSimulationClick}
                  sx={{
                    bgcolor: isActive(item.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    borderRadius: 1,
                    mx: 1,
                    width: 'calc(100% - 16px)',
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {simulationOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={simulationOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.filter(subItem => 
                      !user?.role || subItem.roles.includes(user.role)
                    ).map((subItem) => (
                      <ListItem 
                        button 
                        key={subItem.text}
                        onClick={() => handleNavigation(subItem.path)}
                        sx={{
                          pl: 4,
                          bgcolor: isActive(subItem.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          borderRadius: 1,
                          mx: 1,
                          width: 'calc(100% - 16px)',
                        }}
                      >
                        <ListItemIcon>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <ListItem 
                button 
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  bgcolor: isActive(item.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  borderRadius: 1,
                  mx: 1,
                  width: 'calc(100% - 16px)',
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            )
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <List>
          <ListItem 
            button 
            onClick={() => handleNavigation('/settings')}
            sx={{
              bgcolor: isActive('/settings') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              borderRadius: 1,
              mx: 1,
              width: 'calc(100% - 16px)',
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem 
            button 
            onClick={() => handleNavigation('/help')}
            sx={{
              bgcolor: isActive('/help') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              borderRadius: 1,
              mx: 1,
              width: 'calc(100% - 16px)',
            }}
          >
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItem>
        </List>
        <Box sx={{ p: 2, mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            VIRALYTIX v0.1.0
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            © 2023 VIRALYTIX
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;