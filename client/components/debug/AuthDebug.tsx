import React from 'react';
import { useMockAuth } from '@/lib/mock-auth-provider';
import { useAuthenticated, useUserData } from '@nhost/react';

export const AuthDebug: React.FC = () => {
  const mockAuth = useMockAuth();
  const nhostUser = useUserData();
  const isAuthenticated = useAuthenticated();
  const user = mockAuth.isAuthenticated ? mockAuth.user : nhostUser;

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔍 Auth Debug</div>
      <div><strong>Mock Auth:</strong> {mockAuth.isAuthenticated ? '✅' : '❌'}</div>
      <div><strong>Nhost Auth:</strong> {isAuthenticated ? '✅' : '❌'}</div>
      <div><strong>Current User:</strong></div>
      <pre className="text-xs overflow-auto max-h-32">
        {JSON.stringify(user, null, 2)}
      </pre>
      <div><strong>Mock User:</strong></div>
      <pre className="text-xs overflow-auto max-h-32">
        {JSON.stringify(mockAuth.user, null, 2)}
      </pre>
    </div>
  );
};
