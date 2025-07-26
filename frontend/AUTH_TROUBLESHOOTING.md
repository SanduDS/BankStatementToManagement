# Authentication Troubleshooting Guide

## Issue: Still seeing sign-in page even when authenticated

### Step 1: Check where you're testing
**Local Development (localhost):**
- ❌ Choreo authentication WILL NOT work locally
- ❌ `/auth/login` and `/auth/userinfo` endpoints don't exist
- ✅ Deploy to Choreo to test authentication

**Choreo Platform:**
- ✅ Authentication should work if properly configured
- Continue to Step 2 if still having issues

### Step 2: Verify Choreo Configuration

#### A. Check component.yaml authentication settings:
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

#### B. Verify in Choreo Console:
1. Go to your frontend component in Choreo
2. Check "Security" or "Authentication" section
3. Ensure OAuth2 is enabled
4. Verify redirect URLs are set correctly

### Step 3: Check Browser Developer Tools

#### A. Network Tab:
1. Open browser DevTools → Network tab
2. Look for requests to `/auth/userinfo`
3. Check if it returns 200 OK with user data or 401/404

#### B. Console Tab:
1. Look for authentication debug logs:
   - "Checking authentication..."
   - "Userinfo cookie: Found/Not found"
   - "Auth response status: XXX"

#### C. Application Tab → Cookies:
1. Check if `userinfo` cookie exists
2. Verify cookie domain matches your app domain

### Step 4: Test Authentication Endpoints Manually

#### Test userinfo endpoint:
1. Open your deployed app
2. In browser console, run:
```javascript
fetch('/auth/userinfo', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

#### Test login redirect:
1. Visit: `https://your-app.choreoapis.dev/auth/login`
2. Should redirect to Choreo login page

### Step 5: Common Solutions

#### If testing locally:
1. **Option A:** Deploy to Choreo for testing
2. **Option B:** Create mock authentication for development:

```javascript
// Add to AuthContext.jsx for development only
const isDevelopment = window.location.hostname === 'localhost';

if (isDevelopment) {
  // Mock user for development
  setUser({ 
    name: 'Test User',
    given_name: 'Test',
    email: 'test@example.com'
  });
  return;
}
```

#### If on Choreo platform:
1. **Check OAuth Configuration:** Ensure redirect URLs are correct
2. **Verify Cookie Domain:** Cookie should match your app domain
3. **Check CORS:** Backend should allow your frontend domain
4. **Clear Cookies:** Clear browser cookies and try again

### Step 6: Debug Component

Use the AuthDebug component to see authentication state:
- Check console logs for authentication flow
- Verify cookies are present
- Test endpoints manually

### Expected Behavior:

#### When NOT authenticated:
- `isAuthenticated: false`
- `user: null`
- Shows sign-in button
- ProtectedRoute shows authentication prompt

#### When authenticated:
- `isAuthenticated: true`
- `user: { name, email, ... }`
- Shows user info and sign-out button
- ProtectedRoute shows protected content

### Quick Fix for Local Development:

If you want to test the UI without authentication:
1. Temporarily remove `<ProtectedRoute>` wrapper from App.jsx
2. Or mock authentication in AuthContext.jsx
3. Remember to restore before deploying to production
