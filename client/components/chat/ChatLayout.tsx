import { useState, useEffect } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { useKeyboardManagement } from '@/hooks/use-keyboard-management';

export const ChatLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isKeyboardOpen, viewportHeight, closeKeyboard, forceCloseKeyboard } = useKeyboardManagement();

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

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleMobileSidebar = () => {
    // Force close keyboard when opening mobile sidebar
    if (!isMobileSidebarOpen && isMobile) {
      forceCloseKeyboard();
    }
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
          height: isMobile ? viewportHeight : '100vh',
          maxHeight: isMobile ? viewportHeight : '100vh',
          transition: 'none', // Remove transition for smoother keyboard handling
          position: 'relative'
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
          isMobileSidebarOpen={isMobileSidebarOpen}
          isKeyboardOpen={isKeyboardOpen}
          closeKeyboard={closeKeyboard}
          forceCloseKeyboard={forceCloseKeyboard}
        />
      </div>
    </ChatProvider>
  );
};
