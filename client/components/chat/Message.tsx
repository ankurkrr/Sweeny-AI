import { Message as MessageType } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { Bot, User, Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ChatBotIcon from '../ChatBotIcon';

interface MessageProps {
  message: MessageType;
  isLoading?: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, isLoading = false }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-6 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[85%] md:max-w-[70%] space-x-3 relative",
        isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-9 h-9 flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
          isUser
            ? ""
            : ""
        )}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <ChatBotIcon className="w-8 h-8" />
          )}
        </div>

        {/* Message content */}
        <div className="flex flex-col space-y-2 min-w-0">
          {/* Sender name and timestamp */}
          <div className={cn(
            "flex items-center space-x-2 px-1",
            isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
          )}>
            <span className={cn(
              "text-sm font-medium",
              isUser ? "text-gray-300" : "text-gray-300"
            )}>
              {isUser ? "You" : "Sweeny AI"}
            </span>
            <div className="flex items-center space-x-1 text-xs text-green-300/70">
              <Clock className="w-3 h-3" />
              <span>
                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Message bubble */}
          <div className={cn(
            "px-4 py-3 rounded-2xl relative shadow-sm transition-all duration-200 hover:shadow-md",
            isUser
              ? "bg-gray-700 text-white rounded-br-sm shadow-black/20 hover:shadow-black/30"
              : "bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-600 shadow-black/10 hover:shadow-black/20"
          )}>
            {/* Loading state for bot messages */}
            {isLoading && !isUser ? (
              <div className="flex items-center space-x-2">
                <div className="spinner-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="text-sm text-gray-400">AI is typing...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                
                {/* Message status */}
                {isUser && (
                  <div className="flex items-center justify-end space-x-1 pt-1">
                    <Check className="w-3 h-3 text-gray-300" />
                    <span className="text-xs text-gray-300">Sent</span>
                  </div>
                )}
              </div>
            )}

            {/* Message tail */}
            <div className={cn(
              "absolute top-3 w-3 h-3 transform rotate-45",
              isUser
                ? "right-[-6px] bg-gray-700"
                : "left-[-6px] bg-gray-800 border-l border-b border-gray-600"
            )} />
          </div>

          {/* Detailed timestamp on hover */}
          <div className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1",
            isUser ? "text-right" : "text-left"
          )}>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading message component for when bot is typing
export const LoadingMessage: React.FC = () => {
  return (
    <div className="flex w-full mb-6 justify-start">
      <div className="flex max-w-[85%] md:max-w-[70%] space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
          <ChatBotIcon className="w-8 h-8" />
        </div>

        {/* Message content */}
        <div className="flex flex-col space-y-2 min-w-0">
          {/* Sender name */}
          <div className="flex items-center space-x-2 px-1">
            <span className="text-sm font-medium text-gray-300">Sweeny AI</span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>now</span>
            </div>
          </div>

          {/* Loading bubble */}
          <div className="px-4 py-3 rounded-2xl relative shadow-sm bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-600 shadow-black/10">
            <div className="flex items-center space-x-3">
              <div className="spinner-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="text-sm text-gray-400">AI is thinking...</span>
            </div>

            {/* Message tail */}
            <div className="absolute top-3 left-[-6px] w-3 h-3 transform rotate-45 bg-gray-800 border-l border-b border-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
