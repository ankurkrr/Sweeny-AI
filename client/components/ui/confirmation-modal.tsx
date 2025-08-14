import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent 
        className="no-white-hover"
        style={{
          backgroundColor: '#2A2B32',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          maxWidth: '400px'
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle 
            className="text-left"
            style={{
              color: '#FFFFFF',
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription 
            className="text-left"
            style={{
              color: '#D1D5DB',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              marginTop: '8px'
            }}
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 mt-6">
          <AlertDialogCancel 
            className="no-white-hover flex-1"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'all 200ms ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="no-white-hover flex-1"
            style={{
              backgroundColor: variant === 'destructive' ? '#dc2626' : '#8B5CF6',
              border: `1px solid ${variant === 'destructive' ? '#dc2626' : '#8B5CF6'}`,
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'all 200ms ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (variant === 'destructive') {
                e.currentTarget.style.backgroundColor = '#b91c1c';
                e.currentTarget.style.borderColor = '#b91c1c';
              } else {
                e.currentTarget.style.backgroundColor = '#7c3aed';
                e.currentTarget.style.borderColor = '#7c3aed';
              }
            }}
            onMouseLeave={(e) => {
              if (variant === 'destructive') {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.borderColor = '#dc2626';
              } else {
                e.currentTarget.style.backgroundColor = '#8B5CF6';
                e.currentTarget.style.borderColor = '#8B5CF6';
              }
            }}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
