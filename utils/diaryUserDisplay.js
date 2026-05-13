/** Display helpers for leave/diary session user (from auth `user` payload). */

export function leaveUserInitials(user) {
  if (!user) return '?';
  const a = (user.firstName || '').trim().charAt(0);
  const b = (user.lastName || '').trim().charAt(0);
  if (a && b) return `${a}${b}`.toUpperCase();
  if (a) return a.toUpperCase();
  const email = (user.email || '').trim();
  return email ? email.charAt(0).toUpperCase() : '?';
}
