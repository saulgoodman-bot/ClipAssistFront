import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './store/authStore';

import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Upload } from './pages/Upload';
import { Status } from './pages/Status';
import { Clips } from './pages/Clips';

function AuthRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/upload" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const hydrated = useAuthStore(state => state.hydrated);

  // Suppress hydration mismatch visual flash locally 
  // (In pure react we wait for zustand persist to hydrate)
  if (!hydrated) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route path="/login" element={
            <AuthRoute><Login /></AuthRoute>
          } />
          <Route path="/register" element={
            <AuthRoute><Register /></AuthRoute>
          } />

          <Route element={<AppLayout />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/status/:videoId" element={<Status />} />
            <Route path="/clips/:videoId" element={<Clips />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
