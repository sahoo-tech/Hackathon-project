import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Badge,
  Avatar,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const Navbar = ({ toggleSidebar, user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, this would update the theme
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  // Mock notifications
  const notifications = [
    { id: 1, message: "New mutation detected in New York", read: false },
    { id: 2, message: "Outbreak risk increased in Tokyo", read: false },
    { id: 3, message: "DAO proposal needs your vote", read: true }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="Open menu"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
          aria-haspopup="true"
          aria-controls="main-menu"
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} tabIndex={0}>
          VIRALYTIX
        </Typography>

        {/* Dark Mode Toggle */}
        <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        
        {/* Notifications */}
        <Box sx={{ mr: 2 }}>
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationMenu}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            id="notification-menu"
            anchorEl={notificationAnchorEl}
            keepMounted
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
          >
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  onClick={handleNotificationClose}
                  sx={{ 
                    fontWeight: notification.read ? 'normal' : 'bold',
                    minWidth: '250px'
                  }}
                >
                  {notification.message}
                </MenuItem>
              ))
            ) : (
              <MenuItem onClick={handleNotificationClose}>No notifications</MenuItem>
            )}
          </Menu>
        </Box>
        
        {/* User Menu */}
        <Box>
          <Tooltip title="Account settings">
            <IconButton
              color="inherit"
              onClick={handleMenu}
            >
              {user?.avatar ? (
                <Avatar 
                  alt={user.name} 
                  src={user.avatar} 
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              {user?.name || 'User'} ({user?.role || 'user'})
            </MenuItem>
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;