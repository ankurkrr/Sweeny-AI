import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

import { useAuth } from '@/contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Change to your dashboard/chat route if needed
    }
  }, [isAuthenticated, navigate]);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  // Called by SignupForm after signup attempt
  const handleSwitchToLogin = (email: string, message: string) => {
    setLoginEmail(email);
    setSuccessMessage(message);
    setIsLoginMode(true);
  };

  return (
    <>
      {isLoginMode ? (
        <LoginForm onToggleMode={toggleMode} email={loginEmail} successMessage={successMessage} />
      ) : (
        <SignupForm onToggleMode={toggleMode} onSwitchToLogin={handleSwitchToLogin} />
      )}
    </>
  );
};
