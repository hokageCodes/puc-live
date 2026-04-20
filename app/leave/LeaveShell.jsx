'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  ClipboardList,
  CalendarClock,
  Menu,
  LogOut,
} from 'lucide-react';
import { useLeaveAuth } from '../../components/leave/LeaveAuthContext';
import { ShadcnSidebarUI } from '../../components/leave/ShadcnSidebarUI';

const {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Sheet,
  SheetTrigger,
  SheetContent,
  Separator,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} = ShadcnSidebarUI;

const AUTH_FREE_ROUTES = ['/leave/login', '/leave/activate', '/leave/forgot', '/leave/reset'];

const NAV_ITEMS = [
  {
    href: '/leave/dashboard',
    label: 'Overview',
    description: 'Balances, activity, and quick actions',
    icon: LayoutDashboard,
  },
  {
    href: '/leave/requests',
    label: 'My Requests',
    description: 'Track submitted leave requests',
    icon: ClipboardList,
  },
  {
    href: '/leave/request/new',
    label: 'New Request',
    description: 'Book time off for yourself',
    icon: CalendarDays,
  },
  {
    href: '/leave/approvals',
    label: 'Approvals',
    description: 'Review pending team requests',
    icon: ListChecks,
    roles: ['teamLead', 'lineManager', 'hr'],
  },
  {
    href: '/leave/approvals/history',
    label: 'Approvals history',
    description: 'Your approval actions & request history',
    icon: ListChecks,
    roles: ['teamLead', 'lineManager', 'hr'],
  },
  {
    href: '/leave/calendar',
    label: 'Leave Calendar',
    description: 'Visualise upcoming absences',
    icon: CalendarClock,
  },
];

const formatRoles = (roles) =>
  Array.isArray(roles) && roles.length ? roles.join(', ') : 'Staff';

export default function LeaveShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, status } = useLeaveAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const skipShell = AUTH_FREE_ROUTES.some((route) => pathname?.startsWith(route));
  const isLoading = status === 'loading' || status === 'authenticating';

  const filteredNav = useMemo(() => {
    if (skipShell) return [];
    if (!Array.isArray(user?.roles) || user.roles.length === 0) {
      return NAV_ITEMS.filter((item) => !item.roles);
    }
    return NAV_ITEMS.filter(
      (item) => !item.roles || item.roles.some((role) => user.roles.includes(role))
    );
  }, [skipShell, user?.roles]);

  if (skipShell) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/leave/login');
    } catch (error) {
      console.error('Leave sign out failed:', error);
    }
  };

  const handleNavigate = () => setSidebarOpen(false);

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-600">
            Paul Usoro &amp; Co.
          </p>
          <p className="text-sm font-semibold text-slate-900">Leave Portal</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-4 py-6 flex-1 overflow-y-auto">
        <NavigationMenu orientation="vertical" className="w-full">
          <NavigationMenuList className="flex flex-col gap-1 w-full">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active = (() => {
                if (!pathname) return false;
                if (pathname === item.href) return true;
                if (!pathname.startsWith(item.href + '/')) return false;
                const longerMatch = filteredNav.some(
                  (other) => other.href !== item.href && pathname.startsWith(other.href)
                );
                return !longerMatch;
              })();
              return (
                <NavigationMenuItem key={item.href} className="w-full">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          onClick={handleNavigate}
                          className={`group flex flex-col rounded-xl px-3 py-3 transition w-full ${
                            active
                              ? 'bg-emerald-50/80 text-emerald-700'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                                active
                                  ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                                  : 'border-slate-200 bg-white text-slate-500 group-hover:border-slate-300'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      <Separator className="my-2" />

      <div className="flex flex-col items-center gap-2 px-5 py-4 mt-auto">
        <Avatar size="lg">
          <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
          <AvatarFallback>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-800">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-slate-500">{formatRoles(user?.roles)}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-center mt-2"
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="relative flex min-h-screen">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-50 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 flex flex-col h-full">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-72 flex-col border-r border-slate-200 bg-white shadow-lg">
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:ml-72">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">
            {isLoading ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
                Loading your workspace…
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
