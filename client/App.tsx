import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NhostProvider, useAuthenticated, useAuthenticationStatus } from "@nhost/react";
import { ApolloProvider } from "@apollo/client";
import { nhost } from "@/lib/nhost.js";
import { apolloClient } from "@/lib/apollo.js";
import { MockAuthProvider, useEnhancedAuthenticated, useMockAuth } from "@/lib/mock-auth-provider";
import AuthScreen from "@/components/AuthScreen";
import { ChatLayout } from "@/components/chat/ChatLayout";
import ChatPage from "@/pages/Chat";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import "@/lib/global-api";

// Wrapper to protect dashboard route
function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useEnhancedAuthenticated(useAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

// Auth route wrapper that redirects authenticated users
function AuthRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useEnhancedAuthenticated(useAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  // Debug logging
  console.log('AuthRoute - isAuthenticated:', isAuthenticated, 'location:', location.pathname);

  // Use useEffect to handle the redirect to ensure it happens after component mount
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      console.log('AuthRoute - Redirecting authenticated user to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  // If authenticated, show loading while redirect happens
  if (isAuthenticated) {
    return <AuthLoadingScreen />;
  }

  return children;
}

// Loading component for authentication transitions
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="text-center">
        <div className="mx-auto mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto loading-container">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F91c20ca81e764ec69cd5de4ed7fc445e%2Ff5e1ea2291e344d6b84127d617e63e9f?format=webp&width=800"
              alt="Sweeny AI Logo"
              className="loading-logo w-16 h-16 rounded-full object-cover"
            />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>Just Relax</h2>
        <p style={{ color: '#D1D5DB' }}>Please wait while we prepare your dashboard</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const isAuthenticated = useEnhancedAuthenticated(useAuthenticated);
  const { isLoading: nhostLoading } = useAuthenticationStatus();
  const mockAuth = useMockAuth();

  // Show loading screen during authentication state changes
  const isLoading = nhostLoading || mockAuth.isLoading;

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/signin"
        element={
          <AuthRoute>
            <AuthScreen mode="signin" />
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <AuthScreen mode="signup" />
          </AuthRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <ChatLayout />
          </PrivateRoute>
        }
      />
      <Route
        path="/c/:chatId"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/signin"} replace />} />
    </Routes>
  );
}

const App = () => (
  <NhostProvider nhost={nhost}>
    <MockAuthProvider>
      <ApolloProvider client={apolloClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ApolloProvider>
    </MockAuthProvider>
  </NhostProvider>
);

export default App;
