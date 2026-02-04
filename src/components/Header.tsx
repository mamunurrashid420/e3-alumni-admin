import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="border-b bg-white fixed top-0 left-0 right-0 z-10">
      <div className="ml-0 lg:ml-64 px-4 py-3 lg:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold">Alumni Admin</h1>
            <p className="text-xs md:text-sm text-gray-600 hidden sm:block">
              Super Admin Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.name || user?.email}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoading}
            size="sm"
            className="lg:h-10 lg:px-4"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
