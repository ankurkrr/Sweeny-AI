import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useSignOut, useUserData } from '@nhost/react';
import { useMockAuth } from '@/lib/mock-auth-provider';
import { MOCK_ENABLED } from '@/lib/mock-auth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  MessageCircle,
  Plus,
  MoreVertical,
  Trash2,
  LogOut,
  X,
  Search,
  Edit2,
  Check,
  XIcon,
  Folder,
  Sparkles,
  User,
  Menu,
  ChevronLeft,
  ChevronRight,
  UserX,
  CheckSquare
} from 'lucide-react';
import ChatBotIcon from '../ChatBotIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  isMobileOpen: boolean;
  onMobileToggle: () => void;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  isMobile: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isMobileOpen,
  onMobileToggle,
  isSidebarOpen,
  onSidebarToggle,
  isMobile
}) => {
  const { chats, activeChat, createNewChat, setActiveChat, deleteChat, renameChat } = useChat();
  const { signOut } = useSignOut();
  const user = useUserData();
  const mockAuth = useMockAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [isSelectAllMode, setIsSelectAllMode] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [deleteChatModal, setDeleteChatModal] = useState<{
    isOpen: boolean;
    chatId: string | null;
    chatTitle: string;
  }>({
    isOpen: false,
    chatId: null,
    chatTitle: ''
  });

  const [signOutModal, setSignOutModal] = useState(false);

  const [deleteAccountModal, setDeleteAccountModal] = useState({
    isOpen: false,
    step: 1 // 1 for first confirmation, 2 for second confirmation
  });

  const [deleteBulkModal, setDeleteBulkModal] = useState({
    isOpen: false,
    count: 0
  });
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    currentX: 0,
    startTime: 0
  });

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        profileButtonRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  // Close profile menu on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isProfileMenuOpen]);

  // Touch gesture handlers for mobile sidebar
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const startX = touch.clientX;

      // Check if starting from left edge (within 30px) or on sidebar
      const isFromEdge = startX < 30;
      const isOnSidebar = sidebarRef.current?.contains(e.target as Node);

      if (isFromEdge || (isOnSidebar && isMobileOpen)) {
        setDragState({
          isDragging: true,
          startX,
          currentX: startX,
          startTime: Date.now()
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragState.isDragging) return;

      const touch = e.touches[0];
      const currentX = touch.clientX;
      const deltaX = currentX - dragState.startX;

      setDragState(prev => ({ ...prev, currentX }));

      // Prevent default to avoid scrolling while dragging
      if (Math.abs(deltaX) > 10) {
        e.preventDefault();
      }

      // Apply real-time transform to sidebar during drag
      if (sidebarRef.current) {
        const sidebarWidth = window.innerWidth * 0.75;
        let translateX = 0;

        if (!isMobileOpen) {
          // Opening gesture
          translateX = Math.max(-sidebarWidth, Math.min(0, deltaX - sidebarWidth));
        } else {
          // Closing gesture
          translateX = Math.min(0, deltaX);
        }

        sidebarRef.current.style.transform = `translateX(${translateX}px)`;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!dragState.isDragging) return;

      const deltaX = dragState.currentX - dragState.startX;
      const deltaTime = Date.now() - dragState.startTime;
      const velocity = Math.abs(deltaX) / deltaTime;

      // Determine if should open/close based on distance and velocity
      const shouldToggle = Math.abs(deltaX) > 50 || velocity > 0.3;

      if (shouldToggle) {
        if (!isMobileOpen && deltaX > 0) {
          // Open sidebar
          onMobileToggle();
        } else if (isMobileOpen && deltaX < 0) {
          // Close sidebar
          onMobileToggle();
        }
      }

      // Reset transform and drag state
      if (sidebarRef.current) {
        sidebarRef.current.style.transform = '';
      }

      setDragState({
        isDragging: false,
        startX: 0,
        currentX: 0,
        startTime: 0
      });
    };

    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isMobileOpen, dragState.isDragging, dragState.startX, dragState.startTime, onMobileToggle]);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = () => {
    setSignOutModal(true);
  };

  const handleSignOutConfirm = () => {
    if (MOCK_ENABLED && mockAuth.isAuthenticated) {
      mockAuth.signOut();
    } else {
      signOut();
    }
    setSignOutModal(false);
  };

  const handleDeleteAccount = () => {
    setDeleteAccountModal({
      isOpen: true,
      step: 1
    });
    setIsProfileMenuOpen(false);
  };

  const handleDeleteAccountConfirm = async () => {
    console.log('Account deletion confirmed, starting process');
    try {
      // Delete all user chats first
      console.log('Deleting all chats, count:', chats.length);
      const deletePromises = chats.map(chat => {
        console.log('Deleting chat:', chat.id);
        return deleteChat(chat.id);
      });
      await Promise.all(deletePromises);
      console.log('All chats deleted successfully');

      // Sign out the user
      console.log('Signing out user');
      if (MOCK_ENABLED && mockAuth.isAuthenticated) {
        mockAuth.signOut();
      } else {
        signOut();
      }

      alert('Account deletion completed. You have been signed out.');
    } catch (error) {
      console.error('Error during account deletion:', error);
      alert('There was an error deleting your account. Please try again or contact support.');
    }
  };

  const handleSelectAll = () => {
    if (chats.length === 0) {
      alert('No chats to select.');
      return;
    }

    setIsSelectAllMode(true);
    if (selectedChats.size === chats.length) {
      // Deselect all
      setSelectedChats(new Set());
      setIsSelectAllMode(false);
    } else {
      // Select all
      setSelectedChats(new Set(chats.map(chat => chat.id)));
    }
    setIsProfileMenuOpen(false);
  };

  const toggleChatSelection = (chatId: string) => {
    setSelectedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }

      // If no chats are selected, exit select mode
      if (newSet.size === 0) {
        setIsSelectAllMode(false);
      }

      return newSet;
    });
  };

  const deleteSelectedChats = () => {
    if (selectedChats.size === 0) return;

    setDeleteBulkModal({
      isOpen: true,
      count: selectedChats.size
    });
  };

  const handleDeleteBulkConfirm = async () => {
    try {
      const deletePromises = Array.from(selectedChats).map(chatId => deleteChat(chatId));
      await Promise.all(deletePromises);
      setSelectedChats(new Set());
      setIsSelectAllMode(false);
    } catch (error) {
      console.error('Failed to delete some chats:', error);
      alert('Failed to delete some chats. Please try again.');
    }
  };

  const startEditing = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const handleRenameSubmit = async (chatId: string) => {
    if (editingTitle.trim() && editingTitle.trim() !== chats.find(c => c.id === chatId)?.title) {
      try {
        await renameChat(chatId, editingTitle.trim());
      } catch (error) {
        alert('Failed to rename chat. Please try again.');
      }
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const handleDeleteChatConfirm = async () => {
    if (deleteChatModal.chatId) {
      try {
        console.log('Attempting to delete chat:', deleteChatModal.chatId);
        await deleteChat(deleteChatModal.chatId);
        console.log('Chat deleted successfully:', deleteChatModal.chatId);
      } catch (error) {
        console.error('Failed to delete chat:', error);
        alert('Failed to delete chat. Please try again.');
      }
    }
  };

  const handleDeleteChatModalClose = () => {
    setDeleteChatModal({
      isOpen: false,
      chatId: null,
      chatTitle: ''
    });
  };

  return (
    <>
      {/* Mobile overlay with fade transition */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-40 transition-opacity duration-300 ease-in-out",
            isMobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar with responsive width and positioning */}
      <div
        ref={sidebarRef}
        className={cn(
          "flex flex-col shadow-xl h-full overflow-hidden chat-sidebar-container",
          isMobile ? (
            cn(
              "fixed top-0 left-0 z-50",
              "transition-transform duration-300 ease-in-out",
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )
          ) : (
            cn(
              "relative transition-all duration-300 ease-in-out",
              isSidebarOpen ? "w-[260px]" : "w-[60px]"
            )
          )
        )}
        style={{
          backgroundColor: '#202123',
          ...(isMobile && {
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '75vw',
            zIndex: 100
          })
        }}
      >
        
        {/* Header with Hamburger Toggle and New Chat Button */}
        <div className="p-3">
          {/* Hamburger Toggle Button - Always visible on desktop, hidden on mobile */}
          {!isMobile && (
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={onSidebarToggle}
                className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle sidebar"
                aria-expanded={isSidebarOpen}
                tabIndex={0}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Menu className="w-4 h-4" />
              </button>
              {isSidebarOpen && (
                <div className="text-lg font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Sweeny
                </div>
              )}
            </div>
          )}

          {/* New Chat Button / Batch Actions */}
          {((isMobile && isMobileOpen) || (!isMobile && isSidebarOpen)) && (
            <div className="space-y-2">
              {isSelectAllMode && selectedChats.size > 0 ? (
                <div className="flex gap-2">
                  <Button
                    onClick={deleteSelectedChats}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-normal transition-colors duration-200"
                    style={{
                      backgroundColor: '#dc2626',
                      border: '1px solid #dc2626',
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    aria-label={`Delete ${selectedChats.size} selected chats`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedChats.size})
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedChats(new Set());
                      setIsSelectAllMode(false);
                    }}
                    className="px-3 py-3 rounded-lg text-sm font-normal transition-colors duration-200"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    aria-label="Cancel selection"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => createNewChat()}
                  className="w-full flex items-center justify-start gap-3 px-3 py-3 rounded-lg text-sm font-normal transition-colors duration-200"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  aria-label="Create new chat"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  {((isMobile && isMobileOpen) || (!isMobile && isSidebarOpen)) && 'New Chat'}
                </Button>
              )}
            </div>
          )}

          {/* Collapsed New Chat Button */}
          {!isMobile && !isSidebarOpen && (
            <Button
              onClick={() => createNewChat()}
              className="w-full flex items-center justify-center p-3 rounded-lg text-sm font-normal transition-colors duration-200"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF'
              }}
              aria-label="Create new chat"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}

          {/* Mobile close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileToggle}
              className="absolute top-3 right-3 text-white hover:bg-gray-700 no-white-hover"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Search - Only show when expanded or mobile */}
        {((isMobile && isMobileOpen) || (!isMobile && isSidebarOpen)) && (
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <Input
                placeholder="Search chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm border-none focus:ring-0 transition-colors duration-200"
                style={{
                  backgroundColor: '#343541',
                  color: '#D1D5DB',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif'
                }}
                aria-label="Search chats"
              />
            </div>
          </div>
        )}

        {/* Divider - Only show when expanded or mobile */}
        {((isMobile && isMobileOpen) || (!isMobile && isSidebarOpen)) && (
          <div className="mx-3 h-px bg-white/10" />
        )}

        {/* Chat List */}
        <ScrollArea className="flex-1 px-3 py-3 min-h-0">
          <div className="space-y-1">
            {filteredChats.length === 0 ? (
              ((isMobile && isMobileOpen) || (!isMobile && isSidebarOpen)) && (
                <div className="p-6 text-center">
                  {searchQuery ? (
                    <p style={{ color: '#9CA3AF', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>No chats found</p>
                  ) : (
                    <p style={{ color: '#9CA3AF', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>No conversations yet</p>
                  )}
                </div>
              )
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "chat-item group flex items-center p-2 rounded-lg transition-all duration-200 cursor-pointer",
                    selectedChats.has(chat.id) && isSelectAllMode
                      ? "bg-blue-500/20 border border-blue-500/50"
                      : activeChat?.id === chat.id
                      ? "bg-white/10"
                      : "hover:bg-[#3A3B40] transition-colors duration-200"
                  )}
                  onClick={async () => {
                    if (isSelectAllMode) {
                      toggleChatSelection(chat.id);
                    } else {
                      await setActiveChat(chat.id);
                      if (isMobile) onMobileToggle();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, async () => {
                    if (isSelectAllMode) {
                      toggleChatSelection(chat.id);
                    } else {
                      await setActiveChat(chat.id);
                      if (isMobile) onMobileToggle();
                    }
                  })}
                  aria-label={`Switch to chat: ${chat.title}`}
                >
                  {/* Chat Icon for collapsed state */}
                  {!isMobile && !isSidebarOpen && (
                    <div className="flex items-center justify-center w-full">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Full chat item for expanded state */}
                  {((isMobile && isMobileOpen) || (!isMobile && isSidebarOpen)) && (
                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameSubmit(chat.id);
                              } else if (e.key === 'Escape') {
                                cancelEditing();
                              }
                            }}
                            className="flex-1 text-sm bg-transparent border border-white/20 rounded px-2 py-1 focus:outline-none focus:border-white/40 transition-colors duration-200"
                            style={{
                              color: '#FFFFFF',
                              fontSize: '14px',
                              fontFamily: 'Inter, sans-serif'
                            }}
                            autoFocus
                            onBlur={() => handleRenameSubmit(chat.id)}
                            aria-label="Edit chat title"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm truncate transition-colors duration-200"
                              style={{
                                color: '#E5E7EB',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                fontFamily: 'Inter, sans-serif'
                              }}
                            >
                              {chat.title}
                            </p>
                            {/* Timestamp */}
                            {chat.lastMessage && (
                              <p
                                className="text-xs mt-1 transition-colors duration-200"
                                style={{
                                  color: '#9CA3AF',
                                  fontSize: '0.8rem',
                                  fontFamily: 'Inter, sans-serif'
                                }}
                              >
                                {formatDistanceToNow(chat.lastMessage, { addSuffix: true })}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {isSelectAllMode ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleChatSelection(chat.id);
                                }}
                                className={cn(
                                  "w-6 h-6 transition-colors duration-200",
                                  selectedChats.has(chat.id)
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "hover:bg-gray-700 text-white border border-white/20"
                                )}
                                aria-label={`${selectedChats.has(chat.id) ? 'Deselect' : 'Select'} chat: ${chat.title}`}
                              >
                                {selectedChats.has(chat.id) ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <div className="w-3 h-3" />
                                )}
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(chat.id, chat.title);
                                  }}
                                  className="w-6 h-6 hover:bg-gray-700 text-white transition-colors duration-200"
                                  aria-label={`Edit chat title: ${chat.title}`}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteChatModal({
                                      isOpen: true,
                                      chatId: chat.id,
                                      chatTitle: chat.title
                                    });
                                    // Auto-close sidebar on mobile when delete is clicked
                                    if (isMobile && isMobileOpen) {
                                      onMobileToggle();
                                    }
                                  }}
                                  className="w-6 h-6 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors duration-200"
                                  aria-label={`Delete chat: ${chat.title}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* User Profile Bar */}
        <div
          className="relative p-3 border-t"
          style={{
            backgroundColor: '#202123',
            borderTopColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Collapsed state - only avatar */}
          {!isMobile && !isSidebarOpen && (
            <div className="flex justify-center">
              <button
                ref={profileButtonRef}
                onClick={toggleProfileMenu}
                className="no-white-hover w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
                style={{ backgroundColor: '#8B5CF6' }}
                aria-label="Open profile menu"
                aria-expanded={isProfileMenuOpen}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, toggleProfileMenu)}
              >
                <span className="text-white text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {((MOCK_ENABLED && mockAuth.user) ? mockAuth.user : user)?.displayName?.charAt(0)?.toUpperCase() ||
                   ((MOCK_ENABLED && mockAuth.user) ? mockAuth.user : user)?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </button>
            </div>
          )}

          {/* Expanded state - full profile info */}
          {((isMobile && isMobileOpen) || (!isMobile && isSidebarOpen)) && (
            <div className="flex items-center justify-between">
              <button
                ref={profileButtonRef}
                onClick={toggleProfileMenu}
                className="no-white-hover flex items-center space-x-3 min-w-0 flex-1 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                aria-label="Open profile menu"
                aria-expanded={isProfileMenuOpen}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, toggleProfileMenu)}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  <span className="text-white text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {((MOCK_ENABLED && mockAuth.user) ? mockAuth.user : user)?.displayName?.charAt(0)?.toUpperCase() ||
                     ((MOCK_ENABLED && mockAuth.user) ? mockAuth.user : user)?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p
                    className="text-sm font-medium truncate transition-colors duration-200"
                    style={{
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {((MOCK_ENABLED && mockAuth.user) ? mockAuth.user : user)?.displayName || 'User'}
                  </p>
                  {((MOCK_ENABLED && mockAuth.user) ? mockAuth.user : user)?.email && (
                    <p
                      className="text-xs truncate transition-colors duration-200"
                      style={{
                        color: '#9CA3AF',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: '1.2'
                      }}
                    >
                      {((MOCK_ENABLED && mockAuth.user) ? mockAuth.user : user)?.email}
                    </p>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Custom Profile Dropdown */}
          {isProfileMenuOpen && (
            <div
              ref={profileMenuRef}
              className="absolute bottom-full left-0 mb-2 fade-in"
              style={{
                background: '#343541',
                borderRadius: '8px',
                padding: '8px 0',
                minWidth: '180px',
                zIndex: 50,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <button
                onClick={() => {
                  handleSelectAll();
                }}
                className="no-white-hover w-full flex items-center px-3 py-2 text-left hover:bg-[#3A3B40] transition-colors duration-200"
                style={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif'
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectAll();
                  } else if (e.key === 'Escape') {
                    setIsProfileMenuOpen(false);
                    profileButtonRef.current?.focus();
                  }
                }}
                aria-label="Select all chats"
              >
                <CheckSquare className="w-4 h-4 mr-3" />
                Select All
              </button>

              <div className="h-px bg-white/10 mx-2 my-1" />

              <button
                onClick={() => {
                  handleDeleteAccount();
                }}
                className="no-white-hover w-full flex items-center px-3 py-2 text-left hover:bg-red-500/10 transition-colors duration-200"
                style={{
                  color: '#EF4444',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif'
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDeleteAccount();
                  } else if (e.key === 'Escape') {
                    setIsProfileMenuOpen(false);
                    profileButtonRef.current?.focus();
                  }
                }}
                aria-label="Delete account"
              >
                <UserX className="w-4 h-4 mr-3" />
                Delete Account
              </button>

              <div className="h-px bg-white/10 mx-2 my-1" />

              <button
                onClick={() => {
                  handleSignOut();
                  setIsProfileMenuOpen(false);
                }}
                className="no-white-hover w-full flex items-center px-3 py-2 text-left hover:bg-[#3A3B40] transition-colors duration-200"
                style={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif'
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSignOut();
                    setIsProfileMenuOpen(false);
                  } else if (e.key === 'Escape') {
                    setIsProfileMenuOpen(false);
                    profileButtonRef.current?.focus();
                  }
                }}
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Chat Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteChatModal.isOpen}
        onClose={handleDeleteChatModalClose}
        onConfirm={handleDeleteChatConfirm}
        title="Delete Chat"
        description={`Are you sure you want to delete "${deleteChatModal.chatTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Delete Account Confirmation Modal - Step 1 */}
      <ConfirmationModal
        isOpen={deleteAccountModal.isOpen && deleteAccountModal.step === 1}
        onClose={() => setDeleteAccountModal({ isOpen: false, step: 1 })}
        onConfirm={() => setDeleteAccountModal({ isOpen: true, step: 2 })}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Continue"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Delete Account Confirmation Modal - Step 2 */}
      <ConfirmationModal
        isOpen={deleteAccountModal.isOpen && deleteAccountModal.step === 2}
        onClose={() => setDeleteAccountModal({ isOpen: false, step: 1 })}
        onConfirm={handleDeleteAccountConfirm}
        title="Final Confirmation"
        description="This will permanently delete all your data and sign you out. Are you absolutely sure?"
        confirmText="Delete Account"
        cancelText="Go Back"
        variant="destructive"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteBulkModal.isOpen}
        onClose={() => setDeleteBulkModal({ isOpen: false, count: 0 })}
        onConfirm={handleDeleteBulkConfirm}
        title="Delete Selected Chats"
        description={`Are you sure you want to delete ${deleteBulkModal.count} selected chat${deleteBulkModal.count === 1 ? '' : 's'}? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="destructive"
      />

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
    </>
  );
};
