'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import Sidebar from './Sidebar';
import AICoach from './AICoach';

const AUTH_ROUTES = ['/login', '/register', '/onboarding'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.some(r => pathname.startsWith(r));

  if (isAuth) return <>{children}</>;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0c0f0a' }}>
      <Sidebar />
      <main style={{ flex:1, overflow:'auto' }}>{children}</main>
      <AICoach />
    </div>
  );
}
