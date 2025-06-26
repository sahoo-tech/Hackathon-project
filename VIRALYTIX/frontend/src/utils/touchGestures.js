// Touch gesture utilities for mobile devices
export class TouchGestureHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      swipeThreshold: 50,
      tapTimeout: 300,
      doubleTapTimeout: 300,
      longPressTimeout: 500,
      ...options
    };
    
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.lastTap = 0;
    this.longPressTimer = null;
    
    this.bindEvents();
  }

  bindEvents() {
    if (!this.element) return;

    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    
    // Mouse events for desktop compatibility
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    
    // Long press detection
    this.longPressTimer = setTimeout(() => {
      this.onLongPress && this.onLongPress(e);
    }, this.options.longPressTimeout);
  }

  handleTouchMove(e) {
    // Cancel long press if user moves finger
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  handleTouchEnd(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const deltaTime = endTime - this.startTime;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Swipe detection
    if (distance > this.options.swipeThreshold) {
      const direction = this.getSwipeDirection(deltaX, deltaY);
      this.onSwipe && this.onSwipe(direction, { deltaX, deltaY, distance }, e);
      return;
    }
    
    // Tap detection
    if (deltaTime < this.options.tapTimeout && distance < 10) {
      const now = Date.now();
      
      // Double tap detection
      if (now - this.lastTap < this.options.doubleTapTimeout) {
        this.onDoubleTap && this.onDoubleTap(e);
        this.lastTap = 0; // Reset to prevent triple tap
      } else {
        this.lastTap = now;
        // Delay single tap to check for double tap
        setTimeout(() => {
          if (this.lastTap === now) {
            this.onTap && this.onTap(e);
          }
        }, this.options.doubleTapTimeout);
      }
    }
  }

  // Mouse event handlers for desktop compatibility
  handleMouseDown(e) {
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTime = Date.now();
    this.isMouseDown = true;
  }

  handleMouseMove(e) {
    if (!this.isMouseDown) return;
    // Handle mouse drag if needed
  }

  handleMouseUp(e) {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;
    
    const endX = e.clientX;
    const endY = e.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const deltaTime = endTime - this.startTime;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Click detection (similar to tap)
    if (deltaTime < this.options.tapTimeout && distance < 10) {
      this.onTap && this.onTap(e);
    }
  }

  getSwipeDirection(deltaX, deltaY) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  // Event handler setters
  onTap(callback) {
    this.onTap = callback;
    return this;
  }

  onDoubleTap(callback) {
    this.onDoubleTap = callback;
    return this;
  }

  onLongPress(callback) {
    this.onLongPress = callback;
    return this;
  }

  onSwipe(callback) {
    this.onSwipe = callback;
    return this;
  }

  destroy() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    
    if (this.element) {
      this.element.removeEventListener('touchstart', this.handleTouchStart);
      this.element.removeEventListener('touchmove', this.handleTouchMove);
      this.element.removeEventListener('touchend', this.handleTouchEnd);
      this.element.removeEventListener('mousedown', this.handleMouseDown);
      this.element.removeEventListener('mousemove', this.handleMouseMove);
      this.element.removeEventListener('mouseup', this.handleMouseUp);
    }
  }
}

// React hook for touch gestures
export const useTouchGestures = (ref, handlers = {}) => {
  React.useEffect(() => {
    if (!ref.current) return;

    const gestureHandler = new TouchGestureHandler(ref.current);
    
    if (handlers.onTap) gestureHandler.onTap = handlers.onTap;
    if (handlers.onDoubleTap) gestureHandler.onDoubleTap = handlers.onDoubleTap;
    if (handlers.onLongPress) gestureHandler.onLongPress = handlers.onLongPress;
    if (handlers.onSwipe) gestureHandler.onSwipe = handlers.onSwipe;

    return () => {
      gestureHandler.destroy();
    };
  }, [ref, handlers]);
};

// Utility functions for mobile optimization
export const mobileUtils = {
  // Prevent zoom on double tap
  preventZoom: (element) => {
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
    }, { passive: false });
  },

  // Smooth scroll for mobile
  smoothScroll: (element, top, duration = 300) => {
    const start = element.scrollTop;
    const change = top - start;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeInOutQuad = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      
      element.scrollTop = start + change * easeInOutQuad;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  },

  // Detect if device supports hover
  supportsHover: () => {
    return window.matchMedia('(hover: hover)').matches;
  },

  // Get safe area insets for devices with notches
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0'),
    };
  },

  // Vibrate on supported devices
  vibrate: (pattern = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  // Check if device is in landscape mode
  isLandscape: () => {
    return window.innerWidth > window.innerHeight;
  },

  // Get device pixel ratio
  getPixelRatio: () => {
    return window.devicePixelRatio || 1;
  },

  // Check if device supports touch
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};

export default {
  TouchGestureHandler,
  useTouchGestures,
  mobileUtils
};