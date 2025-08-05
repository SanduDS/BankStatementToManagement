# WSO2 Asgardeo Integration Setup Guide

This guide provides step-by-step instructions for setting up WSO2 Asgardeo as the Identity and Access Management (IAM) solution for the Bank Statement Analyzer application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Asgardeo Console Setup](#asgardeo-console-setup)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Configuration](#frontend-configuration)
5. [Testing the Integration](#testing-the-integration)
6. [Troubleshooting](#troubleshooting)
7. [Security Considerations](#security-considerations)

## Prerequisites

- WSO2 Asgardeo account (sign up at [https://asgardeo.io](https://asgardeo.io))
- Node.js 18+ and npm/yarn for frontend
- Python 3.8+ and pip for backend
- Basic understanding of OAuth 2.0 and OpenID Connect

## Asgardeo Console Setup

### Step 1: Create an Application

1. Log in to your Asgardeo Console
2. Navigate to **Applications** → **New Application**
3. Choose **Single Page Application (SPA)**
4. Fill in the application details:
   - **Name**: Bank Statement Analyzer
   - **Description**: AI-powered bank statement analysis application

### Step 2: Configure Application Settings

#### Basic Configuration
- **Client ID**: Copy this value (you'll need it for configuration)
- **Client Secret**: Not needed for SPA applications

#### Protocol Configuration
- **Grant Types**: 
  - ✅ Authorization Code
  - ✅ Refresh Token
- **PKCE**: ✅ Mandatory (recommended for security)

#### Redirect URLs
Add the following URLs based on your environment:

**Development:**
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

**Production:**
```
https://your-production-domain.com
```

#### Logout URLs
Add the same URLs as above for post-logout redirect.

#### CORS Origins
Add the same URLs as redirect URLs to allow CORS requests.

### Step 3: Configure Scopes and Claims

#### Standard Scopes
Ensure these scopes are enabled:
- `openid` (required)
- `profile` (for user profile information)
- `email` (for user email)

#### Custom Claims (Optional)
You can add custom claims if needed for role-based access control.

### Step 4: User Management

#### Create Test Users
1. Navigate to **User Management** → **Users**
2. Create test users for development
3. Assign appropriate groups/roles if using RBAC

#### Groups and Roles (Optional)
1. Navigate to **User Management** → **Groups**
2. Create groups like `admin`, `user`, etc.
3. Assign users to appropriate groups

## Backend Configuration

### Step 1: Install Dependencies

The required dependencies are already added to `requirements.txt`:

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Environment Configuration

1. Copy the environment template:
```bash
cp .env.template .env
```

2. Update the `.env` file with your Asgardeo configuration:

```env
# WSO2 Asgardeo Configuration
ASGARDEO_BASE_URL=https://api.asgardeo.io/t/YOUR_ORGANIZATION
ASGARDEO_CLIENT_ID=your-client-id-from-asgardeo

# Environment Configuration
ENVIRONMENT=development

# Production Origins (comma-separated)
PRODUCTION_ORIGINS=https://your-frontend-domain.com

# Other configurations...
```

### Step 3: Verify Backend Setup

Start the backend server:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The authentication middleware is automatically configured and will:
- Validate JWT tokens from Asgardeo
- Extract user information
- Protect API endpoints
- Log authentication events

## Frontend Configuration

### Step 1: Install Dependencies

The Asgardeo dependencies are already installed:
- `@asgardeo/auth-react`
- `@asgardeo/auth-spa`

### Step 2: Environment Configuration

1. Copy the environment template:
```bash
cd frontend
cp .env.template .env
```

2. Update the `.env` file:

```env
# WSO2 Asgardeo Configuration
VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/YOUR_ORGANIZATION
VITE_ASGARDEO_CLIENT_ID=your-client-id-from-asgardeo

# API Configuration
VITE_API_URL=http://localhost:8000

# Development Configuration
VITE_NODE_ENV=development
```

### Step 3: Runtime Configuration (Production)

For production deployments, you can also use runtime configuration by updating `public/config.js`:

```javascript
window.configs = {
  apiUrl: 'https://your-api-domain.com',
  appName: 'Bank Statement Analyzer',
  version: '1.0.0',
  auth: {
    clientId: 'your-client-id',
    baseUrl: 'https://api.asgardeo.io/t/your-organization',
    signInRedirectUrl: window.location.origin,
    signOutRedirectUrl: window.location.origin,
    scope: ['openid', 'profile', 'email']
  },
  features: {
    pdfGeneration: true,
    advancedAnalytics: true
  }
};
```

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

## Testing the Integration

### Step 1: Basic Authentication Flow

1. Open the application in your browser
2. You should see a "Sign In" button in the header
3. Click "Sign In" - you should be redirected to Asgardeo
4. Enter your test user credentials
5. After successful login, you should be redirected back to the app
6. The header should now show user information and a "Sign Out" button

### Step 2: API Protection

1. Try accessing the application without signing in
2. The main content should be protected and show a login prompt
3. After signing in, you should be able to upload files and generate reports
4. Check the browser's Network tab to see that API requests include the `Authorization: Bearer <token>` header

### Step 3: Token Validation

1. Check the backend logs for authentication events
2. You should see logs like:
   ```
   INFO: Authenticated request: POST /api/upload - User: john.doe
   ```

### Step 4: Logout Flow

1. Click "Sign Out"
2. You should be redirected to Asgardeo for logout
3. After logout, you should be redirected back to the app
4. The app should show the login prompt again

## Troubleshooting

### Common Issues

#### 1. "Invalid redirect URI" Error
- **Cause**: The redirect URI in your app doesn't match what's configured in Asgardeo
- **Solution**: Ensure all redirect URIs are properly configured in the Asgardeo console

#### 2. CORS Errors
- **Cause**: Frontend domain not added to CORS origins in Asgardeo
- **Solution**: Add your frontend URL to the CORS origins in Asgardeo console

#### 3. "Invalid token signature" Error
- **Cause**: Token validation failing on backend
- **Solution**: 
  - Verify `ASGARDEO_BASE_URL` is correct
  - Check that the client ID matches
  - Ensure system time is synchronized

#### 4. "Token has expired" Error
- **Cause**: JWT token has expired
- **Solution**: The app should automatically refresh tokens, but you can also sign out and sign in again

#### 5. Environment Variables Not Loading
- **Cause**: Environment variables not properly set
- **Solution**: 
  - Ensure `.env` files are in the correct locations
  - Restart the development servers after changing environment variables
  - For Vite (frontend), ensure variables start with `VITE_`

### Debug Mode

#### Frontend Debug
Add this to your browser console to see auth state:
```javascript
console.log('Auth State:', window.localStorage.getItem('asgardeo-spa-oidc-session'));
```

#### Backend Debug
Set log level to DEBUG in your environment:
```env
LOG_LEVEL=DEBUG
```

## Security Considerations

### Production Deployment

1. **HTTPS Only**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env` files with real credentials
3. **Token Storage**: Tokens are stored securely using Web Workers
4. **CORS Configuration**: Restrict CORS origins to your actual domains
5. **Token Validation**: All API endpoints validate tokens server-side

### Best Practices

1. **Regular Token Rotation**: Tokens automatically refresh
2. **Secure Headers**: The app includes security headers
3. **Input Validation**: All user inputs are validated
4. **Error Handling**: Sensitive information is not exposed in error messages
5. **Logging**: Authentication events are logged for audit purposes

### Role-Based Access Control (RBAC)

The implementation supports RBAC through groups and roles:

```javascript
// Frontend - Check user roles
const { hasRole } = useRoleAccess();
if (hasRole('admin')) {
  // Show admin features
}

// Backend - Protect endpoints by role
@router.post("/admin-only/")
async def admin_endpoint(current_user: Dict = Depends(require_admin())):
    # Admin-only logic
```

## Support

For issues related to:
- **Asgardeo Configuration**: Check [Asgardeo Documentation](https://wso2.com/asgardeo/docs/)
- **Application Issues**: Check the application logs and this documentation
- **Integration Problems**: Verify all configuration steps have been completed

## Additional Resources

- [WSO2 Asgardeo Documentation](https://wso2.com/asgardeo/docs/)
- [OAuth 2.0 and OpenID Connect Guide](https://auth0.com/docs/get-started/authentication-and-authorization-flow)
- [React Authentication Best Practices](https://auth0.com/blog/complete-guide-to-react-user-authentication/)