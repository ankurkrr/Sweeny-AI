import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className 
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div 
      className={cn(
        "flex flex-col min-h-screen",
        {
          "mobile-layout": isMobile,
          "tablet-layout": isTablet,
          "desktop-layout": isDesktop,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'full'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      "w-full mx-auto px-4 sm:px-6 lg:px-8",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const gapClass = `gap-${gap}`;

  return (
    <div className={cn(
      "grid",
      gridCols[cols.mobile || 1],
      `md:${gridCols[cols.tablet || 2]}`,
      `lg:${gridCols[cols.desktop || 3]}`,
      gapClass,
      className
    )}>
      {children}
    </div>
  );
};

interface MobileOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileOnly: React.FC<MobileOnlyProps> = ({ children, className }) => {
  return (
    <div className={cn("block md:hidden", className)}>
      {children}
    </div>
  );
};

interface DesktopOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export const DesktopOnly: React.FC<DesktopOnlyProps> = ({ children, className }) => {
  return (
    <div className={cn("hidden md:block", className)}>
      {children}
    </div>
  );
};

interface TabletUpProps {
  children: React.ReactNode;
  className?: string;
}

export const TabletUp: React.FC<TabletUpProps> = ({ children, className }) => {
  return (
    <div className={cn("hidden md:block", className)}>
      {children}
    </div>
  );
};
