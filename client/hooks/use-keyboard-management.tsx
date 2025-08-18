import { useState, useEffect, useCallback } from 'react';

interface KeyboardManagementState {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  viewportHeight: string;
}

interface KeyboardManagementActions {
  closeKeyboard: () => void;
  adjustForKeyboard: (isOpen: boolean) => void;
  forceCloseKeyboard: () => void;
}

export const useKeyboardManagement = (): KeyboardManagementState & KeyboardManagementActions => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState('100dvh');

  // Function to close keyboard by blurring active element
  const closeKeyboard = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }

    // Also blur any input elements that might be focused
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      if (input === document.activeElement) {
        (input as HTMLElement).blur();
      }
    });

    // Force keyboard closed state with delay to allow natural closing
    setTimeout(() => {
      setIsKeyboardOpen(false);
      setKeyboardHeight(0);
      setViewportHeight('100dvh');
      document.body.classList.remove('mobile-keyboard-active');
    }, 150);
  }, []);

  // Function to adjust layout for keyboard with viewport resize behavior
  const adjustForKeyboard = useCallback((isOpen: boolean) => {
    setIsKeyboardOpen(isOpen);

    if (isOpen) {
      // When keyboard is open, use visual viewport height for resize behavior
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      const calculatedKeyboardHeight = Math.max(0, windowHeight - currentHeight);

      setKeyboardHeight(calculatedKeyboardHeight);

      // Use visual viewport height to create resize behavior (not scroll)
      setViewportHeight(`${currentHeight}px`);

      // Add class to body for mobile keyboard handling
      document.body.classList.add('mobile-keyboard-active');

      // Prevent body scrolling while keyboard is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // When keyboard is closed, restore full viewport height
      setKeyboardHeight(0);
      setViewportHeight('100dvh');

      // Remove mobile keyboard class and restore body scrolling
      document.body.classList.remove('mobile-keyboard-active');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }, []);

  // Detect keyboard open/close based on viewport changes with better mobile support
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;
    let initialViewportHeight = window.innerHeight;

    const handleViewportChange = () => {
      // Debounce viewport changes to avoid rapid state updates
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        if (!window.visualViewport) return;

        const currentHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;

        // Enhanced keyboard detection - more accurate thresholds
        const heightDifference = windowHeight - currentHeight;
        const keyboardOpen = heightDifference > 120; // Reduced threshold for better detection

        adjustForKeyboard(keyboardOpen);
      }, 50); // Reduced debounce for more responsive behavior
    };

    const handleResize = () => {
      // Improved fallback for browsers without visualViewport
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        if (!window.visualViewport) {
          const currentHeight = window.innerHeight;
          const heightDifference = initialViewportHeight - currentHeight;

          // More accurate keyboard detection based on height difference
          const keyboardOpen = heightDifference > 120;
          adjustForKeyboard(keyboardOpen);
        }
      }, 50);
    };

    // iOS Safari specific handling
    const handleOrientationChange = () => {
      setTimeout(() => {
        initialViewportHeight = window.innerHeight;
        if (window.visualViewport) {
          handleViewportChange();
        } else {
          handleResize();
        }
      }, 500); // Delay to allow orientation change to complete
    };

    // Use visualViewport API for better keyboard detection if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Handle orientation changes on mobile
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial check on mount
    if (window.visualViewport) {
      handleViewportChange();
    } else {
      handleResize();
    }

    return () => {
      clearTimeout(debounceTimeout);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      window.removeEventListener('orientationchange', handleOrientationChange);

      // Clean up body modifications on unmount
      document.body.classList.remove('mobile-keyboard-active');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [adjustForKeyboard]);

  // Force close keyboard without delay (for navigation)
  const forceCloseKeyboard = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }

    // Immediately update state
    setIsKeyboardOpen(false);
    setKeyboardHeight(0);
    setViewportHeight('100dvh');

    // Clean up all mobile keyboard modifications
    document.body.classList.remove('mobile-keyboard-active');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }, []);

  return {
    isKeyboardOpen,
    keyboardHeight,
    viewportHeight,
    closeKeyboard,
    adjustForKeyboard,
    forceCloseKeyboard,
  };
};
