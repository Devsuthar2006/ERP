'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { DesktopLayout } from '@/components/layout';
import { ToastProvider } from '@/components/toast';

export default function SubadminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role !== 'subadmin') {
      router.replace('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'subadmin') return null;

  return (
    <ToastProvider>
      <DesktopLayout>
        {children}
      </DesktopLayout>
    </ToastProvider>
  );
}
