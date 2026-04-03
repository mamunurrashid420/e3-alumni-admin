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
  Calendar,
  GraduationCap,
  BookOpen,
  Droplets,
  ImageIcon,
  Megaphone,
  Newspaper,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
      isActive
        ? 'bg-blue-50 text-blue-700 font-medium'
        : 'text-gray-700 hover:bg-gray-50'
    );

  return (
    <nav className="p-4 space-y-2">
      <NavLink
        to="/dashboard"
        className={linkClass}
        onClick={onLinkClick}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/applications"
        className={linkClass}
        onClick={onLinkClick}
      >
        <FileText className="w-5 h-5" />
        <span>Membership Applications</span>
      </NavLink>
      <NavLink
        to="/self-declarations"
        className={linkClass}
        onClick={onLinkClick}
      >
        <ClipboardCheck className="w-5 h-5" />
        <span>Self Declarations</span>
      </NavLink>
      <NavLink
        to="/members"
        className={linkClass}
        onClick={onLinkClick}
      >
        <Users className="w-5 h-5" />
        <span>Members</span>
      </NavLink>
      <NavLink
        to="/blood-donors"
        className={linkClass}
        onClick={onLinkClick}
      >
        <Droplets className="w-5 h-5" />
        <span>Blood Donors</span>
      </NavLink>
      <NavLink
        to="/payments"
        className={linkClass}
        onClick={onLinkClick}
      >
        <CreditCard className="w-5 h-5" />
        <span>Payments</span>
      </NavLink>
      <NavLink
        to="/scholarships"
        className={linkClass}
        onClick={onLinkClick}
      >
        <GraduationCap className="w-5 h-5" />
        <span>Scholarships</span>
      </NavLink>
      <NavLink
        to="/scholarship-applications"
        className={linkClass}
        onClick={onLinkClick}
      >
        <BookOpen className="w-5 h-5" />
        <span>Scholarship Applications</span>
      </NavLink>
      <NavLink
        to="/downloads"
        className={linkClass}
        onClick={onLinkClick}
      >
        <Download className="w-5 h-5" />
        <span>Downloads</span>
      </NavLink>
      <NavLink
        to="/gallery"
        className={linkClass}
        onClick={onLinkClick}
      >
        <ImageIcon className="w-5 h-5" />
        <span>Gallery</span>
      </NavLink>
      <NavLink
        to="/notices"
        className={linkClass}
        onClick={onLinkClick}
      >
        <Megaphone className="w-5 h-5" />
        <span>Notices</span>
      </NavLink>
      <NavLink
        to="/news"
        className={linkClass}
        onClick={onLinkClick}
      >
        <Newspaper className="w-5 h-5" />
        <span>News</span>
      </NavLink>
      <NavLink
        to="/jobs"
        className={linkClass}
        onClick={onLinkClick}
      >
        <Briefcase className="w-5 h-5" />
        <span>Jobs</span>
      </NavLink>
      <NavLink
        to="/events"
        className={linkClass}
        onClick={onLinkClick}
      >
        <Calendar className="w-5 h-5" />
        <span>Events</span>
      </NavLink>
      <div className="pt-4 border-t">
        <NavLink
          to="/about/convening-committee"
          className={linkClass}
          onClick={onLinkClick}
        >
          <UsersRound className="w-5 h-5" />
          <span>Convening Committee</span>
        </NavLink>
        <NavLink
          to="/about/advisory-body"
          className={linkClass}
          onClick={onLinkClick}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Advisory Body</span>
        </NavLink>
        <NavLink
          to="/about/honor-board"
          className={linkClass}
          onClick={onLinkClick}
        >
          <Award className="w-5 h-5" />
          <span>Honor Board</span>
        </NavLink>
        <NavLink
          to="/about/batch-representatives"
          className={linkClass}
          onClick={onLinkClick}
        >
          <UserCircle className="w-5 h-5" />
          <span>Batch Representatives</span>
        </NavLink>
      </div>
    </nav>
  );
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const handleLinkClick = () => {
    onOpenChange?.(false);
  };

  return (
    <>
      {/* Desktop sidebar - fixed, only visible on lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:h-[calc(100vh-4rem)] lg:fixed lg:left-0 lg:top-16 lg:overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <SidebarNav />
        </div>
      </aside>

      {/* Mobile sidebar - Sheet, only visible below lg */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0 lg:hidden flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <SidebarNav onLinkClick={handleLinkClick} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
