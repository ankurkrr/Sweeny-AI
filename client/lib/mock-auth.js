// Development-only mock authentication to bypass nHost connection issues

const MOCK_AUTH_ENABLED = import.meta.env.DEV; // Only in development

class MockAuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.listeners = new Set();
  }

  // Simulate signup
  async signUp(email, password, options = {}) {
    console.log('Mock SignUp:', { email, options });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists in localStorage
    const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const existingUser = existingUsers.find(u => u.email === email);

    if (existingUser) {
      // In development, instead of failing, return the existing user
      console.log('Mock SignUp: Email exists, returning existing user for development');
      return {
        session: {
          accessToken: 'mock-token-' + Date.now(),
          user: existingUser,
        },
        user: existingUser,
        error: null,
      };
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      displayName: options.displayName || 'Test User',
      metadata: options.metadata || {},
      createdAt: new Date().toISOString(),
    };
    
    // Save to localStorage
    existingUsers.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
    
    return {
      session: {
        accessToken: 'mock-token-' + Date.now(),
        user: newUser,
      },
      user: newUser,
      error: null,
    };
  }

  // Simulate signin
  async signIn(email, password) {
    console.log('Mock SignIn attempting for:', { email });

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find user in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      let user = existingUsers.find(u => u.email === email);

      // If user doesn't exist in development, create one automatically
      if (!user && MOCK_AUTH_ENABLED) {
        console.log('Mock SignIn: User not found, creating new user for development');
        user = {
          id: Date.now().toString(),
          email,
          displayName: email.split('@')[0] || 'Test User',
          metadata: {},
          createdAt: new Date().toISOString(),
        };
        existingUsers.push(user);
        localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
      }

      if (!user) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
      }
    } catch (error) {
      console.error('Mock SignIn error:', error);
      throw error;
    }
    
    // Simulate successful login
    this.isAuthenticated = true;
    this.user = user;
    localStorage.setItem('mockAuthUser', JSON.stringify(user));
    
    // Notify listeners
    this.listeners.forEach(listener => listener({ isAuthenticated: true, user }));
    
    return {
      session: {
        accessToken: 'mock-token-' + Date.now(),
        user,
      },
      user,
      error: null,
    };
  }

  // Check current auth status
  getAuthState() {
    const savedUser = localStorage.getItem('mockAuthUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.isAuthenticated = true;
    }
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.user,
    };
  }

  // Sign out
  signOut() {
    this.isAuthenticated = false;
    this.user = null;
    localStorage.removeItem('mockAuthUser');
    this.listeners.forEach(listener => listener({ isAuthenticated: false, user: null }));
  }

  // Add auth state listener
  onAuthStateChange(callback) {
    this.listeners.add(callback);
    // Call immediately with current state
    callback(this.getAuthState());

    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  // Clear all mock data (development only)
  clearMockData() {
    localStorage.removeItem('mockUsers');
    localStorage.removeItem('mockAuthUser');
    this.isAuthenticated = false;
    this.user = null;
    console.log('Mock auth data cleared');
  }
}

export const mockAuth = new MockAuthService();

// Initialize auth state
mockAuth.getAuthState();

// Make clearMockData available globally in development
if (MOCK_AUTH_ENABLED && typeof window !== 'undefined') {
  window.clearMockAuth = () => mockAuth.clearMockData();
  console.log('Development: window.clearMockAuth() available to clear mock data');
}

export const MOCK_ENABLED = MOCK_AUTH_ENABLED;
