'use client';
import { useState, useMemo, useEffect } from 'react';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import Link from 'next/link';
import {
  FolderKanban, MapPin, Users, Package, AlertTriangle, Clock,
  TrendingUp, Camera, ArrowRight, AlertCircle, CheckCircle2, Timer,
  IndianRupee, Wallet, Receipt, DollarSign, Calendar, Filter,
  Check, X, HardHat, Eye, EyeOff, Wrench, ShieldAlert, ArrowUpRight, ArrowDownRight,
  Sparkles, RefreshCw, ChevronRight, Activity, Search,
  Sliders, Settings, LayoutGrid, RotateCcw, Plus, Layers, CreditCard,
  GripVertical, Move, ArrowUp, ArrowDown, ArrowLeft
} from 'lucide-react';
import { getStatusBg, getProgressColor, formatCurrency, timeAgo } from '@/lib/utils';
import { Project, MaterialRequest, Issue } from '@/lib/types';

export type KpiId =
  | 'orderBook'
  | 'costIncurred'
  | 'collections'
  | 'workforce'
  | 'approvals'
  | 'escrowBalance'
  | 'grossMargin'
  | 'delayedSites';

export type WidgetId =
  | 'projectMatrix'
  | 'tradeDistribution'
  | 'pendingMaterials'
  | 'siteIssues'
  | 'activityFeed';

export type WidgetWidth = 'full' | 'wide' | 'half' | 'narrow';

export interface DashboardConfig {
  kpis: Record<KpiId, boolean>;
  kpiOrder: KpiId[];
  sections: {
    attentionBanner: boolean;
    perspectiveTabs: boolean;
    projectMatrix: boolean;
    tradeDistribution: boolean;
    pendingMaterials: boolean;
    siteIssues: boolean;
    activityFeed: boolean;
  };
  widgetOrder: WidgetId[];
  widgetWidths: Record<WidgetId, WidgetWidth>;
  layoutDensity: 'comfortable' | 'compact';
}

const DEFAULT_KPI_ORDER: KpiId[] = [
  'orderBook',
  'costIncurred',
  'collections',
  'workforce',
  'approvals',
  'escrowBalance',
  'grossMargin',
  'delayedSites',
];

const DEFAULT_WIDGET_ORDER: WidgetId[] = [
  'projectMatrix',
  'tradeDistribution',
  'pendingMaterials',
  'siteIssues',
  'activityFeed',
];

const DEFAULT_WIDGET_WIDTHS: Record<WidgetId, WidgetWidth> = {
  projectMatrix: 'wide',
  tradeDistribution: 'wide',
  pendingMaterials: 'narrow',
  siteIssues: 'narrow',
  activityFeed: 'narrow',
};

const DEFAULT_CONFIG: DashboardConfig = {
  kpis: {
    orderBook: true,
    costIncurred: true,
    collections: true,
    workforce: true,
    approvals: true,
    escrowBalance: true,
    grossMargin: true,
    delayedSites: true,
  },
  kpiOrder: DEFAULT_KPI_ORDER,
  sections: {
    attentionBanner: true,
    perspectiveTabs: true,
    projectMatrix: true,
    tradeDistribution: true,
    pendingMaterials: true,
    siteIssues: true,
    activityFeed: true,
  },
  widgetOrder: DEFAULT_WIDGET_ORDER,
  widgetWidths: DEFAULT_WIDGET_WIDTHS,
  layoutDensity: 'comfortable',
};

