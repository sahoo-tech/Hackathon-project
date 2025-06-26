import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

// Responsive Container Component
export const ResponsiveContainer = ({ children, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        padding: isMobile ? (isSmallMobile ? 1 : 2) : 3,
        margin: isMobile ? (isSmallMobile ? '8px 0' : '12px 0') : '16px 0',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ children, spacing = 3, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'grid',
        gap: isMobile ? 2 : spacing,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(auto-fit, minmax(300px, 1fr))',
          md: 'repeat(auto-fit, minmax(350px, 1fr))',
          lg: 'repeat(auto-fit, minmax(400px, 1fr))',
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Mobile-friendly Button Component
export const ResponsiveButton = ({ children, fullWidthOnMobile = false, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="button"
      sx={{
        minHeight: 44, // Touch-friendly size
        padding: isMobile ? '8px 16px' : '10px 20px',
        fontSize: isSmallMobile ? '0.875rem' : '1rem',
        borderRadius: 2,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: (fullWidthOnMobile && isMobile) ? '100%' : 'auto',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Responsive Typography Component
export const ResponsiveTypography = ({ variant = 'body1', children, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getFontSize = () => {
    const sizes = {
      h1: { desktop: '2.5rem', mobile: '2rem', smallMobile: '1.75rem' },
      h2: { desktop: '2rem', mobile: '1.75rem', smallMobile: '1.5rem' },
      h3: { desktop: '1.75rem', mobile: '1.5rem', smallMobile: '1.25rem' },
      h4: { desktop: '1.5rem', mobile: '1.25rem', smallMobile: '1.125rem' },
      h5: { desktop: '1.25rem', mobile: '1.125rem', smallMobile: '1rem' },
      h6: { desktop: '1rem', mobile: '0.875rem', smallMobile: '0.875rem' },
      body1: { desktop: '1rem', mobile: '0.875rem', smallMobile: '0.875rem' },
      body2: { desktop: '0.875rem', mobile: '0.75rem', smallMobile: '0.75rem' },
      caption: { desktop: '0.75rem', mobile: '0.7rem', smallMobile: '0.65rem' },
    };

    const size = sizes[variant] || sizes.body1;
    
    if (isSmallMobile) return size.smallMobile;
    if (isMobile) return size.mobile;
    return size.desktop;
  };

  return (
    <Box
      component="span"
      sx={{
        fontSize: getFontSize(),
        lineHeight: isSmallMobile ? 1.4 : 1.5,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Touch-friendly Card Component
export const ResponsiveCard = ({ children, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: isMobile ? 2 : 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: isMobile ? (isSmallMobile ? 2 : 3) : 4,
        margin: isMobile ? '8px 0' : '16px 0',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
        // Touch-friendly tap highlight
        WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Mobile-optimized Table Component
export const ResponsiveTable = ({ children, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    // On mobile, convert table to card-based layout
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          ...props.sx
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        overflowX: 'auto',
        '& table': {
          minWidth: 650,
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Hook for responsive values
export const useResponsiveValue = (values) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isSmallMobile && values.xs !== undefined) return values.xs;
  if (isMobile && values.sm !== undefined) return values.sm;
  if (values.md !== undefined) return values.md;
  return values.lg || values.xl || values.default;
};

// Hook for mobile detection
export const useMobileDetection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile,
    isSmallMobile,
    isTablet,
    isDesktop,
    // Device-specific checks
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
};

// Responsive Spacing Hook
export const useResponsiveSpacing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return {
    xs: isSmallMobile ? 0.5 : 1,
    sm: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
    md: isSmallMobile ? 1.5 : isMobile ? 2 : 3,
    lg: isSmallMobile ? 2 : isMobile ? 3 : 4,
    xl: isSmallMobile ? 3 : isMobile ? 4 : 6,
  };
};

const MobileResponsiveComponents = {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveButton,
  ResponsiveTypography,
  ResponsiveCard,
  ResponsiveTable,
  useResponsiveValue,
  useMobileDetection,
  useResponsiveSpacing,
};

export default MobileResponsiveComponents;