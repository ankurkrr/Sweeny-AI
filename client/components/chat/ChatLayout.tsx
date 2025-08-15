import { useState, useEffect } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';

export const ChatLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // Hide sidebar by default on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden chat-layout-container" style={{ backgroundColor: '#202123' }}>
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
