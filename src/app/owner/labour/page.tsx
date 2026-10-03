'use client';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  MapPin,
  Clock,
  Briefcase,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Filter,
  ArrowRight,
  TrendingUp,
  Download,
  ShieldCheck,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, getStatusBg } from '@/lib/utils';
import { Worker, WorkerTrade } from '@/lib/types';

function LabourPageContent() {
  const { state, dispatch } = useStore();
  const searchParams = useSearchParams();
  const initialSiteParam = searchParams.get('site');

  // View state: 'sites' | 'roster' | 'contractors'
  const [viewMode, setViewMode] = useState<'sites' | 'roster' | 'contractors'>('sites');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteParam || 'all');
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');

  // Modals
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [reassignWorker, setReassignWorker] = useState<Worker | null>(null);
  const [reassignTargetSiteId, setReassignTargetSiteId] = useState('');

  // Form state for adding worker
  const [newWorker, setNewWorker] = useState({
    name: '',
    phone: '',
    trade: 'Carpenter' as WorkerTrade,
    assignedSiteId: state.sites[0]?.id || 'site-1',
    thekedarId: state.users.find(u => u.role === 'thekedar')?.id || 'user-thekedar-1',
    dailyWage: 850,
  });

  const tradesList: WorkerTrade[] = [
    'Carpenter',
    'Electrician',
    'Plumber',
    'Painter',
    'Mason',
    'Helper',
    'POP / False Ceiling',
    'Furniture Installer',
    'Other',
  ];

  // Helper to determine simulated attendance today for realism
  const getWorkerAttendance = (workerId: string, idx: number) => {
    // 94% attendance simulation
    const seed = (workerId.charCodeAt(workerId.length - 1) + idx) % 20;
    if (seed === 0) return { status: 'Absent', hours: 0, ot: 0 };
    if (seed === 1) return { status: 'Half Day', hours: 4, ot: 0 };
    if (seed > 15) return { status: 'Present', hours: 8, ot: 2 };
    return { status: 'Present', hours: 8, ot: 0 };
  };

  // Site-Wise Data Aggregation
  const siteWiseData = useMemo(() => {
    return state.sites.map(site => {
      const siteWorkers = state.workers.filter(w => w.assignedSiteId === site.id);
      const project = state.projects.find(p => p.id === site.projectId);
      const thekedar = state.users.find(u => u.id === site.thekedarId);
      const subAdmin = state.users.find(u => u.id === site.subAdminId);

      // Trade distribution
      const tradeCount: Record<string, number> = {};
      siteWorkers.forEach(w => {
        tradeCount[w.trade] = (tradeCount[w.trade] || 0) + 1;
      });

      // Attendance calculations
      let present = 0;
      let absent = 0;
      let overtime = 0;
      let dailyCost = 0;

      siteWorkers.forEach((w, idx) => {
        const att = getWorkerAttendance(w.id, idx);
        if (att.status === 'Present') present++;
        else if (att.status === 'Half Day') {
          present++;
        } else {
          absent++;
        }
        overtime += att.ot;
        dailyCost += w.dailyWage + (att.ot * (w.dailyWage / 8) * 1.5);
      });

      const totalWorkers = siteWorkers.length;
      const turnoutRate = totalWorkers > 0 ? ((present / totalWorkers) * 100).toFixed(0) : '0';

      return {
        site,
        project,
        thekedar,
        subAdmin,
        siteWorkers,
        tradeCount,
        totalWorkers,
        present,
        absent,
        overtime,
        dailyCost,
        turnoutRate,
      };
    });
  }, [state.sites, state.workers, state.projects, state.users]);

  // Overall KPIs
  const totalRegistered = state.workers.length;
  const totalDailyCost = siteWiseData.reduce((acc, curr) => acc + curr.dailyCost, 0);
  const totalPresentToday = siteWiseData.reduce((acc, curr) => acc + curr.present, 0);
  const totalOTHours = siteWiseData.reduce((acc, curr) => acc + curr.overtime, 0);
  const overallTurnout = totalRegistered > 0 ? ((totalPresentToday / totalRegistered) * 100).toFixed(1) : '0';

  // Filtered workers for Master Roster
  const filteredWorkers = useMemo(() => {
    return state.workers.filter(w => {
      const matchSearch =
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.workerId.toLowerCase().includes(search.toLowerCase()) ||
        w.phone.includes(search);

      const matchTrade = tradeFilter === 'All' || w.trade === tradeFilter;
      const matchSite = siteFilter === 'All' || w.assignedSiteId === siteFilter;

      return matchSearch && matchTrade && matchSite;
    });
  }, [state.workers, search, tradeFilter, siteFilter]);

  // Handle Add Worker
  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.phone) return;

    const newId = `worker-${Date.now()}`;
    const newWorkerId = `WRK-${String(state.workers.length + 1).padStart(4, '0')}`;

    const created: Worker = {
      id: newId,
      name: newWorker.name,
      phone: newWorker.phone,
      workerId: newWorkerId,
      trade: newWorker.trade,
      thekedarId: newWorker.thekedarId,
      assignedSiteId: newWorker.assignedSiteId,
      dailyWage: Number(newWorker.dailyWage) || 850,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_WORKER', payload: created });

    const siteObj = state.sites.find(s => s.id === newWorker.assignedSiteId);
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        id: `audit-${Date.now()}`,
        userId: 'user-owner-1',
        userName: 'Rajesh Singhania',
        action: 'Onboarded Worker',
        entityType: 'Labour',
        entityId: newId,
        details: `Registered ${created.name} (${created.trade}) assigned to ${siteObj?.name || 'Site'}`,
        createdAt: new Date().toISOString(),
      },
    });

    setShowAddWorkerModal(false);
    setNewWorker({
      name: '',
      phone: '',
      trade: 'Carpenter',
      assignedSiteId: state.sites[0]?.id || 'site-1',
      thekedarId: state.users.find(u => u.role === 'thekedar')?.id || 'user-thekedar-1',
      dailyWage: 850,
    });
  };

  // Handle Reassign
  const handleReassignSubmit = () => {
    if (!reassignWorker || !reassignTargetSiteId) return;

    dispatch({
      type: 'UPDATE_WORKER',
      payload: {
        id: reassignWorker.id,
        changes: { assignedSiteId: reassignTargetSiteId },
      },
    });

    const targetSite = state.sites.find(s => s.id === reassignTargetSiteId);
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        id: `audit-${Date.now()}`,
        userId: 'user-owner-1',
        userName: 'Rajesh Singhania',
        action: 'Reassigned Worker',
        entityType: 'Labour',
        entityId: reassignWorker.id,
        details: `Transferred ${reassignWorker.name} to site: ${targetSite?.name}`,
        createdAt: new Date().toISOString(),
      },
    });

    setReassignWorker(null);
  };

  // Contractor-wise aggregation
  const contractorWiseData = useMemo(() => {
    const contractors = state.users.filter(u => u.role === 'thekedar');
    return contractors.map(c => {
      const assignedWorkers = state.workers.filter(w => w.thekedarId === c.id);
      const siteIds = Array.from(new Set(assignedWorkers.map(w => w.assignedSiteId)));
      const sites = state.sites.filter(s => siteIds.includes(s.id));
      const dailySpend = assignedWorkers.reduce((acc, curr) => acc + curr.dailyWage, 0);

      return {
        contractor: c,
        workers: assignedWorkers,
        sites,
        dailySpend,
      };
    });
  }, [state.users, state.workers, state.sites]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Labour & Workforce Operations
            </h1>
            <span style={{ fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              LIVE SITE FORCE
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Site-wise deployment, trade distribution, attendance verification, and daily wage tracking across {state.sites.length} interior projects
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="/gateway"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            💳 Open Payout Gateway (New Tab) ↗
          </a>
          <button
            onClick={() => setShowAddWorkerModal(true)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> Add New Worker
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="kpi-card purple" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Registered Workers
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {totalRegistered} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>personnel</span>
          </div>
          <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600, marginTop: '4px' }}>
            {state.sites.length} Active Sites Covered
          </div>
        </div>

        <div className="kpi-card green" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Today's Turnout (Live)
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {totalPresentToday} <span style={{ fontSize: '13px', fontWeight: 600, color: '#047857' }}>on site ({overallTurnout}%)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600, marginTop: '4px' }}>
            {totalRegistered - totalPresentToday} reported absent today
          </div>
        </div>

        <div className="kpi-card amber" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Overtime Logged Today
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
            {totalOTHours} <span style={{ fontSize: '13px', fontWeight: 600, color: '#b45309' }}>hours</span>
          </div>
          <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 600, marginTop: '4px' }}>
            Across evening finishing shifts
          </div>
        </div>

        <div className="kpi-card blue" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Daily Labour Burn
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
            {formatCurrency(totalDailyCost)} <span style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8' }}>/ day</span>
          </div>
          <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600, marginTop: '4px' }}>
            Avg ₹{Math.round(totalDailyCost / Math.max(1, totalRegistered))} per worker
          </div>
        </div>
      </div>

      {/* Primary View Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setViewMode('sites'); setSelectedSiteId('all'); }}
            style={{
              padding: '9px 18px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              background: viewMode === 'sites' ? '#0f172a' : '#ffffff',
              color: viewMode === 'sites' ? '#ffffff' : 'var(--text-secondary)',
              border: viewMode === 'sites' ? '1px solid #0f172a' : '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={16} /> 🏢 Site-Wise Deployment ({state.sites.length} Sites)
          </button>

          <button
            onClick={() => setViewMode('roster')}
            style={{
              padding: '9px 18px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              background: viewMode === 'roster' ? '#0f172a' : '#ffffff',
              color: viewMode === 'roster' ? '#ffffff' : 'var(--text-secondary)',
              border: viewMode === 'roster' ? '1px solid #0f172a' : '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={16} /> 📋 Master Worker Roster ({state.workers.length})
          </button>

          <button
            onClick={() => setViewMode('contractors')}
            style={{
              padding: '9px 18px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              background: viewMode === 'contractors' ? '#0f172a' : '#ffffff',
              color: viewMode === 'contractors' ? '#ffffff' : 'var(--text-secondary)',
              border: viewMode === 'contractors' ? '1px solid #0f172a' : '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s ease',
            }}
          >
            <Briefcase size={16} /> 🏗️ Contractor / Thekedar Wise ({contractorWiseData.length})
          </button>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Tip: Select any site pill to isolate that site's entire labour force.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SITE-WISE LABOUR DEPLOYMENT (PRIMARY REQUEST) */}
      {/* ========================================================================= */}
      {viewMode === 'sites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Site Selector Pill Bar */}
          <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '6px', whiteSpace: 'nowrap' }}>
              Select Site:
            </span>

            <button
              onClick={() => setSelectedSiteId('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: selectedSiteId === 'all' ? '#0f172a' : '#f8fafc',
                color: selectedSiteId === 'all' ? '#ffffff' : 'var(--text-secondary)',
                border: selectedSiteId === 'all' ? '1px solid #0f172a' : '1px solid var(--border-color)',
                transition: 'all 0.15s ease',
              }}
            >
              🏢 All 8 Sites ({totalRegistered} Labourers)
            </button>

            {siteWiseData.map(({ site, totalWorkers }) => {
              const isSelected = selectedSiteId === site.id;
              return (
                <button
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: isSelected ? '#0f172a' : '#ffffff',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid #0f172a' : '1px solid var(--border-color)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {site.name} <span style={{ opacity: 0.75, fontSize: '11px', marginLeft: '4px' }}>({totalWorkers})</span>
                </button>
              );
            })}
          </div>

          {/* If ALL SITES is selected: Show Overview Cards + Comparison Table */}
          {selectedSiteId === 'all' ? (
            <>
              {/* Site Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                {siteWiseData.map(({ site, project, thekedar, subAdmin, siteWorkers, totalWorkers, present, absent, overtime, dailyCost, turnoutRate, tradeCount }) => (
                  <div
                    key={site.id}
                    className="glass-card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: '4px solid #0f172a',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div>
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                              {site.name}
                            </h3>
                            <span className={`status-badge ${getStatusBg(site.status)}`} style={{ fontSize: '11px' }}>
                              {site.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <MapPin size={12} /> {site.address}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedSiteId(site.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            cursor: 'pointer',
                          }}
                        >
                          Inspect →
                        </button>
                      </div>

                      {/* Contractor and Manager */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px', fontSize: '12px' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Lead Thekedar:</span>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '1px' }}>
                            {thekedar?.agencyName || thekedar?.name || 'Contractor'}
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Site Manager:</span>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '1px' }}>
                            {subAdmin?.name || 'Assigned'}
                          </div>
                        </div>
                      </div>

                      {/* Labour Attendance & Burn Numbers */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px', textAlign: 'center' }}>
                        <div style={{ padding: '8px 4px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{totalWorkers}</div>
                        </div>
                        <div style={{ padding: '8px 4px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Present</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{present}</div>
                        </div>
                        <div style={{ padding: '8px 4px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>Absent</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>{absent}</div>
                        </div>
                        <div style={{ padding: '8px 4px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Daily ₹</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                            {formatCurrency(dailyCost).replace('₹', '')}
                          </div>
                        </div>
                      </div>

                      {/* Trade Breakdown Chips */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Trades Active On Site:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {Object.entries(tradeCount).map(([trade, count]) => (
                            <span
                              key={trade}
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                background: '#f1f5f9',
                                color: 'var(--text-secondary)',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                              }}
                            >
                              {trade}: <b>{count}</b>
                            </span>
                          ))}
                          {Object.keys(tradeCount).length === 0 && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No workers allocated</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Action footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                        {turnoutRate}% Present Today
                      </span>

                      <button
                        onClick={() => setSelectedSiteId(site.id)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Users size={13} /> View {totalWorkers} Workers →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comprehensive Cross-Site Labour Matrix */}
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                      Site-Wise Labour Distribution Matrix
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Direct comparison of headcount, turnout rate, overtime, and daily wage outflow by project site
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Project Site</th>
                        <th>Location</th>
                        <th>Assigned Thekedar</th>
                        <th>Manager</th>
                        <th style={{ textAlign: 'center' }}>Total Deployed</th>
                        <th style={{ textAlign: 'center' }}>Present Today</th>
                        <th style={{ textAlign: 'center' }}>Turnout</th>
                        <th style={{ textAlign: 'center' }}>Overtime</th>
                        <th>Daily Wage Cost</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siteWiseData.map(({ site, thekedar, subAdmin, totalWorkers, present, absent, overtime, dailyCost, turnoutRate }) => (
                        <tr key={site.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                              {site.name}
                            </div>
                            <span className={`status-badge ${getStatusBg(site.status)}`} style={{ fontSize: '10px', marginTop: '2px', display: 'inline-block' }}>
                              {site.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{site.location}</td>
                          <td>
                            <span style={{ fontWeight: 600, fontSize: '13px' }}>{thekedar?.agencyName || thekedar?.name || 'Contractor'}</span>
                          </td>
                          <td style={{ fontSize: '13px' }}>{subAdmin?.name || 'Site Manager'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{totalWorkers}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#059669', fontSize: '13px' }}>{present}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '12px', background: Number(turnoutRate) > 90 ? '#ecfdf5' : '#fffbeb', color: Number(turnoutRate) > 90 ? '#059669' : '#d97706', padding: '2px 8px', borderRadius: '4px' }}>
                              {turnoutRate}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '12.5px', color: overtime > 0 ? '#b45309' : 'var(--text-muted)' }}>
                            {overtime > 0 ? `${overtime} hrs` : '0 hrs'}
                          </td>
                          <td style={{ fontWeight: 700, fontSize: '13px', color: '#2563eb' }}>
                            {formatCurrency(dailyCost)} / day
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedSiteId(site.id)}
                              className="btn-secondary"
                              style={{ padding: '5px 12px', fontSize: '12px' }}
                            >
                              Inspect Roster →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* DETAILED VIEW FOR SINGLE SELECTED SITE */
            (() => {
              const currentSiteData = siteWiseData.find(d => d.site.id === selectedSiteId);
              if (!currentSiteData) return null;
              const { site, project, thekedar, subAdmin, siteWorkers, totalWorkers, present, absent, overtime, dailyCost, turnoutRate, tradeCount } = currentSiteData;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Site Header Banner */}
                  <div className="glass-card" style={{ padding: '22px', borderLeft: '4px solid #2563eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                            {site.name} — Labour Operations & Roster
                          </h2>
                          <span className={`status-badge ${getStatusBg(site.status)}`}>
                            {site.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {site.address} • Associated Project: <b>{project?.name || site.name}</b> • Manager: <b>{subAdmin?.name || 'Site Manager'}</b>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px', fontWeight: 500 }}>
                          Contractor / Thekedar Agency: <b>{thekedar?.agencyName || thekedar?.name}</b> ({thekedar?.phone})
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedSiteId('all')}
                          className="btn-secondary"
                          style={{ padding: '7px 14px', fontSize: '12.5px' }}
                        >
                          ← Back to All Sites
                        </button>
                        <Link
                          href={`/owner/projects/${site.projectId}`}
                          className="btn-primary"
                          style={{ padding: '7px 14px', fontSize: '12.5px' }}
                        >
                          Site Progress & Tasks →
                        </Link>
                      </div>
                    </div>

                    {/* Quick Metric Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                      <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Labour on Site</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{totalWorkers} workers</div>
                      </div>
                      <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Present Today</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{present} on-duty ({turnoutRate}%)</div>
                      </div>
                      <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>Absent</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>{absent} workers</div>
                      </div>
                      <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Daily Wage Outflow</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>{formatCurrency(dailyCost)} / day</div>
                      </div>
                    </div>

                    {/* Trade Distribution chips for this site */}
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '10px' }}>
                        Trade Composition at {site.name}:
                      </span>
                      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px', verticalAlign: 'middle', marginTop: '4px' }}>
                        {Object.entries(tradeCount).map(([trade, count]) => (
                          <span
                            key={trade}
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 600,
                              background: '#ffffff',
                              color: '#0f172a',
                              padding: '3px 10px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            {trade}: <b>{count}</b>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Workers Table for this Site */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                          Labour Personnel Deployed at {site.name} ({siteWorkers.length} workers)
                        </h3>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Real-time roster, contact, contractor agency, and individual daily wage rates
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setNewWorker(prev => ({ ...prev, assignedSiteId: site.id, thekedarId: site.thekedarId }));
                          setShowAddWorkerModal(true);
                        }}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Plus size={14} /> Add Worker to {site.name}
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Worker ID</th>
                            <th>Full Name</th>
                            <th>Trade / Skill</th>
                            <th>Contractor / Thekedar</th>
                            <th>Daily Wage</th>
                            <th>Today's Attendance</th>
                            <th>Overtime</th>
                            <th>Phone Contact</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {siteWorkers.map((w, idx) => {
                            const att = getWorkerAttendance(w.id, idx);
                            return (
                              <tr key={w.id}>
                                <td style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-muted)' }}>
                                  {w.workerId}
                                </td>
                                <td>
                                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                                    {w.name}
                                  </div>
                                </td>
                                <td>
                                  <span style={{ fontSize: '12px', fontWeight: 600, background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                    {w.trade}
                                  </span>
                                </td>
                                <td style={{ fontSize: '13px' }}>
                                  {thekedar?.agencyName || thekedar?.name || 'Contractor'}
                                </td>
                                <td style={{ fontWeight: 600, fontSize: '13px' }}>
                                  {formatCurrency(w.dailyWage)}
                                </td>
                                <td>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      background: att.status === 'Present' ? '#ecfdf5' : att.status === 'Half Day' ? '#fffbeb' : '#fef2f2',
                                      color: att.status === 'Present' ? '#059669' : att.status === 'Half Day' ? '#d97706' : '#dc2626',
                                      border: `1px solid ${att.status === 'Present' ? '#a7f3d0' : att.status === 'Half Day' ? '#fde68a' : '#fecaca'}`,
                                    }}
                                  >
                                    {att.status}
                                  </span>
                                </td>
                                <td style={{ fontSize: '12.5px', color: att.ot > 0 ? '#b45309' : 'var(--text-muted)', fontWeight: att.ot > 0 ? 600 : 400 }}>
                                  {att.ot > 0 ? `+${att.ot} hrs OT` : 'None'}
                                </td>
                                <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Phone size={12} color="var(--text-muted)" /> {w.phone}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button
                                    onClick={() => {
                                      setReassignWorker(w);
                                      setReassignTargetSiteId(w.assignedSiteId);
                                    }}
                                    className="btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                                  >
                                    Transfer Site
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: MASTER WORKER ROSTER */}
      {/* ========================================================================= */}
      {viewMode === 'roster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '36px', width: '100%' }}
                placeholder="Search by worker name, ID (WRK-0012) or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Site Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Site:</span>
              <select
                className="form-select"
                style={{ width: '190px' }}
                value={siteFilter}
                onChange={e => setSiteFilter(e.target.value)}
              >
                <option value="All">All Sites ({state.sites.length})</option>
                {state.sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Trade Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Trade:</span>
              <select
                className="form-select"
                style={{ width: '160px' }}
                value={tradeFilter}
                onChange={e => setTradeFilter(e.target.value)}
              >
                <option value="All">All Trades</option>
                {tradesList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {(search || tradeFilter !== 'All' || siteFilter !== 'All') && (
              <button
                onClick={() => { setSearch(''); setTradeFilter('All'); setSiteFilter('All'); }}
                className="btn-secondary"
                style={{ padding: '7px 12px', fontSize: '12px' }}
              >
                Reset Filters
              </button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Showing <b>{filteredWorkers.length}</b> of <b>{state.workers.length}</b> workers
            </div>
          </div>

          {/* Roster Table */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker ID</th>
                    <th>Name</th>
                    <th>Trade / Skill</th>
                    <th>Current Assigned Site</th>
                    <th>Thekedar Agency</th>
                    <th>Daily Wage</th>
                    <th>Attendance</th>
                    <th>Contact</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((w, idx) => {
                    const site = state.sites.find(s => s.id === w.assignedSiteId);
                    const thekedar = state.users.find(u => u.id === w.thekedarId);
                    const att = getWorkerAttendance(w.id, idx);

                    return (
                      <tr key={w.id}>
                        <td style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-muted)' }}>{w.workerId}</td>
                        <td style={{ fontWeight: 600, fontSize: '13.5px' }}>{w.name}</td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 600, background: '#f8fafc', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            {w.trade}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => { setViewMode('sites'); setSelectedSiteId(w.assignedSiteId); }}
                            style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Building2 size={11} /> {site?.name || 'Unassigned'}
                          </button>
                        </td>
                        <td style={{ fontSize: '13px' }}>{thekedar?.agencyName || thekedar?.name || 'Assigned'}</td>
                        <td style={{ fontWeight: 600, fontSize: '13px' }}>{formatCurrency(w.dailyWage)}</td>
                        <td>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: att.status === 'Present' ? '#ecfdf5' : att.status === 'Half Day' ? '#fffbeb' : '#fef2f2',
                              color: att.status === 'Present' ? '#059669' : att.status === 'Half Day' ? '#d97706' : '#dc2626',
                              border: `1px solid ${att.status === 'Present' ? '#a7f3d0' : att.status === 'Half Day' ? '#fde68a' : '#fecaca'}`,
                            }}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{w.phone}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => { setReassignWorker(w); setReassignTargetSiteId(w.assignedSiteId); }}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11.5px' }}
                          >
                            Transfer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CONTRACTOR / THEKEDAR WISE DEPLOYMENT */}
      {/* ========================================================================= */}
      {viewMode === 'contractors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
          {contractorWiseData.map(({ contractor, workers, sites, dailySpend }) => (
            <div key={contractor.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #0f172a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {contractor.agencyName || contractor.name}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Lead: <b>{contractor.name}</b> • {contractor.phone}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Trade: <b>{contractor.trade || 'Interior Finishing'}</b> • Rating: ⭐ {contractor.rating || 4.8} / 5.0
                  </div>
                </div>

                <span className="status-badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '11px' }}>
                  Active Contractor
                </span>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Crew Size</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{workers.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sites Deployed</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>{sites.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Billing</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{formatCurrency(dailySpend)}</div>
                </div>
              </div>

              {/* Sites deployed */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Assigned Project Sites:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {sites.map(s => {
                    const countOnThisSite = workers.filter(w => w.assignedSiteId === s.id).length;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setViewMode('sites'); setSelectedSiteId(s.id); }}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          background: '#ffffff',
                          color: '#0f172a',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Building2 size={11} /> {s.name} ({countOnThisSite})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => {
                    setSiteFilter('All');
                    setTradeFilter('All');
                    setSearch(contractor.agencyName || contractor.name);
                    setViewMode('roster');
                  }}
                  className="btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '12px' }}
                >
                  View All {workers.length} Workers →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD WORKER */}
      {/* ========================================================================= */}
      {showAddWorkerModal && (
        <div className="modal-overlay" onClick={() => setShowAddWorkerModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Register New Labourer</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Add a worker and assign them directly to an interior project site
                </p>
              </div>
              <button
                onClick={() => setShowAddWorkerModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Full Name *</label>
                <input
                  required
                  className="form-input"
                  placeholder="e.g. Ramesh Chandra"
                  value={newWorker.name}
                  onChange={e => setNewWorker({ ...newWorker, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Mobile Phone *</label>
                  <input
                    required
                    className="form-input"
                    placeholder="+91 9876543210"
                    value={newWorker.phone}
                    onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Trade / Skill *</label>
                  <select
                    className="form-select"
                    value={newWorker.trade}
                    onChange={e => setNewWorker({ ...newWorker, trade: e.target.value as WorkerTrade })}
                  >
                    {tradesList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Assigned Project Site *</label>
                  <select
                    className="form-select"
                    value={newWorker.assignedSiteId}
                    onChange={e => {
                      const sid = e.target.value;
                      const siteObj = state.sites.find(s => s.id === sid);
                      setNewWorker({
                        ...newWorker,
                        assignedSiteId: sid,
                        thekedarId: siteObj ? siteObj.thekedarId : newWorker.thekedarId,
                      });
                    }}
                  >
                    {state.sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Thekedar / Contractor *</label>
                  <select
                    className="form-select"
                    value={newWorker.thekedarId}
                    onChange={e => setNewWorker({ ...newWorker, thekedarId: e.target.value })}
                  >
                    {state.users.filter(u => u.role === 'thekedar').map(t => (
                      <option key={t.id} value={t.id}>{t.agencyName || t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Daily Wage Rate (₹ / Day) *</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  placeholder="850"
                  value={newWorker.dailyWage}
                  onChange={e => setNewWorker({ ...newWorker, dailyWage: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 18px' }}
                >
                  Onboard Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRANSFER / REASSIGN WORKER TO ANOTHER SITE */}
      {/* ========================================================================= */}
      {reassignWorker && (
        <div className="modal-overlay" onClick={() => setReassignWorker(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0' }}>
              Transfer Labourer to Another Site
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Reassign <b>{reassignWorker.name}</b> ({reassignWorker.workerId} - {reassignWorker.trade}) to a different active project site.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Target Project Site</label>
              <select
                className="form-select"
                value={reassignTargetSiteId}
                onChange={e => setReassignTargetSiteId(e.target.value)}
              >
                {state.sites.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setReassignWorker(null)}
                className="btn-secondary"
                style={{ padding: '8px 14px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReassignSubmit}
                className="btn-primary"
                style={{ padding: '8px 16px' }}
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LabourPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Labour Operations...</div>}>
      <LabourPageContent />
    </Suspense>
  );
}
