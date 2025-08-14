import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import ChatBotIcon from '../ChatBotIcon';

interface LoginFormProps {
  onToggleMode: () => void;
  email?: string;
  successMessage?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, email: initialEmail = '', successMessage }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen jungle-bg jungle-overlay floating-leaves flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
            <ChatBotIcon className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sweeny AI</h1>
          <p className="text-green-200/80 text-sm">Sign in to continue your conversations</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-green-500/20 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="default">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-green-200/90 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-gray-800/80 backdrop-blur-sm border border-green-500/30 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-green-200/90 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-gray-800/80 backdrop-blur-sm border border-green-500/30 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] text-sm border border-green-500/30 hover:border-green-400/50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-400">Don't have an account? </span>
            <button 
              onClick={onToggleMode}
              className="text-sm text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              Sign up
            </button>
          </div>

          {/* Security Badges */}
          <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Fast</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
              <span>Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );                                                                                 
};
