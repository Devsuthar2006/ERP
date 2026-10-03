'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ToastProvider } from '@/components/toast';
import Link from 'next/link';
import {
  CreditCard,
  Building2,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Lock,
  Wallet,
  CheckCircle2,
  RefreshCw,
  LayoutDashboard,
  Zap,
  Users,
  FileText,
  Landmark,
  Code2,
  Sliders,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  Clock,
  LogOut,
  ChevronRight,
  Check
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function GatewayLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { state } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const gateway = state.gatewayConfig || {
    provider: 'RazorpayX Enterprise',
    accountNumber: '000405009841',
    balance: 2485000,
    escrowBalance: 5000000,
    dailyLimit: 10000000,
    usedToday: 1450000,
  };

  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
        {/* Top Operational Status Bar */}
        <div style={{ background: '#0f172a', color: '#ffffff', padding: '6px 20px', fontSize: '11px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              RBI Payout Rail: <b>ICICI Corporate Direct & RazorpayX Core</b>
            </span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ color: '#cbd5e1' }}>Merchant ID: <b style={{ fontFamily: 'monospace' }}>MID_INTOPS_98241_PROD</b></span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ color: '#cbd5e1' }}>Mode: <b style={{ color: '#10b981' }}>LIVE PRODUCTION</b></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: '#94a3b8' }}>
              Bank Rail Health: <b style={{ color: '#10b981' }}>UPI 100%</b> • <b style={{ color: '#10b981' }}>IMPS 100%</b> • <b style={{ color: '#10b981' }}>NEFT Normal</b>
            </span>
            <span style={{ color: '#64748b' }}>|</span>
            <Link href="/owner/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={12} /> Return to Operations ERP
            </Link>
          </div>
        </div>

        {/* Dedicated Main Fintech Header */}
        <header
          style={{
            background: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            padding: '12px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Brand Logo & Subtitle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <CreditCard size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    InteriorPay
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 800, background: '#f1f5f9', color: '#0f172a', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    CORPORATE BANKING
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Enterprise Payouts, Staff Payroll & Contractor Settlement Platform
                </div>
              </div>

              {/* Connected with ERP badge */}
              <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', background: '#ecfdf5', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                <Check size={11} color="#059669" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857' }}>
                  ERP Live Sync (26 Staff • 600 Labourers)
                </span>
              </div>
            </div>

            {/* Right: Balances, Account Info & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Virtual Account Escrow Balance Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Payout Balance</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(gateway.balance)}</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <div>A/C: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>••••{gateway.accountNumber.slice(-4)}</span></div>
                  <div style={{ color: '#059669', fontWeight: 600 }}>Auto-Sweep Active</div>
                </div>
              </div>

              {/* Back to ERP Button */}
              <Link
                href="/owner/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={13} /> Exit to ERP
              </Link>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>

        {/* Enterprise Fintech Footer */}
        <footer style={{ borderTop: '1px solid var(--border-color)', background: '#ffffff', padding: '14px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <b>InteriorPay Corporate Gateway</b> • Authorized Payment Aggregator / Payout Partner via ICICI Bank & RazorpayX Enterprise Rails.
            </div>
            <div>
              PCI-DSS Level 1 Compliant • 256-Bit TLS • Real-time Automated Webhook Dispatch (100% SLA)
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
