/**
 * Viewport utilities for mobile keyboard handling
 * Provides consistent viewport height calculation across different mobile browsers
 */

export interface ViewportInfo {
  height: number;
  width: number;
  isKeyboardOpen: boolean;
  keyboardHeight: number;
}

/**
 * Get current viewport information with keyboard detection
 */
export function getViewportInfo(): ViewportInfo {
  const visualViewport = window.visualViewport;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  if (visualViewport) {
    // Use Visual Viewport API when available (modern browsers)
    const currentHeight = visualViewport.height;
    const keyboardHeight = Math.max(0, windowHeight - currentHeight);
    const isKeyboardOpen = keyboardHeight > 120; // Threshold for keyboard detection

    return {
      height: currentHeight,
      width: visualViewport.width,
      isKeyboardOpen,
      keyboardHeight,
    };
  } else {
    // Fallback for older browsers
    const screenHeight = window.screen.height;
    const heightDifference = screenHeight - windowHeight;
    const isKeyboardOpen = heightDifference > 120;

    return {
      height: windowHeight,
      width: windowWidth,
      isKeyboardOpen,
      keyboardHeight: isKeyboardOpen ? heightDifference : 0,
    };
  }
}

/**
 * Set CSS custom properties for viewport dimensions
 * Useful for CSS calculations that need to account for mobile keyboards
 */
export function setCSSViewportProperties(viewportInfo: ViewportInfo): void {
  const root = document.documentElement;
  
  root.style.setProperty('--viewport-height', `${viewportInfo.height}px`);
  root.style.setProperty('--viewport-width', `${viewportInfo.width}px`);
  root.style.setProperty('--keyboard-height', `${viewportInfo.keyboardHeight}px`);
  root.style.setProperty('--is-keyboard-open', viewportInfo.isKeyboardOpen ? '1' : '0');
}

/**
 * Initialize viewport handling for the application
 * Call this once in your app setup
 */
export function initializeViewportHandling(): () => void {
  let debounceTimeout: number;

  const updateViewport = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = window.setTimeout(() => {
      const viewportInfo = getViewportInfo();
      setCSSViewportProperties(viewportInfo);
      
      // Dispatch custom event for components that need to react to viewport changes
      window.dispatchEvent(new CustomEvent('viewportchange', { 
        detail: viewportInfo 
      }));
    }, 50);
  };

  // Listen to different viewport change events
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewport);
  }
  
  window.addEventListener('resize', updateViewport);
  window.addEventListener('orientationchange', () => {
    // Delay for orientation change to complete
    setTimeout(updateViewport, 500);
  });

  // Initial setup
  updateViewport();

  // Return cleanup function
  return () => {
    clearTimeout(debounceTimeout);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', updateViewport);
    }
    window.removeEventListener('resize', updateViewport);
  };
}
