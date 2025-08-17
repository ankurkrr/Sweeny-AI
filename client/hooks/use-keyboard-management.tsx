import { useState, useEffect, useCallback } from 'react';

interface KeyboardManagementState {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  viewportHeight: string;
}

interface KeyboardManagementActions {
  closeKeyboard: () => void;
  adjustForKeyboard: (isOpen: boolean) => void;
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

    // Force keyboard closed state
    setIsKeyboardOpen(false);
    setKeyboardHeight(0);
    setViewportHeight('100dvh');
  }, []);

  // Function to adjust layout for keyboard
  const adjustForKeyboard = useCallback((isOpen: boolean) => {
    setIsKeyboardOpen(isOpen);
    
    if (isOpen) {
      // When keyboard is open, use actual viewport height
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const fullHeight = window.screen.height;
      const calculatedKeyboardHeight = fullHeight - currentHeight;
      
      setKeyboardHeight(calculatedKeyboardHeight);
      setViewportHeight(`${currentHeight}px`);
    } else {
      // When keyboard is closed, use full viewport height
      setKeyboardHeight(0);
      setViewportHeight('100dvh');
    }
  }, []);

  // Detect keyboard open/close based on viewport changes
  useEffect(() => {
    const handleViewportChange = () => {
      if (!window.visualViewport) return;
      
      const currentHeight = window.visualViewport.height;
      const fullHeight = window.screen.height;
      const heightRatio = currentHeight / fullHeight;
      
      // If viewport height is significantly reduced, keyboard is likely open
      const keyboardOpen = heightRatio < 0.75;
      adjustForKeyboard(keyboardOpen);
    };

    const handleResize = () => {
      // Fallback for browsers without visualViewport
      if (!window.visualViewport) {
        const currentHeight = window.innerHeight;
        const fullHeight = window.screen.height;
        const heightRatio = currentHeight / fullHeight;
        const keyboardOpen = heightRatio < 0.75;
        adjustForKeyboard(keyboardOpen);
      }
    };

    // Use visualViewport API for better keyboard detection if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Initial check
    handleViewportChange();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [adjustForKeyboard]);

  return {
    isKeyboardOpen,
    keyboardHeight,
    viewportHeight,
    closeKeyboard,
    adjustForKeyboard,
  };
};