export default function OwnerDashboard() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Dashboard Customization State
  const [dashConfig, setDashConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState<boolean>(false);
  const [customizerTab, setCustomizerTab] = useState<'kpis' | 'sections' | 'layout' | 'presets'>('kpis');

  // Drag and drop states for live page editing
  const [draggedKpi, setDraggedKpi] = useState<KpiId | null>(null);
  const [dragOverKpi, setDragOverKpi] = useState<KpiId | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<WidgetId | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<WidgetId | null>(null);

  // Load customizer settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('interior_ops_admin_dashboard_config_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDashConfig(prev => ({
          ...prev,
          ...parsed,
          kpis: { ...prev.kpis, ...(parsed.kpis || {}) },
          kpiOrder: Array.isArray(parsed.kpiOrder) && parsed.kpiOrder.length === 8 ? parsed.kpiOrder : prev.kpiOrder,
          sections: { ...prev.sections, ...(parsed.sections || {}) },
          widgetOrder: Array.isArray(parsed.widgetOrder) && parsed.widgetOrder.length === 5 ? parsed.widgetOrder : prev.widgetOrder,
          widgetWidths: { ...prev.widgetWidths, ...(parsed.widgetWidths || {}) },
        }));
      }
    } catch {
      // fallback
    }
  }, []);

  // Save customizer config helper
  const updateConfig = (newConfig: DashboardConfig) => {
    setDashConfig(newConfig);
    try {
      localStorage.setItem('interior_ops_admin_dashboard_config_v2', JSON.stringify(newConfig));
    } catch {
      // storage quota fallback
    }
  };
  const saveConfig = updateConfig;

  const toggleKpi = (key: keyof DashboardConfig['kpis']) => {
    const updated: DashboardConfig = {
      ...dashConfig,
      kpis: {
        ...dashConfig.kpis,
        [key]: !dashConfig.kpis[key],
      },
    };
    updateConfig(updated);
    showToast(`Updated metric visibility`, 'success');
  };

  const toggleSection = (key: keyof DashboardConfig['sections']) => {
    const updated: DashboardConfig = {
      ...dashConfig,
      sections: {
        ...dashConfig.sections,
        [key]: !dashConfig.sections[key],
      },
    };
    updateConfig(updated);
    showToast(`Updated section visibility`, 'success');
  };

  // KPI Drag & Drop Handlers
  const handleKpiDragStart = (e: React.DragEvent, id: KpiId) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedKpi(id);
  };

  const handleKpiDragOver = (e: React.DragEvent, targetId: KpiId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverKpi !== targetId) {
      setDragOverKpi(targetId);
    }
  };

  const handleKpiDragLeave = () => {
    setDragOverKpi(null);
  };

  const handleKpiDrop = (e: React.DragEvent, targetId: KpiId) => {
    e.preventDefault();
    if (!draggedKpi || draggedKpi === targetId) {
      setDraggedKpi(null);
      setDragOverKpi(null);
      return;
    }
    const currentList = [...dashConfig.kpiOrder];
    const sourceIdx = currentList.indexOf(draggedKpi);
    const targetIdx = currentList.indexOf(targetId);
    if (sourceIdx !== -1 && targetIdx !== -1) {
      currentList.splice(sourceIdx, 1);
      currentList.splice(targetIdx, 0, draggedKpi);
      const updated: DashboardConfig = {
        ...dashConfig,
        kpiOrder: currentList,
      };
      updateConfig(updated);
      showToast(`Repositioned metric card to slot #${targetIdx + 1}`, 'success');
    }
    setDraggedKpi(null);
    setDragOverKpi(null);
  };

  const handleKpiDragEnd = () => {
    setDraggedKpi(null);
    setDragOverKpi(null);
  };

  const moveKpi = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= dashConfig.kpiOrder.length) return;
    const currentList = [...dashConfig.kpiOrder];
    const [removed] = currentList.splice(index, 1);
    currentList.splice(newIndex, 0, removed);
    const updated: DashboardConfig = {
      ...dashConfig,
      kpiOrder: currentList,
    };
    updateConfig(updated);
  };

  // Widget Drag & Drop Handlers
  const handleWidgetDragStart = (e: React.DragEvent, id: WidgetId) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedWidget(id);
  };

  const handleWidgetDragOver = (e: React.DragEvent, targetId: WidgetId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverWidget !== targetId) {
      setDragOverWidget(targetId);
    }
  };

  const handleWidgetDragLeave = () => {
    setDragOverWidget(null);
  };

  const handleWidgetDrop = (e: React.DragEvent, targetId: WidgetId) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) {
      setDraggedWidget(null);
      setDragOverWidget(null);
      return;
    }
    const currentList = [...dashConfig.widgetOrder];
    const sourceIdx = currentList.indexOf(draggedWidget);
    const targetIdx = currentList.indexOf(targetId);
    if (sourceIdx !== -1 && targetIdx !== -1) {
      currentList.splice(sourceIdx, 1);
      currentList.splice(targetIdx, 0, draggedWidget);
      const updated: DashboardConfig = {
        ...dashConfig,
        widgetOrder: currentList,
      };
      updateConfig(updated);
      showToast(`Repositioned widget to slot #${targetIdx + 1}`, 'success');
    }
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const handleWidgetDragEnd = () => {
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const moveWidget = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= dashConfig.widgetOrder.length) return;
    const currentList = [...dashConfig.widgetOrder];
    const [removed] = currentList.splice(index, 1);
    currentList.splice(newIndex, 0, removed);
    const updated: DashboardConfig = {
      ...dashConfig,
      widgetOrder: currentList,
    };
    updateConfig(updated);
  };

  const setWidgetWidth = (widgetId: WidgetId, width: WidgetWidth) => {
    const updated: DashboardConfig = {
      ...dashConfig,
      widgetWidths: {
        ...dashConfig.widgetWidths,
        [widgetId]: width,
      },
    };
    updateConfig(updated);
    showToast(`Set widget width to ${width.toUpperCase()}`, 'success');
  };

  const getColSpan = (width?: WidgetWidth) => {
    switch (width) {
      case 'full': return 'span 12';
      case 'wide': return 'span 8';
      case 'half': return 'span 6';
      case 'narrow': return 'span 4';
      default: return 'span 12';
    }
  };

  const applyPreset = (presetName: 'full' | 'finance' | 'operations' | 'minimal') => {
    let preset: DashboardConfig;
    if (presetName === 'finance') {
      preset = {
        kpis: {
          orderBook: true,
          costIncurred: true,
          collections: true,
          workforce: false,
          approvals: true,
          escrowBalance: true,
          grossMargin: true,
          delayedSites: false,
        },
        kpiOrder: ['orderBook', 'costIncurred', 'collections', 'grossMargin', 'escrowBalance', 'approvals', 'workforce', 'delayedSites'],
        sections: {
          attentionBanner: true,
          perspectiveTabs: true,
          projectMatrix: true,
          tradeDistribution: false,
          pendingMaterials: false,
          siteIssues: false,
          activityFeed: true,
        },
        widgetOrder: ['projectMatrix', 'activityFeed', 'tradeDistribution', 'pendingMaterials', 'siteIssues'],
        widgetWidths: {
          projectMatrix: 'full',
          activityFeed: 'full',
          tradeDistribution: 'wide',
          pendingMaterials: 'narrow',
          siteIssues: 'narrow',
        },
        layoutDensity: 'comfortable',
      };
      setActiveTab('finance');
    } else if (presetName === 'operations') {
      preset = {
        kpis: {
          orderBook: false,
          costIncurred: false,
          collections: false,
          workforce: true,
          approvals: true,
          escrowBalance: false,
          grossMargin: false,
          delayedSites: true,
        },
        kpiOrder: ['workforce', 'delayedSites', 'approvals', 'orderBook', 'costIncurred', 'collections', 'escrowBalance', 'grossMargin'],
        sections: {
          attentionBanner: true,
          perspectiveTabs: true,
          projectMatrix: true,
          tradeDistribution: true,
          pendingMaterials: true,
          siteIssues: true,
          activityFeed: true,
        },
        widgetOrder: ['tradeDistribution', 'projectMatrix', 'pendingMaterials', 'siteIssues', 'activityFeed'],
        widgetWidths: {
          tradeDistribution: 'full',
          projectMatrix: 'wide',
          pendingMaterials: 'narrow',
          siteIssues: 'narrow',
          activityFeed: 'narrow',
        },
        layoutDensity: 'comfortable',
      };
      setActiveTab('cockpit');
    } else if (presetName === 'minimal') {
      preset = {
        kpis: {
          orderBook: true,
          costIncurred: true,
          collections: true,
          workforce: true,
          approvals: false,
          escrowBalance: false,
          grossMargin: false,
          delayedSites: false,
        },
        kpiOrder: ['orderBook', 'costIncurred', 'collections', 'workforce', 'approvals', 'escrowBalance', 'grossMargin', 'delayedSites'],
        sections: {
          attentionBanner: false,
          perspectiveTabs: false,
          projectMatrix: true,
          tradeDistribution: false,
          pendingMaterials: false,
          siteIssues: false,
          activityFeed: false,
        },
        widgetOrder: ['projectMatrix', 'tradeDistribution', 'pendingMaterials', 'siteIssues', 'activityFeed'],
        widgetWidths: {
          projectMatrix: 'full',
          tradeDistribution: 'wide',
          pendingMaterials: 'narrow',
          siteIssues: 'narrow',
          activityFeed: 'narrow',
        },
        layoutDensity: 'compact',
      };
      setActiveTab('cockpit');
    } else {
      preset = DEFAULT_CONFIG;
    }
    updateConfig(preset);
    showToast(`Applied "${presetName.toUpperCase()}" layout preset`, 'success');
  };

  const resetToDefault = () => {
    updateConfig(DEFAULT_CONFIG);
    showToast('Reset dashboard to default enterprise view', 'success');
  };

  // Interactive controls
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'ytd'>('today');
  const [activeTab, setActiveTab] = useState<'cockpit' | 'finance' | 'workers' | 'procurement'>('cockpit');
  const [projectSearch, setProjectSearch] = useState<string>('');
  const [labourSubTab, setLabourSubTab] = useState<'sites' | 'contractors' | 'roster'>('sites');
  const [selectedLabourSiteId, setSelectedLabourSiteId] = useState<string>('all');

  // Location filter options

  const locations = useMemo(() => {
    const locs = Array.from(new Set(state.projects.map(p => p.location)));
    return ['All', ...locs];
  }, [state.projects]);

  // Filtered projects based on selected location
  const filteredProjects = useMemo(() => {
    return state.projects.filter(p => {
      const matchLoc = selectedLocation === 'All' || p.location === selectedLocation;
      const matchSearch = !projectSearch.trim() ||
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.client.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.location.toLowerCase().includes(projectSearch.toLowerCase());
      return matchLoc && matchSearch;
    });
  }, [state.projects, selectedLocation, projectSearch]);

  // Aggregate Financial Metrics
  const financeMetrics = useMemo(() => {
    const projs = selectedLocation === 'All' ? state.projects : state.projects.filter(p => p.location === selectedLocation);
    const totalOrderBook = projs.reduce((sum, p) => sum + p.projectValue, 0);
    const totalBudget = projs.reduce((sum, p) => sum + (p.budget || p.projectValue * 0.8), 0);
    const totalSpent = projs.reduce((sum, p) => sum + (p.spentCost || 0), 0);
    const totalMaterialSpend = projs.reduce((sum, p) => sum + (p.materialCost || 0), 0);
    const totalLabourSpend = projs.reduce((sum, p) => sum + (p.labourCost || 0), 0);
    const totalBilled = projs.reduce((sum, p) => sum + (p.billedAmount || 0), 0);
    const totalCollected = projs.reduce((sum, p) => sum + (p.receivedAmount || 0), 0);
    const pendingReceivables = totalBilled - totalCollected;
    const grossMargin = totalOrderBook > 0 ? ((totalOrderBook - totalBudget) / totalOrderBook) * 100 : 0;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalOrderBook,
      totalBudget,
      totalSpent,
      totalMaterialSpend,
      totalLabourSpend,
      totalBilled,
      totalCollected,
      pendingReceivables,
      grossMargin,
      budgetUtilization,
    };
  }, [state.projects, selectedLocation]);

  // Operational metrics
  const activeProjects = filteredProjects.filter(p => p.status !== 'Completed');
  const delayedProjects = filteredProjects.filter(p => p.status === 'Delayed');
  const attentionProjects = filteredProjects.filter(p => p.status === 'Attention');
  const totalWorkersOnSite = filteredProjects.reduce((sum, p) => sum + p.workerCount, 0);
  const pendingMR = state.materialRequests.filter(mr => mr.status === 'Pending');
  const openIssues = state.issues.filter(i => i.status === 'Open' || i.status === 'In Review');

  // Trade breakdown counts
  const tradeDistribution = useMemo(() => {
    return [
      { trade: 'Carpenters & Modular', count: 64, icon: Wrench, color: '#2563eb', bg: '#eff6ff' },
      { trade: 'Civil & Marble Tile', count: 46, icon: HardHat, color: '#059669', bg: '#ecfdf5' },
      { trade: 'Electricians & Automation', count: 28, icon: Activity, color: '#d97706', bg: '#fffbeb' },
      { trade: 'False Ceiling & POP', count: 34, icon: FolderKanban, color: '#7c3aed', bg: '#faf5ff' },
      { trade: 'Painters & Wall Polish', count: 22, icon: Sparkles, color: '#0284c7', bg: '#f0f9ff' },
      { trade: 'Helpers & Labour', count: 22, icon: Users, color: '#475569', bg: '#f1f5f9' },
    ];
  }, []);

  // Site-Wise Labour Computation
  const siteWiseLabour = useMemo(() => {
    return state.sites.map((site, index) => {
      const proj = state.projects.find(p => p.id === site.projectId || p.siteId === site.id);
      const thekedar = state.users.find(u => u.id === site.thekedarId);
      const subAdmin = state.users.find(u => u.id === site.subAdminId);
      const siteWorkers = state.workers.filter(w => w.assignedSiteId === site.id);
      const totalWorkers = site.workerCount || (siteWorkers.length > 0 ? siteWorkers.length : 20);

      const tradeMap: Record<string, number> = {};
      siteWorkers.forEach(w => {
        tradeMap[w.trade] = (tradeMap[w.trade] || 0) + 1;
      });

      const dailyWageTotal = siteWorkers.reduce((sum, w) => sum + w.dailyWage, 0) || totalWorkers * 850;
      const presentCount = Math.max(1, Math.round(totalWorkers * 0.95));
      const absentCount = totalWorkers - presentCount;
      const overtimeHours = (site.name.includes('Sharma') || site.name.includes('Arora') || site.name.includes('Hotel')) ? 8 : (index % 2 === 0 ? 4 : 2);

      return {
        site,
        project: proj,
        thekedar,
        subAdmin,
        totalWorkers,
        siteWorkers,
        tradeMap,
        dailyWageTotal,
        presentCount,
        absentCount,
        overtimeHours,
      };
    });
  }, [state.sites, state.projects, state.users, state.workers]);

  // Quick action: Direct Material Approval from Dashboard
  const handleDirectApproveMR = (mrId: string, materialName: string) => {
    dispatch({
      type: 'UPDATE_MATERIAL_REQUEST',
      payload: {
        id: mrId,
        changes: {
          status: 'Approved',
          approvedBy: user?.name || 'Rajesh Singhania',
          approvedAt: new Date().toISOString(),
        },
      },
    });

    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        id: `aud-${genId()}`,
        action: 'MATERIAL_APPROVED_EXECUTIVE',
        entityType: 'MaterialRequest',
        entityId: mrId,
        details: `Executive Director approved request for ${materialName}`,
        userId: user?.id || 'owner',
        userName: user?.name || 'Owner',
        createdAt: new Date().toISOString(),
      },
    });

    showToast(`Approved ${materialName} request instantly`, 'success');
  };

  // Quick action: Direct Issue Review from Dashboard
  const handleDirectResolveIssue = (issueId: string, title: string) => {
    dispatch({
      type: 'UPDATE_ISSUE',
      payload: {
        id: issueId,
        changes: {
          status: 'Resolved',
          resolvedAt: new Date().toISOString(),
        },
      },
    });
    showToast(`Marked issue "${title}" as Resolved`, 'success');
  };

  // Recent activity stream
  const recentActivity = useMemo(() => {
    return [
      ...state.dailyUpdates.map(u => ({
        type: 'update',
        title: `${u.submittedByName} updated ${u.taskName}`,
        project: state.projects.find(p => p.id === u.projectId)?.name || 'Project',
        time: u.createdAt,
        href: `/owner/projects/${u.projectId}`,
      })),
      ...state.materialRequests.slice(0, 5).map(mr => ({
        type: 'material',
        title: `Material Request: ${mr.materialName} (${mr.quantity} ${mr.unit})`,
        project: mr.projectName,
        time: mr.createdAt,
        href: `/owner/materials`,
      })),
      ...state.issues.slice(0, 4).map(iss => ({
        type: 'issue',
        title: `Site Issue: ${iss.title}`,
        project: iss.projectName,
        time: iss.createdAt,
        href: `/owner/issues`,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  }, [state.dailyUpdates, state.materialRequests, state.issues, state.projects]);

  const renderKpiCard = (kpiKey: KpiId, index: number) => {
    const isVisible = dashConfig.kpis[kpiKey];
    if (!isVisible && !isEditMode) return null;

    const isDragOver = isEditMode && dragOverKpi === kpiKey;
    const isDragging = isEditMode && draggedKpi === kpiKey;

    const kpiTitles: Record<KpiId, string> = {
      orderBook: 'Total Order Book',
      costIncurred: 'Actual Cost Incurred',
      collections: 'Collected vs Invoiced',
      workforce: 'Active Field Force',
      approvals: 'Pending Approvals',
      escrowBalance: 'Verified Escrow Balance',
      grossMargin: 'Project Gross Margin',
      delayedSites: 'Schedule Health',
    };

    const editTopBar = isEditMode && (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div
          draggable={true}
          onDragStart={(e) => handleKpiDragStart(e, kpiKey)}
          style={{
            cursor: 'grab',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            userSelect: 'none',
          }}
          title="Drag to reposition this KPI card anywhere in the strip"
        >
          <GripVertical size={11} />
          <span>⠿ Drag #{index + 1}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); moveKpi(index, -1); }}
            disabled={index === 0}
            style={{
              background: index === 0 ? '#f1f5f9' : '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '3px',
              padding: '1px 5px',
              fontSize: '10px',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              color: index === 0 ? '#94a3b8' : '#0f172a',
              fontWeight: 700,
            }}
            title="Move Left"
          >
            ←
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); moveKpi(index, 1); }}
            disabled={index === dashConfig.kpiOrder.length - 1}
            style={{
              background: index === dashConfig.kpiOrder.length - 1 ? '#f1f5f9' : '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '3px',
              padding: '1px 5px',
              fontSize: '10px',
              cursor: index === dashConfig.kpiOrder.length - 1 ? 'not-allowed' : 'pointer',
              color: index === dashConfig.kpiOrder.length - 1 ? '#94a3b8' : '#0f172a',
              fontWeight: 700,
            }}
            title="Move Right"
          >
            →
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleKpi(kpiKey); }}
            style={{
              background: '#ffffff',
              border: '1px solid #fca5a5',
              borderRadius: '3px',
              padding: '1px 5px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#dc2626',
              cursor: 'pointer',
            }}
            title="Hide this KPI card"
          >
            ✕
          </button>
        </div>
      </div>
    );

    if (!isVisible && isEditMode) {
      return (
        <div
          key={kpiKey}
          draggable={true}
          onDragStart={(e) => handleKpiDragStart(e, kpiKey)}
          onDragOver={(e) => handleKpiDragOver(e, kpiKey)}
          onDragLeave={handleKpiDragLeave}
          onDrop={(e) => handleKpiDrop(e, kpiKey)}
          onDragEnd={handleKpiDragEnd}
          style={{
            border: isDragOver ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '12px',
            background: isDragOver ? '#eff6ff' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            opacity: isDragging ? 0.4 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          {editTopBar}
          <div
            onClick={() => toggleKpi(kpiKey)}
            style={{ textAlign: 'center', cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={15} color="#2563eb" />
            <b style={{ fontSize: '11.5px', color: '#0f172a', marginTop: '2px' }}>+ Show {kpiTitles[kpiKey]}</b>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Currently Hidden</span>
          </div>
        </div>
      );
    }

    let cardContent = null;
    let cardClass = 'kpi-card blue';

    if (kpiKey === 'orderBook') {
      cardClass = 'kpi-card blue';
      cardContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Order Book
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {formatCurrency(financeMetrics.totalOrderBook)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
              <ArrowUpRight size={13} /> 8 Active Turnkey Sites
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={18} color="#2563eb" />
          </div>
        </div>
      );
    } else if (kpiKey === 'costIncurred') {
      cardClass = 'kpi-card green';
      cardContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Actual Cost Incurred
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {formatCurrency(financeMetrics.totalSpent)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <b>{financeMetrics.budgetUtilization.toFixed(1)}%</b> of {formatCurrency(financeMetrics.totalBudget)} Budget
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={18} color="#059669" />
          </div>
        </div>
      );
    } else if (kpiKey === 'collections') {
      cardClass = 'kpi-card cyan';
      cardContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Collected vs Invoiced
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {formatCurrency(financeMetrics.totalCollected)}
            </div>
            <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, marginTop: '4px' }}>
              Pending: {formatCurrency(financeMetrics.pendingReceivables)}
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={18} color="#0284c7" />
          </div>
        </div>
      );
    } else if (kpiKey === 'workforce') {
      cardClass = 'kpi-card purple';
      cardContent = (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => { setActiveTab('workers'); setLabourSubTab('sites'); }}
          title="Click to view site-wise labour deployment"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Field Force
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
                {totalWorkersOnSite} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>workers</span>
              </div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                94.5% Turnout • 6 Contractors
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#7c3aed" />
            </div>
          </div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🏢 See Labours Site-Wise →
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>8 Sites</span>
          </div>
        </div>
      );
    } else if (kpiKey === 'approvals') {
      cardClass = 'kpi-card amber';
      cardContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Approvals
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {pendingMR.length} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Materials</span>
            </div>
            <div style={{ fontSize: '12px', color: openIssues.length > 0 ? '#dc2626' : '#059669', fontWeight: 600, marginTop: '4px' }}>
              {openIssues.length} Open Issues
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} color="#d97706" />
          </div>
        </div>
      );
    } else if (kpiKey === 'escrowBalance') {
      cardClass = 'kpi-card blue';
      cardContent = (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Payout Gateway Escrow
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', marginTop: '4px', letterSpacing: '-0.02em' }}>
                {formatCurrency(state.gatewayConfig?.balance || 2485000)}
              </div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                ICICI Corporate Direct • Live
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#2563eb" />
            </div>
          </div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dbeafe' }}>
            <a href="/gateway" target="_blank" rel="noopener noreferrer" style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              💳 Open Payout Gateway ↗
            </a>
          </div>
        </div>
      );
    } else if (kpiKey === 'grossMargin') {
      cardClass = 'kpi-card green';
      cardContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Project Gross Margin
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {financeMetrics.grossMargin.toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Turnkey Execution Target: 20%
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} color="#059669" />
          </div>
        </div>
      );
    } else if (kpiKey === 'delayedSites') {
      cardClass = 'kpi-card amber';
      cardContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Schedule Health
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: delayedProjects.length > 0 ? '#dc2626' : '#059669', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {delayedProjects.length} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Delayed Sites</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {attentionProjects.length} Flagged for Attention
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Timer size={18} color="#d97706" />
          </div>
        </div>
      );
    }

    return (
      <div
        key={kpiKey}
        className={cardClass}
        draggable={isEditMode}
        onDragStart={(e) => handleKpiDragStart(e, kpiKey)}
        onDragOver={(e) => handleKpiDragOver(e, kpiKey)}
        onDragLeave={handleKpiDragLeave}
        onDrop={(e) => handleKpiDrop(e, kpiKey)}
        onDragEnd={handleKpiDragEnd}
        style={{
          outline: isDragOver ? '2px dashed #2563eb' : 'none',
          outlineOffset: '2px',
          opacity: isDragging ? 0.4 : 1,
          transition: 'all 0.15s ease',
          position: 'relative',
        }}
      >
        {editTopBar}
        {cardContent}
      </div>
    );
  };

  const renderCockpitWidget = (widgetId: WidgetId, index: number) => {
    const isVisible = dashConfig.sections[widgetId];
    if (!isVisible && !isEditMode) return null;

    const width = dashConfig.widgetWidths[widgetId] || (widgetId === 'projectMatrix' || widgetId === 'tradeDistribution' ? 'wide' : 'narrow');
    const colSpan = getColSpan(width);
    const isDragOver = isEditMode && dragOverWidget === widgetId;
    const isDragging = isEditMode && draggedWidget === widgetId;

    const widgetHeaderBar = isEditMode && (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 12px',
        background: '#0f172a',
        borderRadius: '8px 8px 0 0',
        marginBottom: '10px',
        flexWrap: 'wrap',
        gap: '8px',
        color: '#ffffff',
      }}>
        {/* Drag Handle & Position Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            draggable={true}
            onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '5px',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'grab',
              userSelect: 'none',
            }}
            title="Click and drag to drop this component anywhere on your dashboard"
          >
            <GripVertical size={13} />
            <span>⠿ Drag Component</span>
          </div>

          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
            Position #{index + 1} of {dashConfig.widgetOrder.length}
          </span>

          {/* Quick Reorder Arrows */}
          <div style={{ display: 'flex', gap: '3px' }}>
            <button
              onClick={() => moveWidget(index, -1)}
              disabled={index === 0}
              style={{
                background: index === 0 ? '#1e293b' : '#334155',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: index === 0 ? 'not-allowed' : 'pointer',
                color: index === 0 ? '#64748b' : '#ffffff',
              }}
              title="Move component up/earlier in layout"
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={() => moveWidget(index, 1)}
              disabled={index === dashConfig.widgetOrder.length - 1}
              style={{
                background: index === dashConfig.widgetOrder.length - 1 ? '#1e293b' : '#334155',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: index === dashConfig.widgetOrder.length - 1 ? 'not-allowed' : 'pointer',
                color: index === dashConfig.widgetOrder.length - 1 ? '#64748b' : '#ffffff',
              }}
              title="Move component down/later in layout"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        </div>

        {/* Width Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#94a3b8' }}>Width:</span>
          {(['full', 'wide', 'half', 'narrow'] as WidgetWidth[]).map((w) => (
            <button
              key={w}
              onClick={() => setWidgetWidth(widgetId, w)}
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontWeight: 700,
                cursor: 'pointer',
                background: width === w ? '#2563eb' : '#1e293b',
                color: width === w ? '#ffffff' : '#cbd5e1',
                border: width === w ? '1px solid #3b82f6' : '1px solid #334155',
              }}
            >
              {w === 'full' ? '100% Full' : w === 'wide' ? '67% Wide' : w === 'half' ? '50% Half' : '33% Narrow'}
            </button>
          ))}

          {/* Hide button */}
          <button
            onClick={() => toggleSection(widgetId)}
            style={{
              background: '#dc2626',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              marginLeft: '4px',
            }}
            title="Hide this component"
          >
            ✕ Hide
          </button>
        </div>
      </div>
    );

    // If widget is currently hidden and we are in edit mode, show dashed placeholder
    if (!isVisible && isEditMode) {
      const titles: Record<WidgetId, string> = {
        projectMatrix: 'Active Project Portfolio Matrix',
        tradeDistribution: 'Field Workforce Deployment by Trade',
        pendingMaterials: 'Materials Needing Sign-Off Widget',
        siteIssues: 'Site Bottlenecks & Issues Widget',
        activityFeed: 'Live Operational Activity Feed',
      };

      return (
        <div
          key={widgetId}
          draggable={true}
          onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
          onDragOver={(e) => handleWidgetDragOver(e, widgetId)}
          onDragLeave={handleWidgetDragLeave}
          onDrop={(e) => handleWidgetDrop(e, widgetId)}
          onDragEnd={handleWidgetDragEnd}
          style={{
            gridColumn: colSpan,
            border: isDragOver ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '16px',
            background: isDragOver ? '#eff6ff' : '#f8fafc',
            opacity: isDragging ? 0.4 : 1,
            transition: 'all 0.15s ease',
            minWidth: 0,
          }}
        >
          {widgetHeaderBar}
          <div
            onClick={() => toggleSection(widgetId)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', padding: '16px' }}
          >
            <Plus size={20} color="#2563eb" />
            <b style={{ fontSize: '13px', color: '#0f172a', marginTop: '6px' }}>+ Show {titles[widgetId]}</b>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Click to restore this widget or drag to reposition slot</span>
          </div>
        </div>
      );
    }

    let content = null;
    if (widgetId === 'projectMatrix') {
      content = (
        <div className="glass-card" style={{ padding: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Active Project Portfolio Matrix</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Real-time execution, completion milestones, and budget health</p>
            </div>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '32px', fontSize: '12.5px', padding: '6px 10px 6px 32px' }}
                placeholder="Search site or client..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project / Client</th>
                  <th>Progress</th>
                  <th>Order Value</th>
                  <th>Spent / Budget</th>
                  <th>Workers</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(project => {
                  const budget = project.budget || project.projectValue * 0.8;
                  const spent = project.spentCost || 0;
                  const costRatio = budget > 0 ? (spent / budget) * 100 : 0;

                  return (
                    <tr key={project.id}>
                      <td>
                        <div>
                          <Link href={`/owner/projects/${project.id}`} style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', textDecoration: 'none' }}>
                            {project.name}
                          </Link>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                            <span>{project.client}</span>
                            <span>•</span>
                            <span style={{ color: '#0f172a', fontWeight: 500 }}>{project.location}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ minWidth: '130px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar" style={{ flex: 1, height: '7px' }}>
                            <div className={`progress-bar-fill ${getProgressColor(project.progress)}`} style={{ width: `${project.progress}%` }} />
                          </div>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, minWidth: '34px' }}>{project.progress}%</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{formatCurrency(project.projectValue)}</span>
                      </td>

                      <td>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: costRatio > 90 ? '#dc2626' : 'var(--text-primary)' }}>
                            {formatCurrency(spent)}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {costRatio.toFixed(0)}% of {formatCurrency(budget)}
                          </div>
                        </div>
                      </td>

                      <td>
                        <button
                          onClick={() => {
                            setSelectedLabourSiteId(project.siteId);
                            setActiveTab('workers');
                            setLabourSubTab('sites');
                          }}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            padding: '3px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            borderRadius: '4px',
                            transition: 'all 0.12s ease'
                          }}
                          title={`Click to inspect ${project.workerCount} workers deployed at ${project.name}`}
                        >
                          <Users size={12} color="#059669" />
                          <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>{project.workerCount}</span>
                          <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>→</span>
                        </button>
                      </td>

                      <td>
                        <span className={`status-badge ${getStatusBg(project.status)}`} style={{ fontSize: '11px' }}>
                          {project.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/owner/projects/${project.id}`} className="btn-secondary" style={{ padding: '4px 9px', fontSize: '11.5px' }}>
                          View Site →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (widgetId === 'tradeDistribution') {
      content = (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Field Workforce Deployment by Trade</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total: <b>{totalWorkersOnSite} Workers Active</b></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {tradeDistribution.map(t => {
              const Icon = t.icon;
              return (
                <div key={t.trade} style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} color={t.color} />
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{t.count}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.trade}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else if (widgetId === 'pendingMaterials') {
      content = (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={17} color="#2563eb" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Materials Needing Sign-Off</h3>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '10px' }}>
              {pendingMR.length} Pending
            </span>
          </div>

          {pendingMR.length === 0 ? (
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
              All material requests have been approved!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingMR.slice(0, 3).map(mr => (
                <div key={mr.id} style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{mr.materialName}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{mr.projectName} • {mr.quantity} {mr.unit}</div>
                    </div>
                    <span className={`status-badge ${getStatusBg(mr.priority)}`} style={{ fontSize: '10px' }}>{mr.priority}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '8px', fontStyle: 'italic' }}>
                    "{mr.reason}"
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleDirectApproveMR(mr.id, mr.materialName)}
                      className="btn-success"
                      style={{ padding: '4px 10px', fontSize: '11.5px', flex: 1, justifyContent: 'center' }}
                    >
                      <Check size={12} /> Approve
                    </button>
                    <Link href="/owner/materials" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11.5px' }}>
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (widgetId === 'siteIssues') {
      content = (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={17} color="#dc2626" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Site Issues & Bottlenecks</h3>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, background: '#fef2f2', color: '#b91c1c', padding: '2px 8px', borderRadius: '10px' }}>
              {openIssues.length} Open
            </span>
          </div>

          {openIssues.length === 0 ? (
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
              Zero open issues across all active sites!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {openIssues.slice(0, 3).map(iss => (
                <div key={iss.id} style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{iss.title}</div>
                    <span className={`status-badge ${getStatusBg(iss.priority)}`} style={{ fontSize: '10px' }}>{iss.priority}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {iss.projectName} • Category: <b>{iss.category}</b>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleDirectResolveIssue(iss.id, iss.title)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11.5px', flex: 1, justifyContent: 'center' }}
                    >
                      <CheckCircle2 size={12} color="#059669" /> Mark Resolved
                    </button>
                    <Link href="/owner/issues" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11.5px' }}>
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (widgetId === 'activityFeed') {
      content = (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#0f172a" /> Live Activity Feed
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivity.slice(0, 5).map((act, i) => (
              <Link key={i} href={act.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', padding: '6px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
                    background: act.type === 'issue' ? '#dc2626' : act.type === 'material' ? '#d97706' : '#059669'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{act.project} • {timeAgo(act.time)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        key={widgetId}
        draggable={isEditMode}
        onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
        onDragOver={(e) => handleWidgetDragOver(e, widgetId)}
        onDragLeave={handleWidgetDragLeave}
        onDrop={(e) => handleWidgetDrop(e, widgetId)}
        onDragEnd={handleWidgetDragEnd}
        style={{
          gridColumn: colSpan,
          outline: isDragOver ? '2px dashed #2563eb' : 'none',
          outlineOffset: '2px',
          opacity: isDragging ? 0.4 : 1,
          transition: 'all 0.15s ease',
          minWidth: 0,
        }}
      >
        {widgetHeaderBar}
        {content}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Executive Command Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Executive Command Cockpit
            </h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '11px', fontWeight: 700 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
              LIVE TELEMETRY
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
            Director Overview for <b>{user?.name || 'Rajesh Singhania'}</b> • {state.sites.length} Active Sites • {totalWorkersOnSite} Field Force On-Duty
          </p>
        </div>

        {/* Global Controls & Location / Timeframe Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Location Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 10px' }}>
            <MapPin size={14} color="#64748b" />
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              style={{ background: 'transparent', border: 'none', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>Location: {loc}</option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector */}
          <div style={{ display: 'flex', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '3px' }}>
            {(['today', 'week', 'month', 'ytd'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                  background: selectedTimeframe === tf ? '#0f172a' : 'transparent',
                  color: selectedTimeframe === tf ? '#ffffff' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                {tf === 'today' ? 'Today' : tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'FY 26-27'}
              </button>
            ))}
          </div>

          {/* Dashboard Customization Modal Trigger */}
          <button
            onClick={() => setShowCustomizeModal(true)}
            className="btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              fontWeight: 700
            }}
            title="Edit which metrics, sections, and operations cards appear on your dashboard"
          >
            <Sliders size={14} color="#2563eb" />
            <span>Customize Dashboard</span>
          </button>

          {/* Quick Edit View Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            style={{
              padding: '8px 14px',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isEditMode ? '#0f172a' : '#f8fafc',
              color: isEditMode ? '#ffffff' : '#0f172a',
              border: '1px solid ' + (isEditMode ? '#0f172a' : 'var(--border-color)'),
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              transition: 'all 0.15s ease'
            }}
            title="Toggle visual edit mode to hide/show widgets directly on page"
          >
            {isEditMode ? <Check size={14} color="#10b981" /> : <Eye size={14} />}
            <span>{isEditMode ? 'Done Editing' : 'Edit Layout'}</span>
          </button>

          <Link href="/owner/projects" className="btn-primary" style={{ padding: '8px 14px', fontSize: '12.5px' }}>
            <FolderKanban size={14} /> All Projects ({state.projects.length})
          </Link>
        </div>
      </div>

      {/* Edit Mode Notification Toolbar Banner */}
      {isEditMode && (
        <div style={{
          padding: '12px 18px',
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={16} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>Dashboard Customization Mode Active</div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                Click the <b>✕ Hide</b> button on cards to remove them, or click <b>+ Show</b> to restore hidden items.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600 }}>Quick Presets:</span>
            <button
              onClick={() => applyPreset('full')}
              style={{ padding: '4px 10px', fontSize: '11.5px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}
            >
              Full
            </button>
            <button
              onClick={() => applyPreset('finance')}
              style={{ padding: '4px 10px', fontSize: '11.5px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}
            >
              Finance
            </button>
            <button
              onClick={() => applyPreset('operations')}
              style={{ padding: '4px 10px', fontSize: '11.5px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}
            >
              Site Ops
            </button>
            <button
              onClick={() => applyPreset('minimal')}
              style={{ padding: '4px 10px', fontSize: '11.5px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}
            >
              Minimal
            </button>
            <button
              onClick={() => setShowCustomizeModal(true)}
              style={{ padding: '5px 12px', fontSize: '11.5px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 700 }}
            >
              ⚙️ Layout Modal
            </button>
            <button
              onClick={() => setIsEditMode(false)}
              style={{ padding: '5px 14px', fontSize: '11.5px', background: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 700 }}
            >
              Done ✓
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Strip: Financial & Operational Overview (Customizable & Drag-Reorderable) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        {dashConfig.kpiOrder.map((kpiKey, index) => renderKpiCard(kpiKey, index))}
      </div>

      {/* Critical Operational Attention Banner (If delayed or pending high priority) */}
      {dashConfig.sections.attentionBanner ? (
        (delayedProjects.length > 0 || pendingMR.length > 0 || openIssues.length > 0) && (
          <div className="glass-card" style={{ padding: '14px 18px', marginBottom: '22px', borderLeft: '4px solid #dc2626', background: '#ffffff', position: 'relative' }}>
            {isEditMode && (
              <button
                onClick={() => toggleSection('attentionBanner')}
                style={{ position: 'absolute', top: '10px', right: '12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, color: '#dc2626', cursor: 'pointer', zIndex: 3 }}
                title="Hide Attention Banner"
              >
                ✕ Hide
              </button>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={16} color="#dc2626" />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>
                    Action Needed on Sites:
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                    {delayedProjects.length > 0 && `${delayedProjects.map(p => p.name).join(', ')} flagged Delayed. `}
                    {pendingMR.length > 0 && `${pendingMR.length} material procurement request(s) awaiting sign-off.`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/owner/materials" className="btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>
                  Review Materials ({pendingMR.length})
                </Link>
                <Link href="/owner/issues" className="btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>
                  Inspect Issues ({openIssues.length})
                </Link>
              </div>
            </div>
          </div>
        )
      ) : isEditMode ? (
        <div
          onClick={() => toggleSection('attentionBanner')}
          style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '12px 18px', background: '#f8fafc', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <Plus size={15} color="#dc2626" />
            <b style={{ color: '#0f172a' }}>+ Show Critical Operational Attention Banner</b> (Currently Hidden)
          </div>
          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Click to restore section</span>
        </div>
      ) : null}

      {/* Interactive Perspective Tabs */}
      {dashConfig.sections.perspectiveTabs ? (
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          {isEditMode && (
            <button
              onClick={() => toggleSection('perspectiveTabs')}
              style={{ position: 'absolute', right: 0, top: '-24px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, color: '#dc2626', cursor: 'pointer', zIndex: 5 }}
              title="Hide Perspective Tabs"
            >
              ✕ Hide Tabs Bar
            </button>
          )}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', overflowX: 'auto' }}>
            {[
              { key: 'cockpit', label: '📊 Executive Cockpit', count: filteredProjects.length },
              { key: 'finance', label: '💰 Financials & Cost Control', count: null },
              { key: 'workers', label: '👷 Workforce & Labour Pulse', count: totalWorkersOnSite },
              { key: 'procurement', label: '📦 Material & Procurement Pipeline', count: pendingMR.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: activeTab === tab.key ? '#0f172a' : '#ffffff',
                  color: activeTab === tab.key ? '#ffffff' : 'var(--text-secondary)',
                  border: activeTab === tab.key ? '1px solid #0f172a' : '1px solid var(--border-color)',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span style={{
                    fontSize: '11px', padding: '1px 6px', borderRadius: '10px',
                    background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                    color: activeTab === tab.key ? '#ffffff' : 'var(--text-muted)'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : isEditMode ? (
        <div
          onClick={() => toggleSection('perspectiveTabs')}
          style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '10px 16px', background: '#f8fafc', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <Plus size={15} color="#2563eb" />
            <b style={{ color: '#0f172a' }}>+ Show Module Tabs Bar</b> (Executive Cockpit / Finance / Workforce / Procurement)
          </div>
          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Click to restore tabs</span>
        </div>
      ) : null}

      {/* TAB CONTENT 1: EXECUTIVE COCKPIT (Flexible 12-Column Drag & Reorder Grid) */}
      {activeTab === 'cockpit' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px',
        }}>
          {dashConfig.widgetOrder.map((widgetId, index) => renderCockpitWidget(widgetId, index))}
        </div>
      )}

      {/* TAB CONTENT 2: FINANCIALS & COST CONTROL */}
      {activeTab === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Financial Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Invoiced</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{formatCurrency(financeMetrics.totalBilled)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Based on certified work milestones</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cash Collected</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', margin: '4px 0' }}>{formatCurrency(financeMetrics.totalCollected)}</div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>88.8% collection efficiency</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Material Procurement Cost</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', margin: '4px 0' }}>{formatCurrency(financeMetrics.totalMaterialSpend)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>62.6% of incurred costs</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Labour & Contractor Payouts</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>{formatCurrency(financeMetrics.totalLabourSpend)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>37.4% of incurred costs</div>
              <a href="/gateway" target="_blank" rel="noopener noreferrer" style={{ marginTop: '8px', fontSize: '11px', fontWeight: 700, color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                ⚡ Open Payout Gateway ↗
              </a>
            </div>
          </div>

          {/* Payment Gateway Callout Banner */}
          <div style={{ padding: '16px 20px', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: '4px solid #2563eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  💳 Integrated Payment Gateway Software (InteriorPay)
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, background: '#ecfdf5', color: '#047857', padding: '2px 7px', borderRadius: '4px' }}>
                  ACTIVE (RazorpayX & ICICI)
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Disburse salaries for 26 office staff, weekly wages for 600 site labourers, and thekedar milestone releases instantly via dedicated banking rails.
              </p>
            </div>
            <a href="/gateway" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '8px 16px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              ⚡ Launch Payout Software (New Tab) ↗
            </a>
          </div>

          {/* Project-by-Project Financial Performance Table */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Project Budget Utilization & Margin Analysis</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Contract Value</th>
                    <th>Approved Budget</th>
                    <th>Cost Incurred</th>
                    <th>Budget Used</th>
                    <th>Material Spend</th>
                    <th>Labour Spend</th>
                    <th>Billed to Client</th>
                    <th>Collected</th>
                    <th>Variance / Health</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(p => {
                    const budget = p.budget || p.projectValue * 0.8;
                    const spent = p.spentCost || 0;
                    const usedPct = budget > 0 ? (spent / budget) * 100 : 0;
                    const isOverBudget = usedPct > 95;

                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.client}</div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(p.projectValue)}</td>
                        <td>{formatCurrency(budget)}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(spent)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="progress-bar" style={{ width: '60px', height: '6px' }}>
                              <div style={{ width: `${Math.min(usedPct, 100)}%`, height: '100%', background: isOverBudget ? '#dc2626' : '#2563eb', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>{usedPct.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td>{formatCurrency(p.materialCost || 0)}</td>
                        <td>{formatCurrency(p.labourCost || 0)}</td>
                        <td>{formatCurrency(p.billedAmount || 0)}</td>
                        <td style={{ color: '#059669', fontWeight: 600 }}>{formatCurrency(p.receivedAmount || 0)}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                            background: isOverBudget ? '#fef2f2' : '#ecfdf5',
                            color: isOverBudget ? '#b91c1c' : '#047857',
                            border: isOverBudget ? '1px solid #fecaca' : '1px solid #a7f3d0'
                          }}>
                            {isOverBudget ? 'Cost Watch' : 'Within Budget'}
                          </span>
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

      {/* TAB CONTENT 3: WORKFORCE & LABOUR PULSE */}
      {activeTab === 'workers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Wage Burn Rate</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>₹1,94,400 / day</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Average ₹900/day per labourer</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overtime Logged Today</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>42 Hours OT</div>
              <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600 }}>Across 4 rush milestone sites</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contractor Supervised Labour</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', margin: '4px 0' }}>216 Workers</div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>6 Verified Thekedar Agencies</div>
            </div>
          </div>

          {/* Sub-tab view toggle: Site-Wise vs Contractor-Wise vs Full Roster */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setLabourSubTab('sites')}
                style={{
                  padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  background: labourSubTab === 'sites' ? '#0f172a' : '#ffffff',
                  color: labourSubTab === 'sites' ? '#ffffff' : 'var(--text-secondary)',
                  border: labourSubTab === 'sites' ? '1px solid #0f172a' : '1px solid var(--border-color)',
                  transition: 'all 0.15s ease'
                }}
              >
                🏢 Site-Wise Labour Deployment (8 Sites)
              </button>
              <button
                onClick={() => setLabourSubTab('contractors')}
                style={{
                  padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  background: labourSubTab === 'contractors' ? '#0f172a' : '#ffffff',
                  color: labourSubTab === 'contractors' ? '#ffffff' : 'var(--text-secondary)',
                  border: labourSubTab === 'contractors' ? '1px solid #0f172a' : '1px solid var(--border-color)',
                  transition: 'all 0.15s ease'
                }}
              >
                🏗️ Contractor / Thekedar Deployment
              </button>
              <button
                onClick={() => setLabourSubTab('roster')}
                style={{
                  padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  background: labourSubTab === 'roster' ? '#0f172a' : '#ffffff',
                  color: labourSubTab === 'roster' ? '#ffffff' : 'var(--text-secondary)',
                  border: labourSubTab === 'roster' ? '1px solid #0f172a' : '1px solid var(--border-color)',
                  transition: 'all 0.15s ease'
                }}
              >
                📋 Master Labour Roster
              </button>
            </div>

            <Link href="/owner/labour" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              Open Dedicated Labour Hub →
            </Link>
          </div>

          {/* VIEW 1: SITE-WISE LABOUR DEPLOYMENT */}
          {labourSubTab === 'sites' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Site Quick Filter Bar */}
              <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap', marginRight: '4px' }}>
                  Filter Site:
                </span>
                <button
                  onClick={() => setSelectedLabourSiteId('all')}
                  style={{
                    padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                    background: selectedLabourSiteId === 'all' ? '#0f172a' : '#f8fafc',
                    color: selectedLabourSiteId === 'all' ? '#ffffff' : 'var(--text-secondary)',
                    border: selectedLabourSiteId === 'all' ? '1px solid #0f172a' : '1px solid var(--border-color)',
                  }}
                >
                  All Sites ({totalWorkersOnSite} Workers)
                </button>
                {state.sites.map(s => {
                  const isSelected = selectedLabourSiteId === s.id;
                  const count = s.workerCount || 20;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedLabourSiteId(s.id)}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                        background: isSelected ? '#0f172a' : '#f8fafc',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid #0f172a' : '1px solid var(--border-color)',
                      }}
                    >
                      {s.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* If Single Site Selected: Detailed Site Labour View */}
              {selectedLabourSiteId !== 'all' ? (
                (() => {
                  const currentSiteData = siteWiseLabour.find(d => d.site.id === selectedLabourSiteId);
                  if (!currentSiteData) return null;
                  const { site, thekedar, subAdmin, totalWorkers, siteWorkers, dailyWageTotal, presentCount, absentCount, overtimeHours } = currentSiteData;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Focused Site Header Card */}
                      <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #2563eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                {site.name} — Labour Operations
                              </h3>
                              <span className={`status-badge ${getStatusBg(site.status)}`} style={{ fontSize: '11px' }}>
                                {site.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                              {site.address} • Contractor: <b>{thekedar?.agencyName || thekedar?.name || 'Assigned Thekedar'}</b> • Manager: <b>{subAdmin?.name || 'Site Manager'}</b>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedLabourSiteId('all')}
                            className="btn-secondary"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            ← View All Sites Comparison
                          </button>
                        </div>

                        {/* Metric Row for this specific site */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Labour on Site</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{totalWorkers} workers</div>
                          </div>
                          <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Present Today</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{presentCount} on-duty</div>
                          </div>
                          <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Overtime Logged</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{overtimeHours} hours OT</div>
                          </div>
                          <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Daily Labour Burn</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>{formatCurrency(dailyWageTotal)} / day</div>
                          </div>
                        </div>
                      </div>

                      {/* Workers Assigned to this site */}
                      <div className="glass-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                            Labour Roster deployed at {site.name} ({siteWorkers.length > 0 ? siteWorkers.length : totalWorkers} personnel)
                          </h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Updated today at 09:00 AM
                          </span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Worker ID</th>
                                <th>Name</th>
                                <th>Trade</th>
                                <th>Contractor Agency</th>
                                <th>Daily Wage</th>
                                <th>Today's Status</th>
                                <th>Overtime</th>
                                <th>Phone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(siteWorkers.length > 0 ? siteWorkers : state.workers.slice(0, totalWorkers)).map((w, idx) => (
                                <tr key={w.id || idx}>
                                  <td style={{ fontWeight: 700, fontSize: '12.5px', color: '#2563eb' }}>{w.workerId}</td>
                                  <td style={{ fontWeight: 600 }}>{w.name}</td>
                                  <td>
                                    <span style={{
                                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                      background: '#f1f5f9', color: 'var(--text-primary)', border: '1px solid var(--border-color)'
                                    }}>
                                      {w.trade}
                                    </span>
                                  </td>
                                  <td>{thekedar?.name || 'Site Contractor'}</td>
                                  <td style={{ fontWeight: 600 }}>{formatCurrency(w.dailyWage || 800)}</td>
                                  <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#059669' }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} /> Present
                                    </span>
                                  </td>
                                  <td style={{ fontSize: '12px' }}>{idx % 3 === 0 ? '2 hrs OT' : '—'}</td>
                                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{w.phone}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Grid of All 8 Sites with Labour Counts */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {siteWiseLabour.map(({ site, project, thekedar, subAdmin, totalWorkers, dailyWageTotal, presentCount, absentCount, overtimeHours, tradeMap }) => (
                    <div key={site.id} className="glass-card" style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{site.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <MapPin size={12} /> {site.location}
                          </div>
                        </div>
                        <span className={`status-badge ${getStatusBg(site.status)}`} style={{ fontSize: '11px' }}>
                          {site.status}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Labour Force</div>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{totalWorkers} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>workers</span></div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Turnout Today</div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
                            {presentCount} Present ({((presentCount / totalWorkers) * 100).toFixed(0)}%)
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Labour Cost</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>{formatCurrency(dailyWageTotal)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overtime Hours</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>{overtimeHours} hrs OT logged</div>
                        </div>
                      </div>

                      {/* Trade Breakdown for this site */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Trades Active on Site:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {Object.entries(tradeMap).length > 0 ? (
                            Object.entries(tradeMap).map(([trade, count]) => (
                              <span key={trade} style={{ padding: '2px 7px', borderRadius: '4px', background: '#ffffff', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {trade}: <b>{count}</b>
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>General Interior Trades Deployed</span>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        Contractor: <b>{thekedar?.agencyName || thekedar?.name || 'Assigned Thekedar'}</b>
                      </div>

                      <button
                        onClick={() => setSelectedLabourSiteId(site.id)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '7px 12px', fontSize: '12px', justifyContent: 'center' }}
                      >
                        Inspect Site Labour Roster ({totalWorkers}) →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: CONTRACTOR-WISE DEPLOYMENT */}
          {labourSubTab === 'contractors' && (
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Contractor Agencies & Assigned Sites</h3>
                <Link href="/owner/users" className="btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>
                  Manage Thekedars →
                </Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Agency / Thekedar</th>
                      <th>Trade Specialty</th>
                      <th>Assigned Sites</th>
                      <th>Labour Deployed</th>
                      <th>Rating</th>
                      <th>Attendance Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.users.filter(u => u.role === 'thekedar').map(th => {
                      const assignedSites = state.sites.filter(s => th.assignedSiteIds.includes(s.id));
                      return (
                        <tr key={th.id}>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{th.agencyName || th.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lead: {th.name} • {th.phone}</div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-primary)' }}>{th.trade}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {assignedSites.map(s => (
                                <span key={s.id} style={{ padding: '2px 7px', borderRadius: '4px', background: '#f1f5f9', border: '1px solid var(--border-color)', fontSize: '11px' }}>
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, fontSize: '14px', color: '#059669' }}>{th.workerCount || 0}</span> workers
                          </td>
                          <td style={{ color: '#d97706', fontWeight: 700 }}>
                            ★ {th.rating?.toFixed(1) || '4.8'}
                          </td>
                          <td style={{ color: '#059669', fontWeight: 600 }}>96.2%</td>
                          <td>
                            <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: '#ecfdf5', color: '#047857' }}>
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: FULL MASTER LABOUR ROSTER */}
          {labourSubTab === 'roster' && (
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Company-Wide Labour Master List ({state.workers.length} Workers)</h3>
                <Link href="/owner/labour" className="btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>
                  Full Directory Hub →
                </Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker ID</th>
                      <th>Name</th>
                      <th>Trade</th>
                      <th>Assigned Site</th>
                      <th>Daily Wage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.workers.map(w => {
                      const site = state.sites.find(s => s.id === w.assignedSiteId);
                      return (
                        <tr key={w.id}>
                          <td style={{ fontWeight: 700, color: '#2563eb' }}>{w.workerId}</td>
                          <td style={{ fontWeight: 600 }}>{w.name}</td>
                          <td>{w.trade}</td>
                          <td>{site?.name || 'Unassigned'}</td>
                          <td style={{ fontWeight: 600 }}>{formatCurrency(w.dailyWage)}</td>
                          <td>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#ecfdf5', color: '#047857' }}>
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: MATERIAL & PROCUREMENT PIPELINE */}
      {activeTab === 'procurement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Material Procurement Pipeline</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Direct approval authority for site materials</p>
              </div>
              <Link href="/owner/materials" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                Full Inventory & Logs →
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Req ID</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Project Site</th>
                    <th>Required By</th>
                    <th>Priority</th>
                    <th>Requested By</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Executive Action</th>
                  </tr>
                </thead>
                <tbody>
                  {state.materialRequests.map(mr => (
                    <tr key={mr.id}>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{mr.requestId}</td>
                      <td style={{ fontWeight: 700 }}>{mr.materialName}</td>
                      <td>{mr.quantity} {mr.unit}</td>
                      <td>{mr.projectName}</td>
                      <td>{mr.requiredBy}</td>
                      <td>
                        <span className={`status-badge ${getStatusBg(mr.priority)}`} style={{ fontSize: '11px' }}>
                          {mr.priority}
                        </span>
                      </td>
                      <td>{mr.requestedByName}</td>
                      <td>
                        <span className={`status-badge ${getStatusBg(mr.status)}`} style={{ fontSize: '11px' }}>
                          {mr.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {mr.status === 'Pending' ? (
                          <button
                            onClick={() => handleDirectApproveMR(mr.id, mr.materialName)}
                            className="btn-success"
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                          >
                            <Check size={13} /> Approve
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Approved</span>
                        )}
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
      {/* DASHBOARD CUSTOMIZATION MODAL */}
      {/* ========================================================================= */}
      {showCustomizeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCustomizeModal(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sliders size={18} color="#2563eb" />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Customize Admin Dashboard
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '6px 0 0' }}>
                  Personalize which metrics, tables, and operational action hubs appear on your executive page.
                </p>
              </div>

              <button
                onClick={() => setShowCustomizeModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 24px',
                borderBottom: '1px solid #f1f5f9',
                background: '#f8fafc',
              }}
            >
              {[
                { id: 'kpis', label: '📊 Primary KPI Cards', badge: `${Object.values(dashConfig.kpis).filter(Boolean).length}/8 visible` },
                { id: 'sections', label: '🏢 Major Sections & Tables', badge: `${Object.values(dashConfig.sections).filter(Boolean).length}/7 visible` },
                { id: 'layout', label: '📐 Drag & Reorder Layout', badge: 'Order & Widths' },
                { id: 'presets', label: '🎯 Layout Presets & Density', badge: 'Quick Setup' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCustomizerTab(tab.id as any)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: customizerTab === tab.id ? '#0f172a' : '#ffffff',
                    color: customizerTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                    border: customizerTab === tab.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      background: customizerTab === tab.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                      color: customizerTab === tab.id ? '#ffffff' : '#475569',
                      fontWeight: 600,
                    }}
                  >
                    {tab.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Modal Body / Tab Panes */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, maxHeight: 'calc(90vh - 220px)' }}>
              {/* TAB 1: KPIS */}
              {customizerTab === 'kpis' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Select which top-level KPI metric cards to render in the summary strip:
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const updated = { ...dashConfig, kpis: Object.keys(dashConfig.kpis).reduce((acc, k) => ({ ...acc, [k]: true }), {} as any) };
                          saveConfig(updated);
                        }}
                        style={{ fontSize: '11.5px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => {
                          const updated = { ...dashConfig, kpis: Object.keys(dashConfig.kpis).reduce((acc, k) => ({ ...acc, [k]: false }), {} as any) };
                          saveConfig(updated);
                        }}
                        style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                    {[
                      { key: 'orderBook', title: 'Active Order Book Value', desc: 'Total portfolio contract value & billing milestone tracking', icon: FolderKanban, color: '#2563eb', bg: '#eff6ff' },
                      { key: 'costIncurred', title: 'Total Project Cost Incurred', desc: 'Total money spent across materials, labour & vendors', icon: IndianRupee, color: '#dc2626', bg: '#fef2f2' },
                      { key: 'collections', title: 'Collections Received', desc: 'Realized client cash receipts and collection efficiency', icon: Wallet, color: '#059669', bg: '#ecfdf5' },
                      { key: 'workforce', title: 'Active Field Workforce', desc: 'Total live labourers deployed across all active job sites', icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
                      { key: 'approvals', title: 'Pending Materials & Approvals', desc: 'Material requests & site issues awaiting executive sign-off', icon: AlertCircle, color: '#d97706', bg: '#fffbeb' },
                      { key: 'escrowBalance', title: 'Verified Escrow & Capital', desc: 'Client advance funds held securely in escrow bank rails', icon: Receipt, color: '#0284c7', bg: '#f0f9ff' },
                      { key: 'grossMargin', title: 'Turnkey Gross Margin %', desc: 'Portfolio aggregate profit margin vs 20% benchmark target', icon: TrendingUp, color: '#059669', bg: '#ecfdf5' },
                      { key: 'delayedSites', title: 'Schedule Health & Delayed Alert', desc: 'Count of active sites behind target timeline milestones', icon: Timer, color: '#d97706', bg: '#fffbeb' },
                    ].map((item) => {
                      const isEnabled = dashConfig.kpis[item.key as keyof typeof dashConfig.kpis];
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.key}
                          onClick={() => toggleKpi(item.key as any)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            borderRadius: '10px',
                            border: isEnabled ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            background: isEnabled ? '#f8fafc' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={18} color={item.color} />
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                            </div>
                          </div>

                          <div
                            style={{
                              width: '42px',
                              height: '24px',
                              borderRadius: '12px',
                              background: isEnabled ? '#2563eb' : '#cbd5e1',
                              position: 'relative',
                              transition: 'background 0.2s ease',
                              flexShrink: 0,
                              marginLeft: '12px',
                            }}
                          >
                            <div
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                position: 'absolute',
                                top: '3px',
                                left: isEnabled ? '21px' : '3px',
                                transition: 'left 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: SECTIONS */}
              {customizerTab === 'sections' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Control which operational blocks and widgets display on the page:
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const updated = { ...dashConfig, sections: Object.keys(dashConfig.sections).reduce((acc, k) => ({ ...acc, [k]: true }), {} as any) };
                          saveConfig(updated);
                        }}
                        style={{ fontSize: '11.5px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => {
                          const updated = { ...dashConfig, sections: Object.keys(dashConfig.sections).reduce((acc, k) => ({ ...acc, [k]: false }), {} as any) };
                          saveConfig(updated);
                        }}
                        style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { key: 'attentionBanner', title: 'Critical Attention Banner', desc: 'Displays urgent alerts for delayed sites, open bottlenecks, and pending requests', icon: ShieldAlert, color: '#dc2626', bg: '#fef2f2' },
                      { key: 'perspectiveTabs', title: 'Module Perspective Tabs', desc: 'Top tabs switcher (Executive Cockpit, Finance, Workforce Pulse, Procurement)', icon: LayoutGrid, color: '#0f172a', bg: '#f1f5f9' },
                      { key: 'projectMatrix', title: 'Active Project Portfolio Matrix', desc: 'Complete interactive table of all active sites, progress bars, budget burn & statuses', icon: FolderKanban, color: '#2563eb', bg: '#eff6ff' },
                      { key: 'tradeDistribution', title: 'Workforce Deployment by Trade', desc: 'Breakdown of Carpenters, Electricians, Plumbers, POP & Helpers across active sites', icon: HardHat, color: '#059669', bg: '#ecfdf5' },
                      { key: 'pendingMaterials', title: 'Materials Needing Sign-Off Widget', desc: 'Side card with 1-click owner approvals for urgent site material requests', icon: Package, color: '#2563eb', bg: '#eff6ff' },
                      { key: 'siteIssues', title: 'Site Bottlenecks & Issues Widget', desc: 'Side card for instant resolution of reported site blockers', icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2' },
                      { key: 'activityFeed', title: 'Live Operational Activity Feed', desc: 'Real-time timeline audit stream of logs, inspections, and site updates', icon: Clock, color: '#64748b', bg: '#f8fafc' },
                    ].map((item) => {
                      const isEnabled = dashConfig.sections[item.key as keyof typeof dashConfig.sections];
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.key}
                          onClick={() => toggleSection(item.key as any)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            borderRadius: '10px',
                            border: isEnabled ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                            background: isEnabled ? '#f8fafc' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={18} color={item.color} />
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                            </div>
                          </div>

                          <div
                            style={{
                              width: '42px',
                              height: '24px',
                              borderRadius: '12px',
                              background: isEnabled ? '#0f172a' : '#cbd5e1',
                              position: 'relative',
                              transition: 'background 0.2s ease',
                              flexShrink: 0,
                              marginLeft: '12px',
                            }}
                          >
                            <div
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                position: 'absolute',
                                top: '3px',
                                left: isEnabled ? '21px' : '3px',
                                transition: 'left 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: DRAG & REORDER LAYOUT */}
              {customizerTab === 'layout' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Top Help Banner */}
                  <div style={{ padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Move size={16} color="#2563eb" />
                      <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        Visual Drag-and-Drop & Grid Placement Guide
                      </h3>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      • <b>On Dashboard</b>: Click <b>"⚙️ Edit Layout"</b> in the top right to drag & drop cards directly on the live page or resize them.<br />
                      • <b>Here in Modal</b>: Use the <b>[↑ Move Up]</b> and <b>[↓ Move Down]</b> buttons below to adjust exact slot sequence, and configure column widths for every section.
                    </p>
                  </div>

                  {/* Section A: KPI Cards Sequence */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                          1. Primary KPI Metric Cards Sequence ({dashConfig.kpiOrder.length} slots)
                        </h4>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Cards render left-to-right across the top KPI strip</span>
                      </div>
                      <button
                        onClick={() => {
                          const updated: DashboardConfig = { ...dashConfig, kpiOrder: [...DEFAULT_KPI_ORDER] };
                          updateConfig(updated);
                          showToast('Reset KPI order to default sequence', 'success');
                        }}
                        style={{ fontSize: '11.5px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                      >
                        Reset Sequence
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dashConfig.kpiOrder.map((kpiKey, idx) => {
                        const kpiNames: Record<KpiId, { name: string; desc: string }> = {
                          orderBook: { name: 'Total Order Book', desc: 'Active project pipeline value & site counts' },
                          costIncurred: { name: 'Actual Cost Incurred', desc: 'Real-time expenditure vs approved budget' },
                          collections: { name: 'Collected vs Invoiced', desc: 'Cash collected vs pending receivables' },
                          workforce: { name: 'Active Field Force', desc: 'On-duty worker count and site-wise drilldown' },
                          approvals: { name: 'Pending Approvals', desc: 'Action bottlenecks for materials & issues' },
                          escrowBalance: { name: 'Verified Escrow Balance', desc: 'Digital bank escrow capital protection' },
                          grossMargin: { name: 'Project Gross Margin', desc: 'Turnkey margin % vs targeted thresholds' },
                          delayedSites: { name: 'Schedule Health', desc: 'Flags sites behind schedule or needing help' },
                        };
                        const info = kpiNames[kpiKey];
                        const isVisible = dashConfig.kpis[kpiKey];

                        return (
                          <div
                            key={kpiKey}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                background: '#0f172a',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 800,
                              }}>
                                #{idx + 1}
                              </span>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                  {info.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  {info.desc}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: isVisible ? '#ecfdf5' : '#f1f5f9',
                                color: isVisible ? '#059669' : '#64748b',
                                border: isVisible ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                              }}>
                                {isVisible ? 'Visible' : 'Hidden'}
                              </span>

                              <div style={{ display: 'flex', gap: '3px' }}>
                                <button
                                  onClick={() => moveKpi(idx, -1)}
                                  disabled={idx === 0}
                                  style={{
                                    background: idx === 0 ? '#f8fafc' : '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    color: idx === 0 ? '#94a3b8' : '#0f172a',
                                    fontWeight: 700,
                                  }}
                                  title="Move Left / Earlier"
                                >
                                  ↑ Move Up
                                </button>
                                <button
                                  onClick={() => moveKpi(idx, 1)}
                                  disabled={idx === dashConfig.kpiOrder.length - 1}
                                  style={{
                                    background: idx === dashConfig.kpiOrder.length - 1 ? '#f8fafc' : '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    cursor: idx === dashConfig.kpiOrder.length - 1 ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    color: idx === dashConfig.kpiOrder.length - 1 ? '#94a3b8' : '#0f172a',
                                    fontWeight: 700,
                                  }}
                                  title="Move Right / Later"
                                >
                                  ↓ Move Down
                                </button>
                              </div>

                              <button
                                onClick={() => toggleKpi(kpiKey)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '4px',
                                  background: isVisible ? '#ffffff' : '#eff6ff',
                                  color: isVisible ? '#64748b' : '#2563eb',
                                  cursor: 'pointer',
                                }}
                              >
                                {isVisible ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section B: Cockpit Grid Components & Column Spans */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                          2. Cockpit Widgets Sequence & Flexible Grid Width ({dashConfig.widgetOrder.length} Components)
                        </h4>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Choose column width and arrange top-to-bottom order</span>
                      </div>
                      <button
                        onClick={() => {
                          const updated: DashboardConfig = {
                            ...dashConfig,
                            widgetOrder: [...DEFAULT_WIDGET_ORDER],
                            widgetWidths: { ...DEFAULT_WIDGET_WIDTHS },
                          };
                          updateConfig(updated);
                          showToast('Reset Cockpit widgets to default sequence and widths', 'success');
                        }}
                        style={{ fontSize: '11.5px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                      >
                        Reset Layout
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {dashConfig.widgetOrder.map((widgetId, idx) => {
                        const widgetNames: Record<WidgetId, { name: string; desc: string }> = {
                          projectMatrix: { name: 'Active Project Portfolio Matrix', desc: 'Full turnkey project table with progress bars, search, and site links' },
                          tradeDistribution: { name: 'Field Workforce Deployment by Trade', desc: 'Card tiles of carpenters, civil, marble, electrical, painting' },
                          pendingMaterials: { name: 'Materials Needing Sign-Off', desc: 'Pending purchase requisitions with 1-click director approvals' },
                          siteIssues: { name: 'Site Issues & Bottlenecks', desc: 'Live alerts with fast resolution sign-offs' },
                          activityFeed: { name: 'Live Operational Audit Feed', desc: 'Real-time telemetry stream of all tasks, updates, and requisitions' },
                        };
                        const info = widgetNames[widgetId];
                        const isVisible = dashConfig.sections[widgetId];
                        const currentWidth = dashConfig.widgetWidths[widgetId] || (widgetId === 'projectMatrix' || widgetId === 'tradeDistribution' ? 'wide' : 'narrow');

                        return (
                          <div
                            key={widgetId}
                            style={{
                              padding: '12px 16px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '6px',
                                  background: '#0f172a',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                }}>
                                  #{idx + 1}
                                </span>
                                <div>
                                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                                    {info.name}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {info.desc}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  background: isVisible ? '#ecfdf5' : '#f1f5f9',
                                  color: isVisible ? '#059669' : '#64748b',
                                  border: isVisible ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                                }}>
                                  {isVisible ? 'Visible' : 'Hidden'}
                                </span>

                                <div style={{ display: 'flex', gap: '3px' }}>
                                  <button
                                    onClick={() => moveWidget(idx, -1)}
                                    disabled={idx === 0}
                                    style={{
                                      background: idx === 0 ? '#f8fafc' : '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '4px',
                                      padding: '4px 8px',
                                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                      fontSize: '11px',
                                      color: idx === 0 ? '#94a3b8' : '#0f172a',
                                      fontWeight: 700,
                                    }}
                                    title="Move Component Up"
                                  >
                                    ↑ Up
                                  </button>
                                  <button
                                    onClick={() => moveWidget(idx, 1)}
                                    disabled={idx === dashConfig.widgetOrder.length - 1}
                                    style={{
                                      background: idx === dashConfig.widgetOrder.length - 1 ? '#f8fafc' : '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '4px',
                                      padding: '4px 8px',
                                      cursor: idx === dashConfig.widgetOrder.length - 1 ? 'not-allowed' : 'pointer',
                                      fontSize: '11px',
                                      color: idx === dashConfig.widgetOrder.length - 1 ? '#94a3b8' : '#0f172a',
                                      fontWeight: 700,
                                    }}
                                    title="Move Component Down"
                                  >
                                    ↓ Down
                                  </button>
                                </div>

                                <button
                                  onClick={() => toggleSection(widgetId)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '4px',
                                    background: isVisible ? '#ffffff' : '#eff6ff',
                                    color: isVisible ? '#64748b' : '#2563eb',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {isVisible ? 'Hide' : 'Show'}
                                </button>
                              </div>
                            </div>

                            {/* Width Selection Button Group */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Grid Width:</span>
                              {(['full', 'wide', 'half', 'narrow'] as WidgetWidth[]).map((w) => (
                                <button
                                  key={w}
                                  onClick={() => setWidgetWidth(widgetId, w)}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    background: currentWidth === w ? '#0f172a' : '#ffffff',
                                    color: currentWidth === w ? '#ffffff' : '#334155',
                                    border: currentWidth === w ? '1px solid #0f172a' : '1px solid #cbd5e1',
                                    transition: 'all 0.12s ease',
                                  }}
                                >
                                  {w === 'full' ? '100% Full (Span 12)' : w === 'wide' ? '67% Wide (Span 8)' : w === 'half' ? '50% Half (Span 6)' : '33% Narrow (Span 4)'}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRESETS & DENSITY */}
              {customizerTab === 'presets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                      Curated Role & Focus Presets
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                      Choose a pre-configured template tailored to your current executive focus:
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {[
                      {
                        id: 'full',
                        title: '🌟 360° Complete Cockpit',
                        tag: 'Recommended',
                        desc: 'Shows all 8 KPIs, active project portfolio matrix, side action hubs, trade charts, and activity feeds.',
                        bg: '#f8fafc',
                      },
                      {
                        id: 'finance',
                        title: '💰 Finance & Cash Control',
                        tag: 'CFO / Owner Mode',
                        desc: 'Prioritizes Order book, Cost incurred, Collections received, Gross margin %, and Escrow bank balance.',
                        bg: '#f8fafc',
                      },
                      {
                        id: 'operations',
                        title: '👷 Site Operations & Labour',
                        tag: 'COO / Field Mode',
                        desc: 'Prioritizes Live workers, Delayed site flags, Pending material approvals, and trade breakdowns.',
                        bg: '#f8fafc',
                      },
                      {
                        id: 'minimal',
                        title: '⚡ Minimalist / Focus View',
                        tag: 'Clean View',
                        desc: 'Only the 4 essential financial & labour KPIs and active project portfolio table for distraction-free monitoring.',
                        bg: '#f8fafc',
                      },
                    ].map((preset) => (
                      <div
                        key={preset.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '16px',
                          background: preset.bg,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{preset.title}</span>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8' }}>
                              {preset.tag}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                            {preset.desc}
                          </p>
                        </div>
                        <button
                          onClick={() => applyPreset(preset.id as any)}
                          className="btn-secondary"
                          style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '7px 0', fontWeight: 700 }}
                        >
                          Apply Preset
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Layout Density */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
                      Visual Density
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { id: 'comfortable', label: 'Comfortable (Standard padding & airy cards)' },
                        { id: 'compact', label: 'Compact (High information density)' },
                      ].map((den) => (
                        <button
                          key={den.id}
                          onClick={() => {
                            const updated = { ...dashConfig, layoutDensity: den.id as any };
                            saveConfig(updated);
                          }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: dashConfig.layoutDensity === den.id ? '#0f172a' : '#ffffff',
                            color: dashConfig.layoutDensity === den.id ? '#ffffff' : 'var(--text-secondary)',
                            border: dashConfig.layoutDensity === den.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
                          }}
                        >
                          {den.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <button
                onClick={resetToDefault}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                <span>Reset to Factory Defaults</span>
              </button>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  ✓ Autosaved to local profile
                </span>
                <button
                  onClick={() => {
                    setShowCustomizeModal(false);
                    showToast('Dashboard layout saved successfully', 'success');
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
