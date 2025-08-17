import { useState, useEffect } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';

export const ChatLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100dvh');

  // Check if screen is mobile and handle keyboard detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // Hide sidebar by default on mobile
      }
    };

    const handleViewportChange = () => {
      if (isMobile) {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const fullHeight = window.screen.height;
        const heightRatio = currentHeight / fullHeight;

        // If viewport height is significantly reduced, keyboard is likely open
        const keyboardOpen = heightRatio < 0.75;
        setIsKeyboardOpen(keyboardOpen);

        // Use the actual available height when keyboard is open
        if (keyboardOpen) {
          setViewportHeight(`${currentHeight}px`);
        } else {
          setViewportHeight('100dvh');
        }
      }
    };

    checkMobile();
    handleViewportChange();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', handleViewportChange);

    // Use visualViewport API for better keyboard detection if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', handleViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
    };
  }, [isMobile]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ChatProvider>
      <div
        className="flex overflow-hidden chat-layout-container"
        style={{
          backgroundColor: '#202123',
          height: viewportHeight,
          transition: isMobile ? 'height 0.3s ease-in-out' : 'none'
        }}
      >
        <ChatSidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={toggleMobileSidebar}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={toggleSidebar}
          isMobile={isMobile}
        />
        <ChatWindow
          onMobileMenuToggle={toggleMobileSidebar}
          onSidebarToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
      </div>
    </ChatProvider>
  );
};
