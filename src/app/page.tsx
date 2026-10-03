'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'owner': router.replace('/owner/dashboard'); break;
        case 'subadmin': router.replace('/subadmin/dashboard'); break;
        case 'thekedar': router.replace('/thekedar/home'); break;
      }
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="animate-pulse" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
    </div>
  );
}
