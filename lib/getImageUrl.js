// lib/getImageUrl.js
export function getImageUrl(profilePhoto) {
  if (!profilePhoto) return '/default-avatar.png';

  if (/^https?:\/\//i.test(profilePhoto)) {
    return profilePhoto;
  }

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const path = profilePhoto.replace(/^\/+/, '');
  return `${base}/${path}`.replace(/([^:]\/)\/+/g, '$1');
}
