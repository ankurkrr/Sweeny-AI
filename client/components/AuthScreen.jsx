import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSignUpEmailPassword, useAuthenticated, useAuthenticationStatus } from '@nhost/react';
import { nhost } from '@/lib/nhost.js';
import { mockAuth, MOCK_ENABLED } from '@/lib/mock-auth.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ChatBotIcon from './ChatBotIcon';

export default function AuthScreen({ mode }) {

  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Processing and success states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isAutoLogging, setIsAutoLogging] = useState(false);
  const [authError, setAuthError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
    const [signupSuccess, setSignupSuccess] = useState(!!location.state?.message);
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const isAuthenticated = useAuthenticated();
  const { isLoading: authStatusLoading } = useAuthenticationStatus();

  // Monitor authentication state for success feedback
  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Authentication successful!', {
        icon: <CheckCircle className="w-4 h-4" />,
        duration: 2000,
      });
      // Reset any processing states when authenticated
      setIsProcessing(false);
      setIsSigningUp(false);
      setIsAutoLogging(false);

      // Navigate to dashboard with a short delay to ensure auth state is stable
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }
  }, [isAuthenticated, navigate]);

  // Clear signup success message on mount (page refresh)
  useEffect(() => {
    setSignupSuccess(false);
    setSuccessMessage('');
  }, []);

  const {
    // Removed useSignInEmailPassword, will use nhost.auth.signIn
    isLoading: isSigningIn,
    error: signInError,
  } = { isLoading: false, error: null };

  const {
    signUpEmailPassword,
    isLoading: isSignUpLoading,
    error: signUpError,
  } = useSignUpEmailPassword();

  const isLoading = isSigningIn || isSignUpLoading || isProcessing;
  const currentError = signInError || signUpError || authError;

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if user is already authenticated
    if (isAuthenticated) {
      console.log('User is already authenticated, preventing form submission');
      return;
    }

    const validationResult = validateForm();

    if (!validationResult) {
      return;
    }

    setErrors({});
    setAuthError('');
    // Don't reset retry count here as user might be retrying

    try {
      if (isSignUp) {
        // Start signup process
        setIsProcessing(true);
        setIsSigningUp(true);

        let signUpResult;

        try {
          signUpResult = await signUpEmailPassword(email, password, {
            displayName: `${firstName} ${lastName}`,
            metadata: {
              firstName,
              lastName,
            },
          });
        } catch (nhostError) {
          console.log('Nhost signup failed:', nhostError);
          // Always use mock auth when nHost fails in development
          if (MOCK_ENABLED) {
            toast.info('Connection issue detected - using offline mode', {
              duration: 3000,
            });

            try {
              signUpResult = await mockAuth.signUp(email, password, {
                displayName: `${firstName} ${lastName}`,
                metadata: { firstName, lastName },
              });
            } catch (mockError) {
              console.error('Mock auth also failed:', mockError);
              throw mockError;
            }
          } else {
            throw nhostError;
          }
        }

        if (signUpResult.error) {
          throw signUpResult.error;
        }

        // Account created successfully - redirect to verification page
        setIsSigningUp(false);
        setIsProcessing(false);

        toast.success('Account created! Please check your email for verification.', {
          icon: <CheckCircle className="w-4 h-4" />,
          duration: 3000,
        });

        // Redirect to verification page with user data
        navigate('/verification', {
          replace: true,
          state: {
            email: email,
            userName: `${firstName} ${lastName}`.trim()
          }
        });

        return; // Don't proceed to auto-login, wait for email verification
      } else {
        // Regular sign in
        let result;

        try {
          result = await nhost.auth.signIn({ email, password });
        } catch (nhostError) {
          console.log('Nhost signin failed:', nhostError);
          // Always use mock auth when nHost fails in development
          if (MOCK_ENABLED) {
            toast.info('Connection issue detected - using offline mode', {
              duration: 3000,
            });
            try {
              result = await mockAuth.signIn(email, password);
            } catch (mockError) {
              console.error('Mock auth also failed:', mockError);
              throw mockError;
            }
          } else {
            throw nhostError;
          }
        }

        if (result.error) {
          throw result.error;
        }

        if (result.session) {
          toast.success('Welcome back!', {
            icon: <CheckCircle className="w-4 h-4" />,
          });
        }
      }
    } catch (error) {
      setIsProcessing(false);
      setIsSigningUp(false);
      setIsAutoLogging(false);

      // Set clear error messages
      let errorMessage = error.message || 'An error occurred';

      // Handle already signed in error
      if (error.error === 'already-signed-in' || errorMessage.includes('already signed in')) {
        console.log('User is already signed in, redirecting...');
        return; // Don't show error, just let the redirect happen
      }

      // Nhost returns 401 Unauthorized for bad credentials
      if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      }

      setAuthError(errorMessage);
      toast.error(errorMessage);

      // Handle network and connection errors more broadly
      const isNetworkError = (
        error.error === 'network' ||
        error.status === 0 ||
        errorMessage.includes('Network Error') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('ERR_NETWORK') ||
        errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
        errorMessage.includes('connection') ||
        error.name === 'NetworkError' ||
        error.code === 'NETWORK_ERROR'
      );

      if (isNetworkError) {
        const networkMsg = MOCK_ENABLED ?
          'Connection issue - trying offline mode next time' :
          'Unable to connect to authentication service';

        setAuthError(`${networkMsg} ${retryCount > 0 ? `(Attempt ${retryCount + 1})` : ''}`);

        toast.error(`Connection failed. ${retryCount > 0 ? `Attempt ${retryCount + 1}. ` : ''}${MOCK_ENABLED ? 'Will use offline mode on retry.' : 'Please check your internet and try again.'}`, {
          action: {
            label: retryCount < 3 ? 'Retry' : 'Try Again',
            onClick: () => {
              setRetryCount(prev => prev + 1);
              // Add a small delay before retry
              setTimeout(() => {
                handleSubmit({ preventDefault: () => {} });
              }, 1000);
            },
          },
          duration: 10000,
        });
      } else if (isSignUp) {
        if (errorMessage.includes('already') || errorMessage.includes('exists') || errorMessage.includes('in use')) {
          setAuthError('This email is already registered. Please sign in instead.');
          toast.error('This email is already registered.', {
            action: {
              label: 'Sign In Instead',
              onClick: () => {
                setIsSignUp(false);
                setErrors({});
                setAuthError('');
                setConfirmPassword('');
                setFirstName('');
                setLastName('');
                window.history.pushState({}, '', '/signin');
                toast.info('Switched to sign in mode');
              },
            },
            duration: 6000,
          });
        } else if (errorMessage.includes('weak')) {
          setErrors({ password: 'Password is too weak. Please choose a stronger password.' });
          toast.error('Password is too weak');
        }
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setIsProcessing(false);
    setIsSigningUp(false);
    setIsAutoLogging(false);
    setAuthError('');
    setSignupSuccess(false);
    setSuccessMessage('');
    setRetryCount(0); // Reset retry count
    // Navigation will be handled by route state updates
    window.history.pushState({}, '', !isSignUp ? '/signup' : '/signin');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* White light flashing animation on both sides - 5% each side */}
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
            {isSignUp
              ? 'Create your account to get started'
              : signupSuccess
              ? 'Welcome! Sign in to your new account'
              : 'Sign in to your account'
            }
          </h1>
        </div>

        {/* Sign In/Up Form */}
        <div
          className="rounded-2xl p-8 shadow-xl border"
          style={{
            backgroundColor: '#000000',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {authError && (
              <Alert variant="destructive" className="bg-red-900/80 border-red-500/30 text-red-200">
                <AlertDescription>
                  {authError}
                </AlertDescription>
              </Alert>
            )}

            {isAuthenticated && (
              <Alert className="bg-green-900/80 border-green-500/30 text-green-200">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <AlertDescription className="space-y-2">
                  <div>Authentication successful! Redirecting to dashboard...</div>
                  <Button
                    onClick={() => {
                      console.log('Manual redirect to dashboard');
                      navigate('/', { replace: true });
                    }}
                    className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Go to Dashboard Now
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading spinner during signup */}
            {isSigningUp && (
              <Alert className="bg-blue-900/80 border-blue-500/30 text-blue-200">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <AlertDescription>
                  Creating your account...
                </AlertDescription>
              </Alert>
            )}

            {/* "Signing you in..." message during auto-login */}
            {isAutoLogging && (
              <Alert className="bg-blue-900/80 border-blue-500/30 text-blue-200">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <AlertDescription>
                  Account created! Signing you in...
                </AlertDescription>
              </Alert>
            )}


            {/* Show success message when signup succeeded but auto-signin failed */}
            {signupSuccess && !isSignUp && (
              <Alert className="bg-green-900/80 border-green-500/30 text-green-200">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <AlertDescription>
                  <strong>{successMessage || 'Account created!'}</strong> {successMessage ? '' : 'Please sign in below to access your account.'}
                </AlertDescription>
              </Alert>
            )}

            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#FFFFFF', fontWeight: '600', letterSpacing: '0.02em' }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setErrors(prev => ({ ...prev, firstName: '' }));
                    }}
                    disabled={isLoading}
                    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#000000',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#FFFFFF', fontWeight: '600', letterSpacing: '0.02em' }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setErrors(prev => ({ ...prev, lastName: '' }));
                    }}
                    disabled={isLoading}
                    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#000000',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#FFFFFF', fontWeight: '600', letterSpacing: '0.02em' }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setAuthError('');
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                disabled={isLoading}
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: '#000000',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#FFFFFF', fontWeight: '600', letterSpacing: '0.02em' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError('');
                    setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  disabled={isLoading}
                  className="w-full border rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: '#000000',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: '#9CA3AF' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#FFFFFF', fontWeight: '600', letterSpacing: '0.02em' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    disabled={isLoading}
                    className="w-full border rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#000000',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                    style={{ color: '#9CA3AF' }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm"
              style={{
                backgroundColor: '#8B5CF6',
                color: '#FFFFFF',
                fontSize: '14px'
              }}
              disabled={isLoading || isAuthenticated}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSigningUp ? 'Creating account...' :
                   isAutoLogging ? 'Signing you in...' :
                   isProcessing ? 'Processing...' :
                   isSignUp ? 'Creating account...' :
                   'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Mode Link */}
          <div className="mt-6 text-center">
            <span
              className="text-sm"
              style={{
                color: '#FFFFFF',
                opacity: '0.7',
                fontWeight: '500'
              }}
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              onClick={toggleMode}
              className="text-sm transition-colors font-medium"
              style={{
                color: '#FFFFFF',
                fontWeight: '600',
                textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
              }}
              disabled={isLoading}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
