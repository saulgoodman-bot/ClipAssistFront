import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ClipAssistAPI } from '../lib/api';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
       await ClipAssistAPI.register(email, password);
       const res = await ClipAssistAPI.login(email, password);
       login(res.access_token, { user_id: res.user_id, email: res.email, plan: res.plan });
       navigate('/upload');
    } catch (err: any) {
       console.warn("Backend not available, bypassing for demo purposes.");
       login('mock_token_123', { user_id: 1, email: email || 'demo@example.com', plan: 'Free' });
       navigate('/upload');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl pointer-events-none"></div>
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Create an account</h1>
          <p className="text-sm text-zinc-400 mt-2">Get started with ClipAssist</p>
          <p className="text-xs text-indigo-400 mt-4 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
            For demo purposes, registering with any credentials will log you in without a backend.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div>
             <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Password</label>
             <input 
              type="password" 
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
             <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Confirm Password</label>
             <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-500 text-white font-medium py-3 rounded-lg hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6 relative z-10">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
