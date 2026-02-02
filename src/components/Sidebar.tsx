import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  ClipboardCheck,
  UsersRound,
  ShieldCheck,
  Award,
  UserCircle,
  Download,
} from 'lucide-react';
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
        <NavLink
          to="/self-declarations"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            )
          }
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>Self Declarations</span>
        </NavLink>
        <NavLink
          to="/members"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            )
          }
        >
          <Users className="w-5 h-5" />
          <span>Members</span>
        </NavLink>
        <NavLink
          to="/payments"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            )
          }
        >
          <CreditCard className="w-5 h-5" />
          <span>Payments</span>
        </NavLink>
        <NavLink
          to="/downloads"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            )
          }
        >
          <Download className="w-5 h-5" />
          <span>Downloads</span>
        </NavLink>
        <div className="pt-4 border-t">
          {/* <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            About Us
          </p> */}
          <NavLink
            to="/about/convening-committee"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )
            }
          >
            <UsersRound className="w-5 h-5" />
            <span>Convening Committee</span>
          </NavLink>
          <NavLink
            to="/about/advisory-body"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )
            }
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Advisory Body</span>
          </NavLink>
          <NavLink
            to="/about/honor-board"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )
            }
          >
            <Award className="w-5 h-5" />
            <span>Honor Board</span>
          </NavLink>
          <NavLink
            to="/about/batch-representatives"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )
            }
          >
            <UserCircle className="w-5 h-5" />
            <span>Batch Representatives</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
