'use client';
import Link from 'next/link';
import { CreditCard, ExternalLink, ShieldCheck, Zap, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function OwnerPayrollBridge() {
  const { state } = useStore();
  const gateway = state.gatewayConfig || {
    provider: 'RazorpayX Enterprise',
    accountNumber: '000405009841',
    balance: 2485000,
  };

  const pendingCount = (state.payrollRecords || []).filter(r => r.status === 'Pending').length;
  const pendingAmount = (state.payrollRecords || []).filter(r => r.status === 'Pending').reduce((acc, curr) => acc + curr.netPayout, 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '36px 32px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto' }}>
          <CreditCard size={28} color="#ffffff" />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '4px', marginBottom: '12px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#065f46' }}>
            INTEGRATED FINTECH SOFTWARE (STANDALONE PORTAL)
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          InteriorPay Payout Gateway Portal
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
          To maintain strict compliance and bank-grade isolation, automated payroll and vendor payouts operate on a dedicated corporate banking software portal integrated with Interior Ops ERP.
        </p>

        {/* Quick Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '28px', textAlign: 'left' }}>
          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Connected Rail</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{gateway.provider}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>A/C: {gateway.accountNumber}</div>
          </div>

          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Escrow</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{formatCurrency(gateway.balance)}</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>Sufficient Liquidity</div>
          </div>

          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Disbursements</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{formatCurrency(pendingAmount)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{pendingCount} Batches Ready</div>
          </div>
        </div>

        {/* Primary Action Button to open in new tab */}
        <a
          href="/gateway"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            fontSize: '14px',
            textDecoration: 'none',
            borderRadius: '8px',
          }}
        >
          <Zap size={16} /> Launch InteriorPay Payout Software (Opens in New Tab) ↗
        </a>

        <div style={{ marginTop: '16px' }}>
          <Link href="/gateway" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Open in this window instead
          </Link>
        </div>
      </div>
    </div>
  );
}
