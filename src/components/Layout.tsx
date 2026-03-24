import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import { LayoutDashboard, MessageSquare, User, Activity, Settings, LogOut, ShieldAlert, Cpu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  profile: UserProfile | null;
}

export function Layout({ profile }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { label: 'Access', path: '/', icon: LayoutDashboard },
    { label: 'Chat', path: '/chat', icon: MessageSquare },
    { label: 'Status', path: '/status', icon: Activity },
    { label: 'Account', path: '/account', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (profile?.role === 'admin') {
    navItems.push(
      { label: 'Admin', path: '/admin', icon: ShieldAlert },
      { label: 'AI Dashboard', path: '/ai-dashboard', icon: Cpu }
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">HyperTech</h1>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Hotspot Manager</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile Friendly) */}
      <nav className="flex items-center justify-around px-2 py-3 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                isActive ? "text-orange-500 bg-orange-500/10" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
