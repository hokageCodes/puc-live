import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  CalendarClock,
  ListChecks,
  Users,
  FileText,
  UserCog,
  BookOpenText,
  SlidersHorizontal,
} from 'lucide-react';

/**
 * Hub navigation, grouped into sections.
 *
 * - "Personal" = self-service every staff member gets (their own leave, diary, etc.).
 * - "Management" = role-gated responsibilities (approvals, staff, uploads, users).
 *
 * Each item may declare `roles`; when omitted it's visible to all authenticated
 * users. A whole group is hidden when none of its items are visible for the user —
 * so a plain staffer sees only the Personal section (no divider, no Management).
 *
 * Add new modules by appending an item to the appropriate group (Phase 10+).
 */
export const HUB_NAV_GROUPS = [
  {
    id: 'personal',
    label: 'Personal',
    items: [
      { name: 'Dashboard', href: '/hub/dashboard', icon: LayoutDashboard },
      { name: 'My Leave', href: '/hub/leave/dashboard', icon: CalendarDays },
      { name: 'My Requests', href: '/hub/leave/requests', icon: ClipboardList },
      { name: 'Leave Calendar', href: '/hub/leave/calendar', icon: CalendarClock },
      { name: 'Court Diary', href: '/hub/diary', icon: BookOpenText },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      { name: 'Staff', href: '/hub/staff', icon: Users, roles: ['admin', 'hr', 'cms'] },
      { name: 'Approvals', href: '/hub/leave/approvals', icon: ListChecks, roles: ['teamLead', 'lineManager', 'hr', 'admin'] },
      { name: 'Leave Types', href: '/hub/leave-types', icon: SlidersHorizontal, roles: ['admin', 'hr'] },
      { name: 'News', href: '/hub/news', icon: FileText, roles: ['admin', 'cms'] },
      { name: 'Users & Roles', href: '/hub/users', icon: UserCog, roles: ['admin'] },
    ],
  },
];

const normalize = (roles) =>
  (Array.isArray(roles) ? roles : []).map((r) => String(r).trim().toLowerCase()).filter(Boolean);

const canSee = (item, have) => {
  if (!item.roles || item.roles.length === 0) return true;
  return normalize(item.roles).some((r) => have.has(r));
};

/** Return groups with items filtered to the user's roles; empty groups are dropped. */
export function visibleNavGroups(userRoles) {
  const have = new Set(normalize(userRoles));
  return HUB_NAV_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((item) => canSee(item, have)) }))
    .filter((group) => group.items.length > 0);
}
