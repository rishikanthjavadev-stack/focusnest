'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('fn_access');
    router.push(token ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0c0f0a' }}>
      <div style={{ fontSize: 32 }}>🪺</div>
    </div>
  );
}
