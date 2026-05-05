import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Play, Bell, LogOut, Settings } from 'lucide-react';

export function AppLayout() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-zinc-950 text-zinc-50 font-inter antialiased min-h-screen flex flex-col bg-mesh">
      {/* Mesh Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundColor: '#09090b',
          backgroundImage: `
            radial-gradient(at 0% 0%, hsla(243, 75%, 59%, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(243, 75%, 59%, 0.1) 0px, transparent 50%)
          `
        }}
      />
      
      {/* Header */}
      <header className="flex justify-between items-center h-16 px-6 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 fixed top-0 left-0">
        <Link to="/upload" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Play fill="currentColor" className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-50">ClipAssist</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 mr-4">
            <Link to="/upload" className="text-indigo-400 font-semibold font-label-md">Upload</Link>
            <span className="text-zinc-400 hover:text-zinc-50 cursor-pointer font-label-md">Dashboard</span>
            <span className="text-zinc-400 hover:text-zinc-50 cursor-pointer font-label-md">Library</span>
          </nav>
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Free</span>
            <button className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-600 transition-colors">Upgrade</button>
          </div>
          <div className="flex items-center gap-4 ml-2">
            <button className="text-zinc-400 hover:text-zinc-50 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="text-zinc-400 hover:text-zinc-50 transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex items-start justify-center pt-24 pb-12 px-6 z-10 w-full relative">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 flex justify-center border-t border-zinc-900 z-10 relative bg-zinc-950/50">
        <p className="text-zinc-600 text-xs">© 2024 ClipAssist AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
