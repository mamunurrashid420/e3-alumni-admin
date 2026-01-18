import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function Header() {
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
      <div className="ml-64 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alumni Admin</h1>
          <p className="text-sm text-gray-600">Super Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name || user?.email}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoading}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
