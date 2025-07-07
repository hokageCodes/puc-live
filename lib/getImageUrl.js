// lib/getImageUrl.js
export function getImageUrl(profilePhoto) {
    if (!profilePhoto) return '/default-avatar.png';
  
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const path = profilePhoto.replace(/^\/+/, ''); // remove leading slashes
    return `${base}/${path}`.replace(/([^:]\/)\/+/g, '$1');
  }
  