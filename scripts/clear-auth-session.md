# Clear Authentication Session for Mock Mode

## Issue
You're seeing Azure authentication data instead of mock data even though `VITE_USE_MOCK_AUTH=true` is set.

## Solution

### 1. Clear Browser Storage
Open your browser's Developer Tools (F12) and run this in the Console:

```javascript
// Clear all authentication data
localStorage.clear();
sessionStorage.clear();

// Clear specific Azure auth keys
localStorage.removeItem('azure_user_info');
localStorage.removeItem('azure_customer_type');
localStorage.removeItem('azure_user_role');
localStorage.removeItem('azure_organisation_name');
localStorage.removeItem('azure_source_claim_key');
localStorage.removeItem('platform_admin_user');
localStorage.removeItem('platform_admin_role');

console.log('✅ Authentication data cleared');
```

### 2. Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 3. Verify Environment Configuration
Check that your `.env.local` file has:
```env
VITE_USE_MOCK_AUTH=true
VITE_ENVIRONMENT=local
```

### 4. Check Console Logs
After restarting, you should see:
```
🧪 Mock RBAC mode enabled - skipping MSAL provider
🧪 Mock RBAC mode enabled - skipping Azure initialization
🧹 Clearing Azure authentication data for mock mode
```

### 5. Use DevLogin Component
Once in mock mode, you should see the "Development Login" banner with quick login options for different user types and organizations.

## Expected Behavior in Mock Mode

- ✅ Shows "Development Login" banner
- ✅ Displays "🧪 MOCK MODE" indicator in top-right
- ✅ Console shows mock mode messages
- ✅ No Azure authentication calls
- ✅ DevLogin component provides preset users

## Troubleshooting

If you're still seeing Azure authentication:

1. **Check Environment Variables**: Ensure `VITE_USE_MOCK_AUTH=true`
2. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
3. **Restart Server**: Stop and restart the development server
4. **Check Console**: Look for mock mode messages
5. **Verify .env.local**: Make sure the file exists and has correct values

## Quick Fix Script

Run this PowerShell command to clear everything and restart:

```powershell
# Clear browser storage (run in browser console)
localStorage.clear(); sessionStorage.clear(); console.log('Cleared');

# Restart server
npm run dev
```
