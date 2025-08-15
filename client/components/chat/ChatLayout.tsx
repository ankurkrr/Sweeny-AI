import { useState, useEffect, useRef } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';

export const ChatLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

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

  const handleChatWindowClick = () => {
    // Cancel selection mode when clicking on chat window
    if (typeof window !== 'undefined' && window.cancelChatSelection) {
      window.cancelChatSelection();
    }
  };

  return (
    <ChatProvider>
      <div className="flex h-screen" style={{ backgroundColor: '#202123' }}>
        <ChatSidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={toggleMobileSidebar}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={toggleSidebar}
          isMobile={isMobile}
          onCancelSelection={handleChatWindowClick}
        />
        <div
          ref={chatWindowRef}
          onClick={handleChatWindowClick}
          onTouchEnd={handleChatWindowClick}
          className="flex-1"
        >
          <ChatWindow
            onMobileMenuToggle={toggleMobileSidebar}
            onSidebarToggle={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            isMobile={isMobile}
          />
        </div>
      </div>
    </ChatProvider>
  );
};
