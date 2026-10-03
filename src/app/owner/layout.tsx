'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { DesktopLayout } from '@/components/layout';
import { ToastProvider } from '@/components/toast';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role !== 'owner') {
      router.replace('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'owner') return null;

  return (
    <ToastProvider>
      <DesktopLayout>
        {children}
      </DesktopLayout>
    </ToastProvider>
  );
}
