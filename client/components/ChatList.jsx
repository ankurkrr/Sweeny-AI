import { useState } from 'react';
import { useSubscription, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  MessageCircle, 
  MoreVertical, 
  Trash2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// GraphQL subscription to get user's chats in real-time (from chatbot.chats)
const GET_CHATS_SUBSCRIPTION = gql`
  subscription GetChats {
    chatbot_chats(order_by: {updated_at: desc}) {
      id
      title
      updated_at
    }
  }
`;

// GraphQL mutation for creating new chats (in chatbot.chats)
const CREATE_CHAT_MUTATION = gql`
  mutation CreateChat($title: String!) {
    insert_chatbot_chats_one(object: {title: $title}) {
      id
      title
      created_at
    }
  }
`;

// GraphQL mutation for deleting chats (in chatbot.chats)
const DELETE_CHAT_MUTATION = gql`
  mutation DeleteChat($id: uuid!) {
    delete_chatbot_chats_by_pk(id: $id) {
      id
    }
  }
`;

export default function ChatList({ selectedChatId, onChatSelect }) {
  const [isCreating, setIsCreating] = useState(false);

  // Subscribe to chats in real-time
  const { data, loading, error } = useSubscription(GET_CHATS_SUBSCRIPTION);

  // Mutation for creating new chats
  const [createChat] = useMutation(CREATE_CHAT_MUTATION, {
    onCompleted: (data) => {
      if (data?.insert_chatbot_chats_one) {
        onChatSelect(data.insert_chatbot_chats_one.id);
        setIsCreating(false);
      }
    },
    onError: (error) => {
      console.error('Error creating chat:', error);
      setIsCreating(false);
    }
  });

  // Mutation for deleting chats
  const [deleteChat] = useMutation(DELETE_CHAT_MUTATION, {
    onError: (error) => {
      console.error('Error deleting chat:', error);
    }
  });

  const handleCreateNewChat = async () => {
    setIsCreating(true);
    const title = `New Chat ${new Date().toLocaleDateString()}`;
    
    try {
      await createChat({
        variables: { title }
      });
    } catch (error) {
      console.error('Failed to create chat:', error);
      setIsCreating(false);
    }
  };

  const handleDeleteChat = async (chatId, event) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat({
          variables: { id: chatId }
        });
        
        // If the deleted chat was selected, clear selection
        if (selectedChatId === chatId) {
          onChatSelect(null);
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error loading chats</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  const chats = data?.chatbot_chats || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header with New Chat button */}
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={handleCreateNewChat}
          disabled={isCreating}
          className="w-full justify-start gradient-primary hover:shadow-lg hover:shadow-primary/25 btn-hover font-semibold py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? 'Creating...' : 'New Chat'}
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="spinner w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm font-medium">Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-primary" />
              <p className="text-base font-medium mb-2">No chats yet</p>
              <p className="text-sm text-gray-400">Create your first chat to get started</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 border",
                  selectedChatId === chat.id
                    ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-md shadow-primary/5"
                    : "hover:bg-gray-50 hover:shadow-md border-transparent hover:border-gray-200"
                )}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold truncate",
                    selectedChatId === chat.id
                      ? "text-primary"
                      : "text-gray-900 group-hover:text-gray-700"
                  )}>
                    {chat.title}
                  </p>
                  <p className={cn(
                    "text-xs font-medium",
                    selectedChatId === chat.id
                      ? "text-primary/70"
                      : "text-gray-500 group-hover:text-gray-600"
                  )}>
                    {formatDate(chat.updated_at)}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-all duration-200 w-8 h-8 hover:bg-gray-200 hover:scale-110",
                        selectedChatId === chat.id && "opacity-100"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
