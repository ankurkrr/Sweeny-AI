import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAuth, MOCK_ENABLED } from './mock-auth.js';

const MockAuthContext = createContext();

export const MockAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!MOCK_ENABLED) {
      setIsLoading(false);
      return;
    }

    // Initialize and listen to auth state changes
    const unsubscribe = mockAuth.onAuthStateChange(({ isAuthenticated, user }) => {
      setIsAuthenticated(isAuthenticated);
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = () => {
    mockAuth.signOut();
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    signOut,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }
  return context;
};

// Enhanced useAuthenticated hook that falls back to mock auth
export const useEnhancedAuthenticated = (originalHook) => {
  const mockAuthState = useMockAuth();
  const nhostAuth = originalHook();

  // Return true if either nHost or mock auth is authenticated
  if (nhostAuth) {
    return true;
  }

  // If mock is enabled and user is authenticated via mock
  if (MOCK_ENABLED && mockAuthState.isAuthenticated) {
    return true;
  }

  return false;
};
