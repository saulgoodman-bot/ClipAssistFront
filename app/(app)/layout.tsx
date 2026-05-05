'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Play, Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    logout();
    await fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clear: true }),
    });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center h-16 px-6 w-full z-50 bg-zinc-950 border-b border-zinc-800 fixed top-0 left-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Play fill="white" className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-50">ClipAssist</span>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 mr-4">
            <Link 
              href="/upload" 
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                pathname === '/upload' || pathname.startsWith('/status') 
                  ? 'text-indigo-400' 
                  : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50'
              }`}
            >
              Upload
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sm font-medium px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/library" 
              className="text-sm font-medium px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50 transition-colors"
            >
              Library
            </Link>
          </nav>

          <div className="flex items-center gap-2 pr-4 border-r border-zinc-800">
            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Free
            </span>
            <button className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-600 transition-colors active:scale-95 duration-150">
              Upgrade Plan
            </button>
          </div>

          <div className="flex items-center gap-4 pl-2">
            <button className="text-zinc-400 hover:text-zinc-50 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <button onClick={handleLogout} className="text-zinc-400 hover:text-zinc-50 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-zinc-950 border-t border-zinc-800 flex justify-around items-center py-3 z-50">
        <Link href="/upload" className={`flex flex-col items-center gap-1 ${pathname === '/upload' ? 'text-indigo-400' : 'text-zinc-400'}`}>
          <Play className="w-5 h-5" />
          <span className="text-[10px] font-medium">Upload</span>
        </Link>
      </nav>
    </div>
  );
}
