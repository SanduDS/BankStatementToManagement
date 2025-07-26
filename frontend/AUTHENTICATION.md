# Choreo Managed Authentication Implementation

## Overview
This document describes the implementation of Choreo's managed authentication for the Bank Statement Analyzer frontend application.

## Authentication Features Implemented

### 1. Authentication Context (`src/contexts/AuthContext.jsx`)
- Provides centralized authentication state management
- Handles user authentication status and user information
- Supports automatic session detection via userinfo cookies
- Implements login/logout functionality using Choreo auth endpoints

### 2. Authentication Hook (`src/hooks/useAuth.js`)
- Custom React hook for accessing authentication context
- Provides clean API for components to interact with auth state
- Includes type safety and error handling

### 3. Authentication Components

#### AuthButtons Component (`src/components/AuthButtons.jsx`)
- Displays sign-in button for unauthenticated users
- Shows user info and sign-out button for authenticated users
- Handles loading states during authentication checks

#### ProtectedRoute Component (`src/components/ProtectedRoute.jsx`)
- Protects sensitive parts of the application
- Shows authentication prompt for unauthenticated users
- Provides fallback content and loading states

### 4. API Client Updates (`src/utils/apiClient.js`)
- Enhanced API client with automatic authentication handling
- Automatically redirects to login on 401 responses
- Supports various response types including PDF blobs
- Includes credentials in all requests for session management

### 5. Component Updates
- **Header**: Now includes authentication buttons in the top navigation
- **App**: Wrapped with AuthProvider and protected routes
- **FileUpload**: Updated to use new API client with auth handling
- **ReportDownload**: Updated to use new API client with auth handling

## Choreo Authentication Flow

### Sign-In Process
1. User clicks "Sign In" button
2. Application redirects to `/auth/login`
3. Choreo handles authentication flow (OAuth2/OIDC)
4. User is redirected back to application with session
5. Application detects authenticated state via userinfo cookie

### Sign-Out Process
1. User clicks "Sign Out" button
2. Application redirects to `/auth/logout?session_hint={sessionId}`
3. Choreo invalidates the session
4. User is redirected back to application

### Session Management
- Automatic session detection on application load
- Session validation via `/auth/userinfo` endpoint
- Automatic re-authentication on API 401 responses
- Persistent sessions across browser tabs

## Configuration Updates

### Choreo Component Configuration (`.choreo/component.yaml`)
```yaml
endpoints:
  - name: frontend
    port: 80
    type: web
    networkVisibility: public
    auth:
      required: true
      type: oauth2
```

### Runtime Configuration Support
- Backend URL configurable via mounted `config.js`
- Authentication works with dynamic API endpoints
- Support for both local development and production environments

## Security Features

### Frontend Security
- All API requests include credentials for session validation
- Automatic logout on authentication failures
- Session timeout handling
- XSS protection headers via nginx

### Backend Integration
- Seamless integration with Choreo's Backend-for-Frontend pattern
- Automatic forwarding of authentication headers
- Support for `/choreo-apis/` prefixed API calls

## Usage Examples

### Using Authentication in Components
```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <button onClick={login}>Sign In</button>;
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Protecting Components
```jsx
import ProtectedRoute from '../components/ProtectedRoute';

function App() {
  return (
    <ProtectedRoute>
      <SensitiveComponent />
    </ProtectedRoute>
  );
}
```

### Making Authenticated API Calls
```jsx
import apiClient from '../utils/apiClient';

async function uploadFile(formData) {
  try {
    const response = await apiClient.post('/api/upload/', formData);
    return response;
  } catch (error) {
    // 401 errors automatically trigger re-authentication
    console.error('Upload failed:', error);
  }
}
```

## Deployment Considerations

### Environment Variables
- No authentication-specific environment variables required
- All authentication handled by Choreo platform
- API URLs configured via runtime config.js mounting

### Session Configuration
- Sessions managed entirely by Choreo platform
- No frontend session storage required
- Automatic session renewal handled by platform

### Testing Authentication
1. **Local Development**: Authentication may not work locally - use production URL
2. **Staging**: Full authentication flow available
3. **Production**: Complete Choreo managed authentication

## Troubleshooting

### Common Issues
1. **401 Responses**: Check if Choreo auth is properly configured
2. **Redirect Loops**: Verify component.yaml auth configuration
3. **Session Issues**: Clear browser cookies and re-authenticate
4. **API Calls Failing**: Ensure credentials are included in requests

### Debug Mode
- Enable browser developer tools to monitor network requests
- Check for userinfo cookie presence
- Verify auth redirects are working properly

## Next Steps

### Future Enhancements
1. **User Profile Management**: Extend user info display
2. **Role-Based Access**: Implement different user roles
3. **Session Persistence**: Add "Remember Me" functionality
4. **Multi-Factor Authentication**: If supported by Choreo

### Integration Points
- Backend user management synchronization
- Audit logging for authentication events
- Advanced session analytics
