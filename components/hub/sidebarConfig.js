import { LayoutDashboard } from 'lucide-react';

/**
 * Single source of truth for Hub navigation.
 *
 * Each entry: { name, href, icon, roles? }.
 * - `roles` omitted  → visible to every authenticated user (self-service).
 * - `roles` present  → visible only if the user has at least one of those roles.
 *
 * Modules are appended here as they migrate into the hub (Phase 5+), e.g.:
 *   { name: 'Leave',     href: '/hub/leave',            icon: CalendarDays }
 *   { name: 'Approvals', href: '/hub/leave/approvals',  icon: ListChecks, roles: ['teamLead','lineManager','hr','admin'] }
 *   { name: 'Staff',     href: '/hub/staff',            icon: Users,      roles: ['admin','hr'] }
 *   { name: 'News',      href: '/hub/news',             icon: FileText,   roles: ['admin','hr'] }
 */
export const HUB_NAV = [
  { name: 'Dashboard', href: '/hub/dashboard', icon: LayoutDashboard },
];

const normalize = (roles) =>
  (Array.isArray(roles) ? roles : []).map((r) => String(r).trim().toLowerCase()).filter(Boolean);

/** Filter nav entries to those the given roles may see. */
export function visibleNav(userRoles) {
  const have = new Set(normalize(userRoles));
  return HUB_NAV.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return normalize(item.roles).some((r) => have.has(r));
  });
}
