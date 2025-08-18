import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ChatBotIcon from '@/components/ChatBotIcon';

export default function VerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  // Get email from location state (passed from signup)
  const userEmail = location.state?.email || '';
  const userName = location.state?.userName || '';

  // Redirect to signin if no email provided
  useEffect(() => {
    if (!userEmail) {
      toast.error('No email provided. Redirecting to sign in...');
      navigate('/signin', { replace: true });
    }
  }, [userEmail, navigate]);

  const handleResendVerification = async () => {
    if (!userEmail) return;
    
    setIsResending(true);
    try {
      // Here you would call your resend verification API
      // For now, we'll simulate the action
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResendSuccess(true);
      toast.success('Verification email resent successfully!');
      
      // Reset success state after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/signin', { replace: true });
  };

  if (!userEmail) {
    return null; // Will redirect via useEffect
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Background animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 w-[5vw] h-full bg-gradient-to-r from-white/30 via-white/10 to-transparent animate-pulse opacity-20"></div>
        <div className="absolute right-0 top-0 w-[5vw] h-full bg-gradient-to-l from-white/30 via-white/10 to-transparent animate-pulse opacity-20" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-xl border-2 p-1"
            style={{
              backgroundColor: '#1a1a1a',
              borderColor: '#ffffff',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <ChatBotIcon className="w-full h-full" style={{ color: '#8B5CF6' }} />
          </div>
          <h1
            className="text-2xl font-bold mb-6"
            style={{
              color: '#FFFFFF',
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '0.02em',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
            }}
          >
            Check Your Email
          </h1>
        </div>

        {/* Verification Card */}
        <div
          className="rounded-2xl p-8 shadow-xl border"
          style={{
            backgroundColor: '#000000',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Success Alert */}
          <Alert className="bg-green-900/80 border-green-500/30 text-green-200 mb-6">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <AlertDescription>
              <div className="space-y-2">
                <strong>Account created successfully!</strong>
                {userName && <p>Welcome, {userName}!</p>}
              </div>
            </AlertDescription>
          </Alert>

          {/* Email verification instructions */}
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <Mail className="w-8 h-8" style={{ color: '#8B5CF6' }} />
              </div>
            </div>

            <div className="space-y-3">
              <p
                className="text-lg font-semibold"
                style={{ color: '#FFFFFF' }}
              >
                We've sent a verification email to:
              </p>
              <div
                className="px-4 py-2 rounded-lg font-mono text-sm"
                style={{ 
                  backgroundColor: '#1a1a1a',
                  color: '#8B5CF6',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
              >
                {userEmail}
              </div>
            </div>

            <div className="space-y-4">
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#D1D5DB' }}
              >
                Please check your email and click the verification link to activate your account and complete the setup.
              </p>
              
              <p
                className="text-xs"
                style={{ color: '#9CA3AF' }}
              >
                Don't see the email? Check your spam/junk folder.
              </p>
            </div>

            {/* Resend verification button */}
            <div className="space-y-3">
              {resendSuccess && (
                <Alert className="bg-blue-900/80 border-blue-500/30 text-blue-200">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <AlertDescription>
                    Verification email sent again!
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleResendVerification}
                disabled={isResending || resendSuccess}
                className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm"
                style={{
                  backgroundColor: resendSuccess ? '#10B981' : '#6B46C1',
                  color: '#FFFFFF',
                  opacity: isResending ? 0.7 : 1
                }}
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : resendSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Email Sent!
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            {/* Back to sign in */}
            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={handleBackToSignIn}
                variant="outline"
                className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF'
                }}
              >
                Back to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 text-center">
          <p
            className="text-xs"
            style={{ color: '#6B7280' }}
          >
            Having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
