// Utility to check and debug cookie-based admin session presence
export const checkToken = () => {
  if (typeof window === 'undefined') return null;
  
  const hasAdminCookie = document.cookie.split(';').some((cookie) => cookie.trim().startsWith('admin_token='));
  if (!hasAdminCookie) {
    console.warn('⚠️ No admin_token cookie found');
    return null;
  }
  console.log('✅ admin_token cookie is present (httpOnly token value is not readable in JS by design).');
  return { hasAdminCookie };
};

// Call this in browser console to debug
if (typeof window !== 'undefined') {
  window.checkToken = checkToken;
}

