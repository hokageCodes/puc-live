// Utility to check and debug token issues
export const checkToken = () => {
  if (typeof window === 'undefined') return null;
  
  const token = window.localStorage.getItem('admin_token');
  if (!token) {
    console.warn('⚠️ No admin_token found in localStorage');
    return null;
  }

  try {
    // Decode JWT without verification (just to check structure)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid token format');
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = payload.exp;
    const isExpired = expiresAt < now;
    const timeUntilExpiry = expiresAt - now;

    console.log('🔍 Token Info:', {
      scope: payload.scope,
      roles: payload.roles,
      expiresAt: new Date(expiresAt * 1000).toLocaleString(),
      isExpired,
      timeUntilExpiry: isExpired ? 'EXPIRED' : `${Math.floor(timeUntilExpiry / 60)} minutes`,
    });

    if (isExpired) {
      console.warn('⚠️ Token is expired! Please log in again or refresh the token.');
    }

    return { token, payload, isExpired };
  } catch (err) {
    console.error('❌ Error decoding token:', err);
    return null;
  }
};

// Call this in browser console to debug
if (typeof window !== 'undefined') {
  window.checkToken = checkToken;
}

