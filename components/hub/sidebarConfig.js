import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  CalendarClock,
  ListChecks,
  Users,
  FileText,
  BookOpenText,
  SlidersHorizontal,
  Scale,
  Target,
  Gauge,
  CalendarRange,
} from 'lucide-react';

// Performance Evaluation module rolls out in phases (see PERFORMANCE-REVIEW-BUILD.md).
// Keep the nav structure in place but hidden until the screens land — flip to true
// (or wire to an env flag) when Phase 1+ pages exist so we never expose dead links.
const PERFORMANCE_ENABLED = false;

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
      // Litigation-only tool — hidden for everyone else (backend also enforces this).
      { name: 'Court Diary', href: '/hub/diary', icon: BookOpenText, show: (u) => /litigation/i.test(u?.department?.name || '') },
      // Self-service appraisal (objectives, CDP, self-assessment). Hidden until Phase 2.
      { name: 'My Performance', href: '/hub/performance', icon: Target, show: () => PERFORMANCE_ENABLED },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      { name: 'Staff', href: '/hub/staff', icon: Users, roles: ['admin', 'hr', 'cms'] },
      { name: 'Approvals', href: '/hub/leave/approvals', icon: ListChecks, roles: ['teamLead', 'lineManager', 'hr', 'admin'] },
      { name: 'Leave Types', href: '/hub/leave-types', icon: SlidersHorizontal, roles: ['admin', 'hr'] },
      { name: 'Leave Override', href: '/hub/leave-override', icon: Scale, roles: ['admin', 'hr'] },
      { name: 'News', href: '/hub/news', icon: FileText, roles: ['admin', 'cms'] },
      // Performance queue for managers + HR/admin. Hidden until Phase 3.
      { name: 'Performance', href: '/hub/performance/reviews', icon: Gauge, roles: ['teamLead', 'lineManager', 'hr', 'admin'], show: () => PERFORMANCE_ENABLED },
      // Cycle admin (open/advance/close, moderation). Hidden until Phase 1.
      { name: 'Performance Cycles', href: '/hub/performance/cycles', icon: CalendarRange, roles: ['hr', 'admin'], show: () => PERFORMANCE_ENABLED },
    ],
  },
];

const normalize = (roles) =>
  (Array.isArray(roles) ? roles : []).map((r) => String(r).trim().toLowerCase()).filter(Boolean);

const canSee = (item, have, user) => {
  // Optional custom predicate (e.g. department-based visibility).
  if (item.show && !item.show(user)) return false;
  if (!item.roles || item.roles.length === 0) return true;
  return normalize(item.roles).some((r) => have.has(r));
};

/** Return groups with items the user may see; empty groups are dropped. */
export function visibleNavGroups(user) {
  const have = new Set(normalize(user?.roles));
  return HUB_NAV_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((item) => canSee(item, have, user)) }))
    .filter((group) => group.items.length > 0);
}
