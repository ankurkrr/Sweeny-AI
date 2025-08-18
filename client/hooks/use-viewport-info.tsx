import { useState, useEffect } from 'react';
import { getViewportInfo, ViewportInfo } from '@/lib/viewport-utils';

/**
 * React hook for getting current viewport information
 * Automatically updates when viewport changes (including keyboard open/close)
 */
export function useViewportInfo(): ViewportInfo {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(getViewportInfo);

  useEffect(() => {
    const handleViewportChange = (event: CustomEvent<ViewportInfo>) => {
      setViewportInfo(event.detail);
    };

    // Listen for custom viewport change events
    window.addEventListener('viewportchange', handleViewportChange as EventListener);
    
    // Also update on direct viewport changes as fallback
    const updateViewport = () => {
      setViewportInfo(getViewportInfo());
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
    }
    
    window.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('viewportchange', handleViewportChange as EventListener);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  return viewportInfo;
}
