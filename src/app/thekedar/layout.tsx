'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { MobileLayout } from '@/components/layout';
import { ToastProvider } from '@/components/toast';

export default function ThekedarLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role !== 'thekedar') {
      router.replace('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'thekedar') return null;

  return (
    <ToastProvider>
      <MobileLayout>
        {children}
      </MobileLayout>
    </ToastProvider>
  );
}
