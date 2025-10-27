'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  FileText,
  UserCheck,
  CalendarDays,
  FileBarChart,
  Settings,
  ChevronLeft,
  Building2,
  PlusCircle,
  CheckCircle2,
  Clock4,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/leave/dashboard', icon: LayoutDashboard },
  { name: 'Request Leave', href: '/leave/request', icon: PlusCircle },
  { name: 'My Leaves', href: '/leave/my-leaves', icon: CalendarDays },
  { name: 'Approvals', href: '/leave/approvals', icon: CheckCircle2 },
  { name: 'Calendar', href: '/leave/calendar', icon: Calendar },
  { name: 'Leave Balance', href: '/leave/balances', icon: Clock4 },
  { name: 'Reports', href: '/leave/reports', icon: FileBarChart },
  { name: 'Settings', href: '/leave/settings', icon: Settings },
];

export default function LeaveSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-emerald-700/50 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50 h-full w-64 bg-white border-r border-emerald-200 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-700">Leave Management</h2>
              <p className="text-xs text-emerald-600">Attendance System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-emerald-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-emerald-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                  transition duration-200
                  ${isActive
                    ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-700'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'}
                `}
                onClick={onClose}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-emerald-700' : 'text-slate-500 group-hover:text-emerald-700'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-200">
          <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
            <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-700 truncate">Staff Portal</p>
              <p className="text-xs text-emerald-600 truncate">Leave Management</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

