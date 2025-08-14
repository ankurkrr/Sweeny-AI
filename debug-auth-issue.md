# Authentication Issue Debug Guide

## Problem
"User not authenticated" error occurring when trying to send chat messages.

## Root Cause
The ChatContext was trying to use a separate AuthProvider that wasn't connected to the existing authentication system.

## Fix Applied
1. **Removed duplicate AuthProvider** from ChatLayout.tsx
2. **Updated ChatContext** to use existing mock auth and Nhost authentication systems
3. **Fixed user ID extraction** to work with both auth systems

## Current Authentication Flow

The app uses two authentication systems:

### 1. Mock Authentication (Development)
- Enabled in development mode
- Uses `useMockAuth()` hook
- User data structure: `{ id, email, displayName, metadata }`

### 2. Nhost Authentication (Production)
- Uses `useAuthenticated()` and `useUserData()` hooks
- User data structure varies

## Testing Authentication

### Option 1: Use Sign In Page
1. Navigate to `/signin` in the app
2. Enter any email/password (mock auth will create user automatically in dev)
3. You'll be redirected to the chat interface

### Option 2: Manual Authentication (Development Only)
Open browser console and run:
```javascript
// Clear existing auth data
window.clearMockAuth();

// Manually trigger authentication
const mockAuth = window.mockAuth || JSON.parse(localStorage.getItem('mockAuthUser'));
localStorage.setItem('mockAuthUser', JSON.stringify({
  id: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  metadata: {},
  createdAt: new Date().toISOString()
}));

// Refresh the page
window.location.reload();
```

### Option 3: Check Current Auth State
```javascript
// Check mock auth state
console.log('Mock Auth:', window.mockAuth?.getAuthState());

// Check localStorage
console.log('Stored User:', localStorage.getItem('mockAuthUser'));
```

## How The Fix Works

The ChatContext now:

1. **Gets user from existing auth system:**
   ```typescript
   const mockAuth = useMockAuth();
   const nhostUser = useUserData();
   const user = mockAuth.isAuthenticated ? mockAuth.user : nhostUser;
   ```

2. **Checks authentication properly:**
   ```typescript
   if (!user || (!mockAuth.isAuthenticated && !isAuthenticated)) {
     console.error('User not authenticated');
     return;
   }
   ```

3. **Handles different user ID formats:**
   ```typescript
   const userId = user.id || user.user_id || 'anonymous-' + Date.now();
   ```

## Verification Steps

1. **Check if user is authenticated:** Look for authentication status in browser console
2. **Navigate to sign in:** If not authenticated, you'll be redirected to `/signin`
3. **Sign in with any credentials:** Mock auth will create a user automatically
4. **Try sending a chat message:** Should now work without "User not authenticated" error

## Common Issues

- **Still getting auth errors:** Check browser console for authentication state
- **Stuck on sign in page:** Clear localStorage and try again
- **Need to reset auth:** Use `window.clearMockAuth()` in dev console

The authentication system should now work seamlessly with the chat functionality.
