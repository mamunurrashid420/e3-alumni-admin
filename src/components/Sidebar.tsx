import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-[calc(100vh-4rem)] fixed left-0 top-16">
      <nav className="p-4 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            )
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/applications"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            )
          }
        >
          <FileText className="w-5 h-5" />
          <span>Membership Applications</span>
        </NavLink>
      </nav>
    </aside>
  );
}
