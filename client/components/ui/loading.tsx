import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'white' | 'gray';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )} 
    />
  );
};

interface LoadingDotsProps {
  className?: string;
  color?: 'primary' | 'secondary' | 'white' | 'gray';
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  className,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    white: 'bg-white',
    gray: 'bg-gray-400'
  };

  return (
    <div className={cn('spinner-dots', className)}>
      <span className={colorClasses[color]}></span>
      <span className={colorClasses[color]}></span>
      <span className={colorClasses[color]}></span>
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  width = 'w-full',
  height = 'h-4',
  rounded = true
}) => {
  return (
    <div 
      className={cn(
        'loading-skeleton',
        width,
        height,
        rounded && 'rounded',
        className
      )}
    />
  );
};

interface LoadingCardProps {
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ className }) => {
  return (
    <div className={cn('p-6 bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      <div className="space-y-4">
        <LoadingSkeleton height="h-6" width="w-3/4" />
        <LoadingSkeleton height="h-4" width="w-full" />
        <LoadingSkeleton height="h-4" width="w-5/6" />
        <div className="flex space-x-2">
          <LoadingSkeleton height="h-8" width="w-20" />
          <LoadingSkeleton height="h-8" width="w-24" />
        </div>
      </div>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600 font-medium">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface FullPageLoadingProps {
  loadingText?: string;
  subText?: string;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  loadingText = 'Just Relax',
  subText
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="text-center">
        <div className="mx-auto mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto loading-container">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F91c20ca81e764ec69cd5de4ed7fc445e%2Ff5e1ea2291e344d6b84127d617e63e9f?format=webp&width=800"
              alt="Sweeny AI Logo"
              className="loading-logo w-16 h-16 rounded-full object-cover"
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>{loadingText}</h2>
        {subText && (
          <p style={{ color: '#D1D5DB' }}>{subText}</p>
        )}
      </div>
    </div>
  );
};

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  loadingText,
  className,
  onClick,
  disabled
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'btn-primary-hover disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" color="white" />
          {loadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Message loading component for chat
export const MessageLoading: React.FC = () => {
  return (
    <div className="flex items-start space-x-3 mb-6">
      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center">
        <div className="w-4 h-4 bg-white rounded-full"></div>
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm border border-gray-100 max-w-[70%]">
        <div className="flex items-center space-x-2">
          <LoadingDots color="primary" />
          <span className="text-sm text-gray-500">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};
