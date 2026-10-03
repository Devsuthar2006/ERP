'use client';
import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import {
  CreditCard,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Download,
  ShieldCheck,
  Zap,
  RefreshCw,
  Search,
  Filter,
  FileText,
  DollarSign,
  ChevronRight,
  Send,
  Eye,
  Lock,
  Smartphone,
  ExternalLink,
  Plus,
  Wallet,
  Landmark,
  ArrowUpRight,
  Sliders,
  Check,
  Key,
  Copy,
  Terminal,
  Activity,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  Code2,
  CheckSquare,
  ShieldAlert,
  QrCode,
  Receipt,
  Scale,
  Server,
  Layers,
  FileSpreadsheet,
  BadgePercent,
  CheckCheck,
  HelpCircle,
  Share2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PayrollRecord,
  StaffEmployee,
  ClientPaymentLink,
  MakerCheckerApproval,
  StatutoryChallan,
  VirtualEscrowPool,
} from '@/lib/types';

export default function GatewayPage() {
  const { state, dispatch } = useStore();

  // Primary Navigation tabs:
  // 'dashboard' | 'payouts' | 'approvals' | 'collections' | 'beneficiaries' | 'statutory' | 'ledger' | 'escrow' | 'developer' | 'security'
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'payouts' | 'approvals' | 'collections' | 'beneficiaries' | 'statutory' | 'ledger' | 'escrow' | 'developer' | 'security'
  >('dashboard');

  // Payout Hub state
  const [payoutGroup, setPayoutGroup] = useState<'all' | 'staff' | 'labour' | 'contractors'>('all');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Disbursed' | 'Pending'>('All');
  const [siteFilter, setSiteFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  // Modals & Interactive Flows
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchTargetGroup, setBatchTargetGroup] = useState<'all_pending' | 'staff' | 'labour' | 'contractors'>('all_pending');
  const [batchRail, setBatchRail] = useState<'Instant UPI' | 'IMPS Direct' | 'NEFT Batch'>('Instant UPI');
  const [batchStep, setBatchStep] = useState<'preview' | 'authenticating' | 'processing' | 'completed'>('preview');
  const [processingProgress, setProcessingProgress] = useState(0);

  // Maker-Checker Signoff Modal
  const [selectedApproval, setSelectedApproval] = useState<MakerCheckerApproval | null>(null);
  const [otpToken, setOtpToken] = useState('482019');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Quick Single Payout Modal
  const [showQuickPayoutModal, setShowQuickPayoutModal] = useState(false);
  const [quickPayoutForm, setQuickPayoutForm] = useState({
    recipientName: '',
    bankAccount: '',
    ifsc: 'ICIC0000004',
    upiId: '',
    amount: '',
    rail: 'Instant UPI',
    purpose: 'Labour Site Advance',
  });

  // Client Payment Link Modal
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [createLinkForm, setCreateLinkForm] = useState({
    clientName: '',
    clientPhone: '',
    projectName: 'Luxury Villa - Palm Meadows',
    milestoneDescription: '',
    amount: '',
  });

  // Penny Drop Verification Modal
  const [showPennyDropModal, setShowPennyDropModal] = useState(false);
  const [pennyDropForm, setPennyDropForm] = useState({
    accountNumber: '',
    ifsc: 'ICIC0000004',
    accountHolder: '',
  });
  const [pennyDropResult, setPennyDropResult] = useState<{
    status: 'idle' | 'verifying' | 'success' | 'failed';
    nameAtBank?: string;
    utr?: string;
  }>({ status: 'idle' });

  // Payslip modal
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  // Top-up wallet modal
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('500000');

  // Interactive Webhook Dispatcher
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'transmitting' | 'success'>('idle');
  const [testWebhookEvent, setTestWebhookEvent] = useState('payout.processed');

  // Copy API key state
  const [copiedKey, setCopiedKey] = useState(false);

  // Gateway config
  const gateway = state.gatewayConfig || {
    provider: 'RazorpayX Enterprise',
    accountNumber: '000405009841',
    accountHolder: 'Interior Operations Control Pvt Ltd',
    balance: 2485000,
    escrowBalance: 5000000,
    dailyLimit: 10000000,
    usedToday: 1450000,
    isLive: true,
    autoRetry: true,
    webhookUrl: 'https://api.interiorops.internal/v1/payout-webhooks',
    webhookSecret: 'whsec_98410294821a',
  };

  // Aggregated Analytics
  const records = state.payrollRecords || [];
  const staffRecords = records.filter(r => r.type === 'Staff Salary');
  const labourRecords = records.filter(r => r.type === 'Labour Wages');
  const contractorRecords = records.filter(r => r.type === 'Contractor Milestone');

  const totalGrossDisbursed = records.filter(r => r.status === 'Disbursed').reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalNetDisbursed = records.filter(r => r.status === 'Disbursed').reduce((acc, curr) => acc + curr.netPayout, 0);
  const totalPendingAmount = records.filter(r => r.status === 'Pending').reduce((acc, curr) => acc + curr.netPayout, 0);
  const totalTdsDeducted = records.filter(r => r.status === 'Disbursed').reduce((acc, curr) => acc + curr.tdsDeduction, 0);
  const totalPfDeducted = records.filter(r => r.status === 'Disbursed').reduce((acc, curr) => acc + curr.pfDeduction, 0);

  const clientLinks = state.clientPaymentLinks || [];
  const totalCollections = clientLinks.filter(l => l.status === 'Paid').reduce((s, l) => s + l.amount, 0);
  const pendingCollections = clientLinks.filter(l => l.status === 'Issued').reduce((s, l) => s + l.amount, 0);

  const approvals = state.makerCheckerApprovals || [];
  const pendingApprovals = approvals.filter(a => a.status === 'Pending Checker Signoff');

  const challans = state.statutoryChallans || [];
  const escrowPools = state.escrowPools || [];

  // Target records for batch payout modal
  const targetPendingRecords = useMemo(() => {
    return records.filter(r => {
      if (r.status !== 'Pending') return false;
      if (batchTargetGroup === 'all_pending') return true;
      if (batchTargetGroup === 'staff') return r.type === 'Staff Salary';
      if (batchTargetGroup === 'labour') return r.type === 'Labour Wages';
      if (batchTargetGroup === 'contractors') return r.type === 'Contractor Milestone';
      return true;
    });
  }, [records, batchTargetGroup]);

  const targetBatchNetTotal = targetPendingRecords.reduce((acc, curr) => acc + curr.netPayout, 0);

  // Filtered views for payout table
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (payoutGroup === 'staff' && r.type !== 'Staff Salary') return false;
      if (payoutGroup === 'labour' && r.type !== 'Labour Wages') return false;
      if (payoutGroup === 'contractors' && r.type !== 'Contractor Milestone') return false;

      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (siteFilter !== 'All' && r.siteName !== siteFilter) return false;

      if (search) {
        const query = search.toLowerCase();
        const matchName = r.recipientName.toLowerCase().includes(query);
        const matchTrade = r.designationOrTrade.toLowerCase().includes(query);
        const matchUtr = r.utrNumber?.toLowerCase().includes(query) || false;
        const matchBank = r.bankName.toLowerCase().includes(query);
        return matchName || matchTrade || matchUtr || matchBank;
      }
      return true;
    });
  }, [records, payoutGroup, statusFilter, siteFilter, search]);

  // Execute Batch Disbursement Simulation
  const handleExecuteBatch = () => {
    setBatchStep('authenticating');
    setProcessingProgress(15);

    setTimeout(() => {
      setBatchStep('processing');
      setProcessingProgress(45);

      setTimeout(() => {
        setProcessingProgress(75);

        setTimeout(() => {
          setProcessingProgress(100);

          // Dispatch to store
          const ids = targetPendingRecords.map(r => r.id);
          dispatch({
            type: 'PROCESS_PAYROLL_BATCH',
            payload: {
              recordIds: ids,
              gatewayProvider: gateway.provider,
              paymentRail: batchRail,
            },
          });

          setBatchStep('completed');
        }, 600);
      }, 700);
    }, 800);
  };

  // Single record instant payout
  const handleInstantSingleDisburse = (record: PayrollRecord) => {
    dispatch({
      type: 'DISBURSE_SINGLE_PAYROLL',
      payload: {
        recordId: record.id,
      },
    });
  };

  // Reset Demo for testing
  const handleResetDemo = () => {
    dispatch({ type: 'RESET_PAYROLL_STATUS' });
  };

  // Topup Wallet
  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topupAmount) || 500000;
    dispatch({ type: 'TOPUP_GATEWAY_BALANCE', payload: amount });
    setShowTopupModal(false);
  };

  // Penny Drop Simulation
  const handlePennyDropVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setPennyDropResult({ status: 'verifying' });

    setTimeout(() => {
      setPennyDropResult({
        status: 'success',
        nameAtBank: pennyDropForm.accountHolder.toUpperCase() || 'RAMESH KUMAR CHANDRA',
        utr: `UTR${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }, 1200);
  };

  // Handle Quick Payout
  const handleQuickPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(quickPayoutForm.amount) || 10000;
    const utr = `UTR${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    dispatch({
      type: 'TOPUP_GATEWAY_BALANCE',
      payload: -amt,
    });

    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        id: `audit-${Date.now()}`,
        userId: 'user-owner',
        userName: 'Rajesh Singhania',
        action: 'Quick Payout Executed',
        entityType: 'PaymentGateway',
        entityId: utr,
        details: `Disbursed ${formatCurrency(amt)} to ${quickPayoutForm.recipientName} (${quickPayoutForm.rail}) • UTR: ${utr}`,
        createdAt: new Date().toISOString(),
      },
    });

    setShowQuickPayoutModal(false);
    alert(`Payout of ${formatCurrency(amt)} successfully credited to ${quickPayoutForm.recipientName}!\nBank Reference UTR: ${utr}`);
  };

  // Handle Maker-Checker Authorization
  const handleCheckerAuthorize = (approval: MakerCheckerApproval) => {
    setIsAuthorizing(true);
    setTimeout(() => {
      dispatch({
        type: 'APPROVE_MAKER_CHECKER',
        payload: {
          approvalId: approval.id,
          checkerName: 'Rajesh Singhania',
          checkerRole: 'Managing Director / Owner',
        },
      });
      setIsAuthorizing(false);
      setSelectedApproval(null);
    }, 800);
  };

  // Handle Create Payment Link
  const handleCreatePaymentLink = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(createLinkForm.amount) || 250000;
    const newLink: ClientPaymentLink = {
      id: `link-${Date.now()}`,
      linkNumber: `PLINK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: createLinkForm.clientName,
      clientPhone: createLinkForm.clientPhone,
      projectName: createLinkForm.projectName,
      milestoneDescription: createLinkForm.milestoneDescription,
      amount: amt,
      status: 'Issued',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      shortUrl: `https://pay.interiorops.internal/pl/${createLinkForm.clientName.toLowerCase().replace(/\s+/g, '-')}-m1`,
    };

    dispatch({ type: 'CREATE_PAYMENT_LINK', payload: newLink });
    setShowCreateLinkModal(false);
    setCreateLinkForm({
      clientName: '',
      clientPhone: '',
      projectName: 'Luxury Villa - Palm Meadows',
      milestoneDescription: '',
      amount: '',
    });
  };

  // Simulate Inward Client Payment
  const handleSimulateClientPay = (link: ClientPaymentLink) => {
    dispatch({
      type: 'MARK_PAYMENT_LINK_PAID',
      payload: {
        linkId: link.id,
        paymentMethod: 'UPI',
      },
    });
  };

  // Deposit Statutory Challan
  const handleDepositChallan = (challan: StatutoryChallan) => {
    dispatch({
      type: 'DEPOSIT_STATUTORY_CHALLAN',
      payload: { challanId: challan.id },
    });
  };

  // Fire test webhook
  const handleFireTestWebhook = () => {
    setWebhookStatus('transmitting');
    setTimeout(() => {
      setWebhookStatus('success');
      setTimeout(() => setWebhookStatus('idle'), 3000);
    }, 900);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* ========================================================================= */}
      {/* ENTERPRISE FINTECH TOP NAVIGATION BAR (10 MODULES) */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: LayoutDashboard },
            { id: 'payouts', label: `⚡ Payouts (${records.filter(r => r.status === 'Pending').length} Pending)`, icon: Zap },
            { id: 'approvals', label: `🛡️ Approvals (${pendingApprovals.length})`, icon: ShieldCheck, alert: pendingApprovals.length > 0 },
            { id: 'collections', label: '📥 Client Collections', icon: QrCode },
            { id: 'beneficiaries', label: '👥 Beneficiaries & Penny-Drop', icon: Users },
            { id: 'statutory', label: '🏛️ Tax & Statutory (TDS/PF)', icon: Receipt },
            { id: 'ledger', label: '📜 Bank UTR Ledger', icon: FileText },
            { id: 'escrow', label: '🏦 Escrow Virtual Pools', icon: Landmark },
            { id: 'developer', label: '🔌 Webhooks & Routing', icon: Code2 },
            { id: 'security', label: '🔒 Security & Audit Log', icon: Lock },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '8px 13px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: isActive ? '#0f172a' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid #0f172a' : '1px solid var(--border-color)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative',
                }}
              >
                <Icon size={14} /> {tab.label}
                {tab.alert && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Global Fintech Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowQuickPayoutModal(true)}
            className="btn-secondary"
            style={{ padding: '7px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Send size={13} /> Quick Payout
          </button>
          <button
            onClick={() => {
              setBatchTargetGroup('all_pending');
              setBatchStep('preview');
              setShowBatchModal(true);
            }}
            className="btn-primary"
            style={{ padding: '7px 15px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={13} /> Bulk Disbursal Run
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1: FINTECH DASHBOARD COCKPIT */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Real-time Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="kpi-card blue" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Available Payout Escrow
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                    {formatCurrency(gateway.balance)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Virtual Pool • ICICI Direct
                  </div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={18} color="#2563eb" />
                </div>
              </div>
              <button
                onClick={() => setShowTopupModal(true)}
                style={{ marginTop: '12px', width: '100%', padding: '6px', fontSize: '11.5px', fontWeight: 700, background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '5px', color: '#1d4ed8', cursor: 'pointer' }}
              >
                + Add Escrow Liquidity
              </button>
            </div>

            <div className="kpi-card green" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    24h Settled Outflows
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {formatCurrency(totalNetDisbursed)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600, marginTop: '4px' }}>
                    {records.filter(r => r.status === 'Disbursed').length} Beneficiaries Credited
                  </div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={18} color="#059669" />
                </div>
              </div>
              <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
                Avg Latency: <b>2.4s via IMPS & UPI</b>
              </div>
            </div>

            <div className="kpi-card amber" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Maker-Checker Queue
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {formatCurrency(pendingApprovals.reduce((s, a) => s + a.totalAmount, 0))}
                  </div>
                  <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 600, marginTop: '4px' }}>
                    {pendingApprovals.length} Batches Awaiting Signoff
                  </div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={18} color="#d97706" />
                </div>
              </div>
              <button
                onClick={() => setActiveTab('approvals')}
                style={{ marginTop: '12px', width: '100%', padding: '6px', fontSize: '11.5px', fontWeight: 700, background: '#0f172a', border: '1px solid #0f172a', borderRadius: '5px', color: '#ffffff', cursor: 'pointer' }}
              >
                Review Approvals Queue →
              </button>
            </div>

            <div className="kpi-card purple" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Client Inward Collections
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
                    {formatCurrency(totalCollections)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600, marginTop: '4px' }}>
                    {clientLinks.filter(l => l.status === 'Paid').length} Milestones Cleared
                  </div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={18} color="#7c3aed" />
                </div>
              </div>
              <button
                onClick={() => setActiveTab('collections')}
                style={{ marginTop: '12px', width: '100%', padding: '6px', fontSize: '11.5px', fontWeight: 700, background: '#ffffff', border: '1px solid #ddd6fe', borderRadius: '5px', color: '#6d28d9', cursor: 'pointer' }}
              >
                + Issue Payment Link
              </button>
            </div>
          </div>

          {/* Real-time Rails Status & NPCI Health Strip */}
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={18} color="#059669" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800 }}>National Payment Clearing Rails (RBI / NPCI)</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Direct Host-to-Host banking node health with auto-failover</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#065f46' }}>UPI 2.0: 99.85% (1.2s avg)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#065f46' }}>IMPS 24x7: 99.9% (2.1s avg)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1d4ed8' }}>Corporate NEFT: Next Half-Hour Batch</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#0f172a' }}>Failover: <b>RazorpayX → ICICI Direct</b></span>
              </div>
            </div>
          </div>

          {/* Operational Streams Triad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Stream 1: 26 Office Staff */}
            <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #0f172a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monthly Salary Stream</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0 0' }}>26 Office Staff Personnel</h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#0f172a' }}>
                  September 2026
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Design Architects, Site Leads, Quantity Surveyors, Project Managers & Accounts team
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>{formatCurrency(staffRecords.reduce((s, r) => s + r.netPayout, 0))}</span>
                <button
                  onClick={() => { setActiveTab('payouts'); setPayoutGroup('staff'); }}
                  className="btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '12px' }}
                >
                  Manage Roster →
                </button>
              </div>
            </div>

            {/* Stream 2: Site Labour */}
            <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weekly Wage Stream</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0 0' }}>Site Labour Force (50+ Deployed)</h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8' }}>
                  Week 39 Attendance Synced
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Attendance-synced daily wage credits, verified overtime, and advance deductions across 8 sites
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>{formatCurrency(labourRecords.reduce((s, r) => s + r.netPayout, 0))}</span>
                <button
                  onClick={() => { setActiveTab('payouts'); setPayoutGroup('labour'); }}
                  className="btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '12px' }}
                >
                  Manage Labour →
                </button>
              </div>
            </div>

            {/* Stream 3: Subcontractors */}
            <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #059669' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contractor Billing</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0 0' }}>Subcontractor Milestone Releases</h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#047857' }}>
                  TDS 194C Compliant
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Carpentry, Electrical, Plumbing and POP certified milestone settlements with 5% retention hold
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>{formatCurrency(contractorRecords.reduce((s, r) => s + r.netPayout, 0))}</span>
                <button
                  onClick={() => { setActiveTab('payouts'); setPayoutGroup('contractors'); }}
                  className="btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '12px' }}
                >
                  Manage Invoices →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 2: PAYOUTS & DISBURSAL HUB */}
      {/* ========================================================================= */}
      {activeTab === 'payouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub-Group Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'all', label: `All Beneficiaries (${records.length})` },
                { id: 'staff', label: `👔 26 Office Staff (${staffRecords.length})` },
                { id: 'labour', label: `👷 Site Labour (${labourRecords.length})` },
                { id: 'contractors', label: `🏗️ Contractor Milestones (${contractorRecords.length})` },
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setPayoutGroup(g.id as any)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: payoutGroup === g.id ? '#0f172a' : '#ffffff',
                    color: payoutGroup === g.id ? '#ffffff' : 'var(--text-secondary)',
                    border: payoutGroup === g.id ? '1px solid #0f172a' : '1px solid var(--border-color)',
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {records.filter(r => r.status === 'Pending').length > 0 && (
              <button
                onClick={() => {
                  setBatchTargetGroup(payoutGroup === 'all' ? 'all_pending' : (payoutGroup as any));
                  setBatchStep('preview');
                  setShowBatchModal(true);
                }}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Zap size={13} /> Disburse Pending ({formatCurrency(totalPendingAmount)}) →
              </button>
            )}
          </div>

          {/* Search and Filters Bar */}
          <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '34px', width: '100%', fontSize: '13px' }}
                placeholder="Search beneficiary name, trade, bank or UTR..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: '140px', fontSize: '12.5px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Disbursed">Disbursed</option>
            </select>

            {payoutGroup === 'labour' && (
              <select
                className="form-select"
                style={{ width: '180px', fontSize: '12.5px' }}
                value={siteFilter}
                onChange={e => setSiteFilter(e.target.value)}
              >
                <option value="All">All Sites (8)</option>
                {state.sites.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            )}

            {(search || statusFilter !== 'All' || siteFilter !== 'All') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); setSiteFilter('All'); }}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Reset
              </button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing <b>{filteredRecords.length}</b> records
            </div>
          </div>

          {/* Records Data Table */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Beneficiary Details</th>
                    <th>Role / Designation</th>
                    <th>Work Site</th>
                    <th>Bank & Settlement Rail</th>
                    <th>Gross Earnings</th>
                    <th>Deductions (TDS/PF)</th>
                    <th>Net Settlement</th>
                    <th>Disbursal Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                          {r.recipientName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                          ID: {r.recipientId} • {r.cycle}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {r.designationOrTrade}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '11.5px', fontWeight: 600, background: '#f8fafc', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          {r.siteName || 'Head Office'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{r.bankName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          A/C: ••••{r.bankAccount.slice(-4)} • <span style={{ color: '#2563eb', fontWeight: 600 }}>{r.paymentRail}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{formatCurrency(r.grossAmount)}</div>
                        {r.overtimeAmount > 0 && (
                          <div style={{ fontSize: '10.5px', color: '#b45309' }}>+{formatCurrency(r.overtimeAmount)} OT</div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '12.5px', color: r.totalDeductions > 0 ? '#dc2626' : 'var(--text-muted)' }}>
                          {r.totalDeductions > 0 ? `-${formatCurrency(r.totalDeductions)}` : '₹0'}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          {r.tdsDeduction > 0 && `TDS: ₹${r.tdsDeduction} `}
                          {r.pfDeduction > 0 && `PF: ₹${r.pfDeduction} `}
                          {r.advanceDeduction > 0 && `Adv: ₹${r.advanceDeduction}`}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                          {formatCurrency(r.netPayout)}
                        </div>
                      </td>

                      <td>
                        {r.status === 'Disbursed' ? (
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={11} /> DISBURSED
                            </span>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                              UTR: {r.utrNumber?.slice(-8)}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={11} /> PENDING
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {r.status === 'Pending' ? (
                            <button
                              onClick={() => handleInstantSingleDisburse(r)}
                              className="btn-primary"
                              style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Zap size={12} /> Pay Now
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedPayslip(r)}
                              className="btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FileText size={12} /> Advice Slip
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 3: MAKER-CHECKER APPROVALS QUEUE (DUAL AUTHORIZATION) */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#2563eb" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                  Corporate Maker-Checker Authorization Queue
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Mandatory Dual-Control workflow: High-value payouts and batches prepared by HR/Surveyor require Managing Director / CFO 2FA signoff before banking release.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                Policy: Payouts &gt; ₹50,000 Lock Active
              </span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch / Payout Title</th>
                  <th>Stream Type</th>
                  <th>Initiator (Maker)</th>
                  <th>Recipients</th>
                  <th>Total Bank Outflow</th>
                  <th>Risk Rating</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: 'right' }}>Authorization Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map(app => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{app.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Batch Ref: {app.batchId}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, background: '#f1f5f9', color: '#0f172a', padding: '2px 8px', borderRadius: '4px' }}>
                        {app.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{app.makerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{app.makerRole}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', fontWeight: 700 }}>{app.beneficiaryCount} Accounts</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                        {formatCurrency(app.totalAmount)}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: app.riskScore === 'Low' ? '#ecfdf5' : '#fffbeb',
                        color: app.riskScore === 'Low' ? '#059669' : '#d97706',
                      }}>
                        {app.riskScore.toUpperCase()} RISK
                      </span>
                    </td>
                    <td>
                      {app.status === 'Pending Checker Signoff' ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} /> PENDING SIGN-OFF
                        </span>
                      ) : (
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={11} /> APPROVED & EXECUTED
                          </span>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            By {app.checkerName}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {app.status === 'Pending Checker Signoff' ? (
                        <button
                          onClick={() => setSelectedApproval(app)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Lock size={12} /> Sign Off (2FA)
                        </button>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 4: INWARD CLIENT COLLECTIONS & PAYMENT LINKS (RECEIVABLES) */}
      {/* ========================================================================= */}
      {activeTab === 'collections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="#7c3aed" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                  Client Collections & Milestone Billing Engine
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Generate instant digital payment links and dynamic UPI QR codes for interior clients. Funds credit directly into your Escrow Virtual Account.
              </p>
            </div>

            <button
              onClick={() => setShowCreateLinkModal(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Create Milestone Payment Link
            </button>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Link Reference</th>
                  <th>Client Name & Contact</th>
                  <th>Project Name</th>
                  <th>Milestone Description</th>
                  <th>Invoice Amount</th>
                  <th>Collection Status</th>
                  <th>UTR / Rail</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientLinks.map(link => (
                  <tr key={link.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '12.5px', fontFamily: 'monospace' }}>{link.linkNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Created: {link.createdAt.split('T')[0]}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{link.clientName}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{link.clientPhone}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{link.projectName}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>{link.milestoneDescription}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                        {formatCurrency(link.amount)}
                      </div>
                    </td>
                    <td>
                      {link.status === 'Paid' ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={11} /> PAID (CREDITED)
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} /> ISSUED (AWAITING PAY)
                        </span>
                      )}
                    </td>
                    <td>
                      {link.status === 'Paid' ? (
                        <div>
                          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#2563eb' }}>{link.paymentMethod}</span>
                          <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{link.utrNumber?.slice(-8)}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {link.status === 'Issued' ? (
                          <button
                            onClick={() => handleSimulateClientPay(link)}
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Zap size={11} /> Simulate Pay
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`Client Payment Receipt for ${link.clientName} (${formatCurrency(link.amount)}) • Bank Ref: ${link.utrNumber}`)}
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Receipt size={11} /> Receipt
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(link.shortUrl);
                            alert(`Copied client payment link: ${link.shortUrl}`);
                          }}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Copy Link"
                        >
                          <Share2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 5: BENEFICIARIES & PENNY DROP VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'beneficiaries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Action Bar */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
                Verified Beneficiary Account Directory
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Bank accounts validated via automated NPCI Penny-Drop API before payout dispatch. 2-Hour security cooling periods tracked.
              </p>
            </div>

            <button
              onClick={() => {
                setPennyDropResult({ status: 'idle' });
                setShowPennyDropModal(true);
              }}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserCheck size={14} /> Verify Account via Penny Drop (₹1.00)
            </button>
          </div>

          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Beneficiary Name</th>
                    <th>Category</th>
                    <th>Bank Name</th>
                    <th>Account Number</th>
                    <th>IFSC Code</th>
                    <th>UPI VPA</th>
                    <th>Cooling Status</th>
                    <th>Penny Drop Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 30).map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{r.recipientName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.designationOrTrade}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#0f172a' }}>{r.type}</span>
                      </td>
                      <td>{r.bankName}</td>
                      <td style={{ fontFamily: 'monospace' }}>••••{r.bankAccount.slice(-4)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.ifsc}</td>
                      <td style={{ fontSize: '12px', color: '#2563eb' }}>{r.upiId || '—'}</td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#047857' }}>Cooldown Cleared</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={11} /> 100% NAME MATCH
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 6: STATUTORY TAX & COMPLIANCE (TDS 194C / 192 / PF / ESIC) */}
      {/* ========================================================================= */}
      {activeTab === 'statutory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={20} color="#059669" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                  Statutory Tax Deductions & Treasury Compliance Hub
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Automated TDS withholding under Section 194C (Contractors), Section 192 (Salaries), and EPFO / ESIC monthly challan reconciliation.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => alert('Generated Form 16A TDS Certificates for Q2 FY 2026-27')}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                Download Form 16A (ZIP)
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Statutory Section</th>
                  <th>Challan / Filing Ref</th>
                  <th>Tax Period</th>
                  <th>Deductees Count</th>
                  <th>Total Tax Remittance</th>
                  <th>BSR / Treasury Code</th>
                  <th>Filing Status</th>
                  <th style={{ textAlign: 'right' }}>Direct Treasury Action</th>
                </tr>
              </thead>
              <tbody>
                {challans.map(ch => (
                  <tr key={ch.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{ch.section}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>{ch.challanNumber}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px' }}>{ch.period}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', fontWeight: 700 }}>{ch.deducteeCount} Accounts</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>
                        {formatCurrency(ch.totalTaxAmount)}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{ch.bsrCode || 'EPFO-CENTRAL'}</span>
                    </td>
                    <td>
                      {ch.status === 'Deposited to Treasury' ? (
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={11} /> DEPOSITED TO GOVT
                          </span>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                            Ack: {ch.ackNumber?.slice(-8)}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} /> READY FOR REMITTANCE
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {ch.status === 'Ready for Direct Debit' ? (
                        <button
                          onClick={() => handleDepositChallan(ch)}
                          className="btn-primary"
                          style={{ padding: '5px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Zap size={11} /> Direct Treasury Debit
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Treasury Challan Receipt: ${ch.challanNumber}\nAck: ${ch.ackNumber}\nAmount: ${formatCurrency(ch.totalTaxAmount)}`)}
                          className="btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '11.5px' }}
                        >
                          Challan Slip
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 7: BANK UTR & STATEMENTS LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
                RBI Bank Reference (UTR) & Ledger Trail
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Immutable debits & credits with unique bank transaction IDs, fees, and clearing confirmation
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => alert('Exported MT940 Bank Statement for Corporate ERP ERP-SAP Reconciliation')}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Download size={13} /> Export MT940
              </button>
              <button
                onClick={() => alert('Exported Payout Settlement Statement (CSV) for FY 2026-27')}
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Download size={13} /> Export CSV Ledger
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Bank UTR Reference</th>
                    <th>Beneficiary / Counterparty</th>
                    <th>Payment Rail</th>
                    <th>Gross / Net Disbursed</th>
                    <th>Fee + GST</th>
                    <th>Clearing Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.filter(r => r.status === 'Disbursed').map(r => (
                    <tr key={r.id}>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {r.disbursedAt ? new Date(r.disbursedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '18:45:00'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                        {r.utrNumber || 'UTR94820194821'}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{r.recipientName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>({r.type})</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#2563eb' }}>
                          {r.paymentRail}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '13px' }}>
                        {formatCurrency(r.netPayout)}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        ₹{r.gatewayFee.toFixed(2)}
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 7px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                          SETTLED (200 OK)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 8: VIRTUAL ACCOUNTS & MULTI-POOL ESCROW */}
      {/* ========================================================================= */}
      {activeTab === 'escrow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Virtual Pools Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {escrowPools.map(pool => (
              <div key={pool.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {pool.poolType}
                    </span>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '2px 0 0 0' }}>{pool.name}</h4>
                  </div>
                  <Landmark size={18} color="#2563eb" />
                </div>

                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px 0' }}>
                  {formatCurrency(pool.balance)}
                </div>
                <div style={{ fontSize: '11.5px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  A/C: {pool.accountNumber}
                </div>

                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span>Auto-Sweep:</span>
                  <span style={{ fontWeight: 700, color: pool.autoSweepEnabled ? '#059669' : 'var(--text-muted)' }}>
                    {pool.autoSweepEnabled ? 'ACTIVE (Min ₹5L)' : 'MANUAL'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 16px 0' }}>
                Primary Virtual Escrow Funding Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>Beneficiary Entity Name:</span>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginTop: '2px' }}>
                    {gateway.accountHolder}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>Virtual Account Number:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '14px', marginTop: '2px' }}>
                      {gateway.accountNumber}
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>Bank IFSC:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '14px', marginTop: '2px' }}>
                      ICIC0000104
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>Bank Name & Branch:</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>
                    ICICI Bank Limited, Corporate Banking Branch, Mumbai
                  </div>
                </div>

                <button
                  onClick={() => setShowTopupModal(true)}
                  className="btn-primary"
                  style={{ padding: '10px', marginTop: '8px' }}
                >
                  + Fund Virtual Account via Corporate NetBanking
                </button>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 16px 0' }}>
                Daily Velocity Limits & Security Controls
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Daily Disbursal Limit:</span>
                    <b>{formatCurrency(gateway.dailyLimit)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Utilized Today:</span>
                    <b style={{ color: '#059669' }}>{formatCurrency(gateway.usedToday)}</b>
                  </div>
                  <div className="progress-bar" style={{ height: '7px' }}>
                    <div className="progress-bar-fill green" style={{ width: `${(gateway.usedToday / gateway.dailyLimit) * 100}%` }} />
                  </div>
                </div>

                <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} /> Maker-Checker Dual Control Active
                  </div>
                  <p style={{ fontSize: '12px', color: '#047857', margin: '4px 0 0 0' }}>
                    All batch releases and payouts exceeding ₹50,000 require 2FA OTP verification from Managing Director before clearing.
                  </p>
                </div>

                <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '13px' }}>
                    Automatic Failover Routing Engine
                  </div>
                  <p style={{ fontSize: '12px', color: '#1e40af', margin: '4px 0 0 0' }}>
                    If primary ICICI direct nodal experiences temporary latency &gt; 3.0s, the engine seamlessly diverts transactions to RazorpayX Core with zero packet loss.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 9: SMART ROUTING & DEVELOPER HUB (API & WEBHOOKS) */}
      {/* ========================================================================= */}
      {activeTab === 'developer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 16px 0' }}>
              REST API Credentials & Webhook Endpoints
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', fontSize: '13px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Live Production Key ID</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    readOnly
                    className="form-input"
                    value="rzp_live_89a194bc81f"
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('rzp_live_89a194bc81f');
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="btn-secondary"
                    style={{ padding: '0 12px' }}
                  >
                    {copiedKey ? 'Copied!' : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Webhook Endpoint</label>
                <input
                  readOnly
                  className="form-input"
                  value={gateway.webhookUrl}
                  style={{ fontFamily: 'monospace', fontSize: '12.5px', color: '#2563eb' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>Subscribed Webhook Events:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['payout.processed', 'payout.failed', 'payout.reversed', 'payment.captured', 'beneficiary.verified'].map(evt => (
                    <span key={evt} style={{ fontSize: '11px', fontFamily: 'monospace', background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {evt}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleFireTestWebhook}
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Send size={13} /> Test Webhook Ping
              </button>
            </div>
          </div>

          {/* Live Webhook Inspection Payload */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={16} /> Real-Time Webhook Delivery Payload Inspector
              </h4>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                {webhookStatus === 'transmitting' ? 'TRANSMITTING...' : 'HTTP 200 OK'}
              </span>
            </div>

            <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: '16px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', fontFamily: 'monospace', lineHeight: '1.4' }}>
{`{
  "event": "${testWebhookEvent}",
  "created_at": 1790938472,
  "payload": {
    "payout": {
      "id": "pout_live_94821094821",
      "entity": "payout",
      "amount": 29760000,
      "currency": "INR",
      "status": "processed",
      "purpose": "contractor_milestone",
      "utr": "UTR202610029837194",
      "mode": "IMPS",
      "beneficiary_details": {
        "name": "Mahesh Kumar (Sharma Woodworks)",
        "account_number": "••••84910294",
        "ifsc": "HDFC0001234"
      },
      "tax_withholding": {
        "section": "194C",
        "tds_amount": 6400,
        "retention_reserve": 16000
      }
    }
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 10: SECURITY, IP WHITELIST & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
                Fintech Security & Static IP Whitelisting
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                PCI-DSS Level 1 Compliant infrastructure with biometric 2FA enforcement and IP restrictions.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                Static IP Whitelisted: 103.21.54.12/32
              </span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / Operator</th>
                  <th>Action Executed</th>
                  <th>Entity Type</th>
                  <th>Reference ID</th>
                  <th>Audit Trail Description</th>
                </tr>
              </thead>
              <tbody>
                {state.auditLog.slice(0, 15).map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '14:30:00'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '12.5px' }}>{log.userName}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{log.action}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{log.entityType}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.entityId}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.details}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BATCH PAYOUT WIZARD */}
      {/* ========================================================================= */}
      {showBatchModal && (
        <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#2563eb" />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                    Execute Batch Payout via Gateway
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Direct host-to-host settlement simulation via {gateway.provider}
                </p>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {batchStep === 'preview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Select Payout Batch</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { id: 'all_pending', label: 'All Pending Payouts' },
                      { id: 'staff', label: '26 Office Staff Salaries' },
                      { id: 'labour', label: 'Site Labour Wages' },
                      { id: 'contractors', label: 'Contractor Milestones' },
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setBatchTargetGroup(g.id as any)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: batchTargetGroup === g.id ? '#0f172a' : '#f8fafc',
                          color: batchTargetGroup === g.id ? '#ffffff' : 'var(--text-primary)',
                          border: batchTargetGroup === g.id ? '1px solid #0f172a' : '1px solid var(--border-color)',
                          textAlign: 'left',
                        }}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Select Settlement Rail</label>
                  <select
                    className="form-select"
                    value={batchRail}
                    onChange={e => setBatchRail(e.target.value as any)}
                  >
                    <option value="Instant UPI">⚡ Instant UPI Auto-Disburse (24x7 Real-time)</option>
                    <option value="IMPS Direct">🏦 IMPS Direct to Bank Account (Instant Settlement)</option>
                    <option value="NEFT Batch">📑 Corporate NEFT Batch Transfer (Hourly Cycles)</option>
                  </select>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Payout Authorization Summary
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span>Beneficiary Accounts:</span>
                    <b>{targetPendingRecords.length} recipients</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span>Total Net Bank Outflow:</span>
                    <b style={{ color: '#0f172a', fontSize: '15px' }}>{formatCurrency(targetBatchNetTotal)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span>Remaining Escrow Balance:</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>{formatCurrency(gateway.balance - targetBatchNetTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Estimated Settlement Latency:</span>
                    <b>2.4 Seconds</b>
                  </div>
                </div>

                {targetPendingRecords.length === 0 ? (
                  <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a', color: '#b45309', fontSize: '12.5px' }}>
                    All records in this group are already disbursed! You can click "Reset Demo States" on top to test again.
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setShowBatchModal(false)}
                      className="btn-secondary"
                      style={{ padding: '8px 16px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteBatch}
                      className="btn-primary"
                      style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Lock size={14} /> Authorize & Release Payouts
                    </button>
                  </div>
                )}
              </div>
            )}

            {(batchStep === 'authenticating' || batchStep === 'processing') && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <RefreshCw size={24} color="#2563eb" className="animate-spin" />
                </div>

                <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0' }}>
                  {batchStep === 'authenticating' ? 'Verifying 2FA & Bank Credentials...' : 'Transmitting Payout Batches to Banking Core...'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Connecting host-to-host to ICICI & RazorpayX Payouts Engine • Generating unique bank UTRs
                </p>

                <div className="progress-bar" style={{ height: '8px', maxWidth: '380px', margin: '0 auto 12px auto' }}>
                  <div className="progress-bar-fill green" style={{ width: `${processingProgress}%`, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                  {processingProgress}% Processed
                </div>
              </div>
            )}

            {batchStep === 'completed' && (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <CheckCircle2 size={30} color="#059669" />
                </div>

                <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: '#059669' }}>
                  Payout Batch Successfully Disbursed!
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  <b>{formatCurrency(targetBatchNetTotal)}</b> has been credited across {targetPendingRecords.length} accounts with verified RBI UTR reference numbers.
                </p>

                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px' }}
                >
                  Done & View Updated Records
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MAKER-CHECKER 2FA SIGNOFF MODAL */}
      {/* ========================================================================= */}
      {selectedApproval && (
        <div className="modal-overlay" onClick={() => setSelectedApproval(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Maker-Checker Authorization</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Second-level signoff required for disbursement release
                </p>
              </div>
              <button onClick={() => setSelectedApproval(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '6px' }}>{selectedApproval.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Prepared By (Maker):</span>
                <b>{selectedApproval.makerName} ({selectedApproval.makerRole})</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Beneficiaries:</span>
                <b>{selectedApproval.beneficiaryCount} Accounts</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
                <span style={{ fontWeight: 700 }}>Total Disbursement Outflow:</span>
                <b style={{ fontSize: '16px', color: '#2563eb' }}>{formatCurrency(selectedApproval.totalAmount)}</b>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Enter 6-Digit 2FA Token / OTP</label>
              <input
                className="form-input"
                value={otpToken}
                onChange={e => setOtpToken(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '18px', letterSpacing: '4px', textAlign: 'center' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
                Simulated corporate hardware token: 482019
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="btn-secondary"
                style={{ padding: '8px 14px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAuthorizing}
                onClick={() => handleCheckerAuthorize(selectedApproval)}
                className="btn-primary"
                style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isAuthorizing ? <RefreshCw size={13} className="animate-spin" /> : <Lock size={13} />}
                Confirm & Release via Banking Rail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE CLIENT PAYMENT LINK */}
      {/* ========================================================================= */}
      {showCreateLinkModal && (
        <div className="modal-overlay" onClick={() => setShowCreateLinkModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Create Client Milestone Payment Link</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Issues dynamic UPI QR & payment link to interior homeowner/client
                </p>
              </div>
              <button onClick={() => setShowCreateLinkModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>

            <form onSubmit={handleCreatePaymentLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Client Full Name *</label>
                <input
                  required
                  className="form-input"
                  placeholder="e.g. Mr. Vikram Mehta"
                  value={createLinkForm.clientName}
                  onChange={e => setCreateLinkForm({ ...createLinkForm, clientName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Mobile Number (SMS/WhatsApp) *</label>
                  <input
                    required
                    className="form-input"
                    placeholder="+91 98201 44821"
                    value={createLinkForm.clientPhone}
                    onChange={e => setCreateLinkForm({ ...createLinkForm, clientPhone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Milestone Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    placeholder="500000"
                    value={createLinkForm.amount}
                    onChange={e => setCreateLinkForm({ ...createLinkForm, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Project Name *</label>
                <select
                  className="form-select"
                  value={createLinkForm.projectName}
                  onChange={e => setCreateLinkForm({ ...createLinkForm, projectName: e.target.value })}
                >
                  {state.projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Milestone Description *</label>
                <input
                  required
                  className="form-input"
                  placeholder="e.g. Milestone 2: Modular Kitchen Advance (40%)"
                  value={createLinkForm.milestoneDescription}
                  onChange={e => setCreateLinkForm({ ...createLinkForm, milestoneDescription: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCreateLinkModal(false)} className="btn-secondary" style={{ padding: '8px 14px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }}>Generate Link & QR ⚡</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: QUICK SINGLE PAYOUT */}
      {/* ========================================================================= */}
      {showQuickPayoutModal && (
        <div className="modal-overlay" onClick={() => setShowQuickPayoutModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Instant Quick Payout</h3>
              <button onClick={() => setShowQuickPayoutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>

            <form onSubmit={handleQuickPayoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Beneficiary Name *</label>
                <input
                  required
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={quickPayoutForm.recipientName}
                  onChange={e => setQuickPayoutForm({ ...quickPayoutForm, recipientName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Settlement Rail</label>
                  <select
                    className="form-select"
                    value={quickPayoutForm.rail}
                    onChange={e => setQuickPayoutForm({ ...quickPayoutForm, rail: e.target.value })}
                  >
                    <option value="Instant UPI">Instant UPI</option>
                    <option value="IMPS Direct">IMPS Direct</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    placeholder="5000"
                    value={quickPayoutForm.amount}
                    onChange={e => setQuickPayoutForm({ ...quickPayoutForm, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>UPI ID or Bank Account *</label>
                <input
                  required
                  className="form-input"
                  placeholder="ramesh@upi or 50200019283910"
                  value={quickPayoutForm.upiId}
                  onChange={e => setQuickPayoutForm({ ...quickPayoutForm, upiId: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowQuickPayoutModal(false)} className="btn-secondary" style={{ padding: '8px 14px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }}>Send Payout ⚡</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PENNY DROP ACCOUNT VERIFICATION TOOL */}
      {/* ========================================================================= */}
      {showPennyDropModal && (
        <div className="modal-overlay" onClick={() => setShowPennyDropModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Penny-Drop Account Verification</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Sends ₹1.00 via NPCI to verify account holder name from destination bank
                </p>
              </div>
              <button onClick={() => setShowPennyDropModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>

            <form onSubmit={handlePennyDropVerify} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Beneficiary Name (As per records) *</label>
                <input
                  required
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={pennyDropForm.accountHolder}
                  onChange={e => setPennyDropForm({ ...pennyDropForm, accountHolder: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Account Number *</label>
                  <input
                    required
                    className="form-input"
                    placeholder="50200084910294"
                    value={pennyDropForm.accountNumber}
                    onChange={e => setPennyDropForm({ ...pennyDropForm, accountNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Bank IFSC *</label>
                  <input
                    required
                    className="form-input"
                    value={pennyDropForm.ifsc}
                    onChange={e => setPennyDropForm({ ...pennyDropForm, ifsc: e.target.value })}
                  />
                </div>
              </div>

              {pennyDropResult.status === 'verifying' && (
                <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: '#1d4ed8' }}>
                  Contacting Destination Bank Core via NPCI...
                </div>
              )}

              {pennyDropResult.status === 'success' && (
                <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle2 size={14} /> BANK ACCOUNT VERIFIED & ACTIVE
                  </div>
                  <div style={{ fontSize: '13px', color: '#065f46', marginTop: '4px' }}>
                    Registered Bank Name: <b>{pennyDropResult.nameAtBank}</b>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                    NPCI UTR: {pennyDropResult.utr} (Name Match: 100%)
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowPennyDropModal(false)} className="btn-secondary" style={{ padding: '8px 14px' }}>Close</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }}>Send ₹1.00 Penny Drop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DIGITAL SALARY SLIP / PAYMENT VOUCHER */}
      {/* ========================================================================= */}
      {selectedPayslip && (
        <div className="modal-overlay" onClick={() => setSelectedPayslip(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  SINGHANIA INTERIORS & ARCHITECTURE PVT LTD
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0' }}>
                  Digital Salary & Payout Advice
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cycle: {selectedPayslip.cycle} • Voucher No: {selectedPayslip.batchNumber}
                </div>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px', fontSize: '12.5px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Beneficiary Name:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPayslip.recipientName}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Designation / Role:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPayslip.designationOrTrade}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Bank & Account:</span>
                <div style={{ fontWeight: 600 }}>{selectedPayslip.bankName} (••••{selectedPayslip.bankAccount.slice(-4)})</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Bank IFSC:</span>
                <div style={{ fontWeight: 600 }}>{selectedPayslip.ifsc}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Earnings
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                  <span>Base Amount:</span>
                  <span>{formatCurrency(selectedPayslip.baseAmount)}</span>
                </div>
                {selectedPayslip.overtimeAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span>Overtime Allowance:</span>
                    <span>+{formatCurrency(selectedPayslip.overtimeAmount)}</span>
                  </div>
                )}
                {selectedPayslip.incentiveBonus > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span>Incentive / Bonus:</span>
                    <span>+{formatCurrency(selectedPayslip.incentiveBonus)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
                  <span>Gross Earnings:</span>
                  <span>{formatCurrency(selectedPayslip.grossAmount)}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Deductions
                </div>
                {selectedPayslip.pfDeduction > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span>Provident Fund (PF):</span>
                    <span>-{formatCurrency(selectedPayslip.pfDeduction)}</span>
                  </div>
                )}
                {selectedPayslip.tdsDeduction > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span>TDS (Income Tax / 194C):</span>
                    <span>-{formatCurrency(selectedPayslip.tdsDeduction)}</span>
                  </div>
                )}
                {selectedPayslip.advanceDeduction > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span>Advance / Retention:</span>
                    <span>-{formatCurrency(selectedPayslip.advanceDeduction)}</span>
                  </div>
                )}
                {selectedPayslip.totalDeductions === 0 && (
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>No deductions</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
                  <span>Total Deductions:</span>
                  <span style={{ color: '#dc2626' }}>-{formatCurrency(selectedPayslip.totalDeductions)}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 16px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Net Amount Credited to Bank</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                  {formatCurrency(selectedPayslip.netPayout)}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#065f46' }}>
                <div>Rail: <b>{selectedPayslip.paymentRail}</b></div>
                <div>Status: <b>SUCCESS</b></div>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bank Reference UTR:</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{selectedPayslip.utrNumber || 'UTR20260930819284'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                <span>Verified Gateway:</span>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>{selectedPayslip.gatewayProvider} Core Settlement</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setSelectedPayslip(null)} className="btn-secondary" style={{ padding: '8px 16px' }}>Close</button>
              <button type="button" onClick={() => alert(`Downloaded Official Payment Slip for ${selectedPayslip.recipientName}`)} className="btn-primary" style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Download PDF Advice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: TOPUP ESCROW */}
      {/* ========================================================================= */}
      {showTopupModal && (
        <div className="modal-overlay" onClick={() => setShowTopupModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0' }}>
              Fund Payment Gateway Escrow
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Top up your virtual account via Corporate NetBanking or Auto-Sweep
            </p>

            <form onSubmit={handleTopupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Top-up Amount (₹) *</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                />
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                <div>Funding Source: <b>HDFC Corporate Current A/C (••••8371)</b></div>
                <div style={{ marginTop: '4px' }}>Beneficiary Virtual Account: <b>{gateway.accountNumber}</b></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowTopupModal(false)} className="btn-secondary" style={{ padding: '8px 14px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }}>Complete Instant Top-up</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
