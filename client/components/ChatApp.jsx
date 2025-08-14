import { useState, useRef } from 'react';
import { useSignOut, useUserData } from '@nhost/react';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatTitle, setSelectedChatTitle] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signOutModal, setSignOutModal] = useState(false);
  const dropdownRef = useRef(null);
  const hamburgerBtnRef = useRef(null);

  const { signOut } = useSignOut();
  const user = useUserData();

  const handleChatSelect = (chatId, chatTitle = '') => {
    setSelectedChatId(chatId);
    setSelectedChatTitle(chatTitle);
    setIsMobileSidebarOpen(false);
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setSignOutModal(true);
  };

  const handleSignOutConfirm = async () => {
    await signOut();
    setSignOutModal(false);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        hamburgerBtnRef.current &&
        !hamburgerBtnRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* App logo and title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sweeny AI
            </h1>
          </div>
        </div>

        {/* User section and sign out */}
        <div className="flex items-center space-x-3">
          {/* Hamburger/3-dot Dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              {/* DotsVerticalIcon from lucide-react */}
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dropdown menu */}
            <div
              ref={dropdownRef}
              className={`absolute right-0 mt-2 min-w-[180px] bg-white rounded-xl shadow-xl border border-gray-100 z-50
                transition-transform transition-opacity duration-200
                ${dropdownOpen
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-50 pointer-events-none'
                }
              `}
              style={{
                transformOrigin: 'top right',
              }}
            >
              <button className="block px-4 py-2 hover:bg-gray-50 w-full text-left">Action 1</button>
              <button className="block px-4 py-2 hover:bg-gray-50 w-full text-left">Action 2</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          "lg:w-1/4 lg:min-w-[320px] lg:max-w-[400px]",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sweeny AI
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-hidden">
            <ChatList 
              selectedChatId={selectedChatId}
              onChatSelect={handleChatSelect}
            />
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col lg:w-3/4">
          {selectedChatId ? (
            <ChatWindow 
              chatId={selectedChatId}
              chatTitle={selectedChatTitle}
            />
          ) : (
            /* Empty state when no chat is selected */
            <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              {/* Mobile header for empty state */}
              <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileSidebar}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sweeny AI
                </h1>
                <div className="w-10" /> {/* Spacer */}
              </div>

              {/* Welcome content */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to ChatBot AI
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Select a chat from the sidebar or create a new one to start your conversation with AI.
                  </p>
                  
                  {/* Mobile-specific instructions */}
                  <div className="lg:hidden mb-6">
                    <Button 
                      onClick={toggleMobileSidebar}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Menu className="w-4 h-4 mr-2" />
                      Open Chat List
                    </Button>
                  </div>

                  <div className="space-y-3 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Ask questions and get instant responses</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Your conversations are saved automatically</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>Switch between chats seamlessly</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={signOutModal}
        onClose={() => setSignOutModal(false)}
        onConfirm={handleSignOutConfirm}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
//
