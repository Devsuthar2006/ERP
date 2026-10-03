'use client';
// ============================================
// Application State Store (React Context + localStorage)
// ============================================
import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import {
  AppState,
  MaterialRequest,
  Issue,
  DailyUpdate,
  DailyReport,
  Attendance,
  Notification,
  AuditEntry,
  SitePhoto,
  Task,
  User,
  Worker,
  StaffEmployee,
  PayrollRecord,
  PaymentGatewayConfig,
  ClientPaymentLink,
  MakerCheckerApproval,
  StatutoryChallan,
  VirtualEscrowPool,
} from './types';
import { initialState } from './data';

type Action =
  | { type: 'INIT'; payload: AppState }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; changes: Partial<User> } }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_WORKER'; payload: Worker }
  | { type: 'UPDATE_WORKER'; payload: { id: string; changes: Partial<Worker> } }
  | { type: 'DELETE_WORKER'; payload: string }
  | { type: 'ADD_DAILY_UPDATE'; payload: DailyUpdate }
  | { type: 'ADD_DAILY_REPORT'; payload: DailyReport }
  | { type: 'ADD_MATERIAL_REQUEST'; payload: MaterialRequest }
  | { type: 'UPDATE_MATERIAL_REQUEST'; payload: { id: string; changes: Partial<MaterialRequest> } }
  | { type: 'ADD_ISSUE'; payload: Issue }
  | { type: 'UPDATE_ISSUE'; payload: { id: string; changes: Partial<Issue> } }
  | { type: 'SET_ATTENDANCE'; payload: Attendance[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ'; payload: string }
  | { type: 'ADD_AUDIT'; payload: AuditEntry }
  | { type: 'ADD_SITE_PHOTO'; payload: SitePhoto }
  | { type: 'UPDATE_TASK'; payload: { id: string; changes: Partial<Task> } }
  | { type: 'UPDATE_PROJECT_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'PROCESS_PAYROLL_BATCH'; payload: { recordIds: string[]; gatewayProvider?: string; paymentRail?: string } }
  | { type: 'DISBURSE_SINGLE_PAYROLL'; payload: { recordId: string; utr?: string } }
  | { type: 'TOPUP_GATEWAY_BALANCE'; payload: number }
  | { type: 'UPDATE_GATEWAY_CONFIG'; payload: Partial<PaymentGatewayConfig> }
  | { type: 'RESET_PAYROLL_STATUS'; payload?: string[] }
  | { type: 'APPROVE_MAKER_CHECKER'; payload: { approvalId: string; checkerName: string; checkerRole: string } }
  | { type: 'REJECT_MAKER_CHECKER'; payload: { approvalId: string; reason?: string } }
  | { type: 'CREATE_PAYMENT_LINK'; payload: ClientPaymentLink }
  | { type: 'MARK_PAYMENT_LINK_PAID'; payload: { linkId: string; paymentMethod: 'UPI' | 'NetBanking' | 'Corporate Card' } }
  | { type: 'DEPOSIT_STATUTORY_CHALLAN'; payload: { challanId: string } }
  | { type: 'TOGGLE_ESCROW_AUTO_SWEEP'; payload: { poolId: string } };


function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    case 'ADD_USER':
      return { ...state, users: [action.payload, ...state.users] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.payload.id ? { ...u, ...action.payload.changes } : u
        ),
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload),
      };
    case 'ADD_WORKER':
      return { ...state, workers: [action.payload, ...state.workers] };
    case 'UPDATE_WORKER':
      return {
        ...state,
        workers: state.workers.map(w =>
          w.id === action.payload.id ? { ...w, ...action.payload.changes } : w
        ),
      };
    case 'DELETE_WORKER':
      return {
        ...state,
        workers: state.workers.filter(w => w.id !== action.payload),
      };
    case 'ADD_DAILY_UPDATE':
      return { ...state, dailyUpdates: [action.payload, ...state.dailyUpdates] };
    case 'ADD_DAILY_REPORT':
      return { ...state, dailyReports: [action.payload, ...state.dailyReports] };
    case 'ADD_MATERIAL_REQUEST':
      return { ...state, materialRequests: [action.payload, ...state.materialRequests] };
    case 'UPDATE_MATERIAL_REQUEST':
      return {
        ...state,
        materialRequests: state.materialRequests.map(mr =>
          mr.id === action.payload.id ? { ...mr, ...action.payload.changes } : mr
        ),
      };
    case 'ADD_ISSUE':
      return { ...state, issues: [action.payload, ...state.issues] };
    case 'UPDATE_ISSUE':
      return {
        ...state,
        issues: state.issues.map(iss =>
          iss.id === action.payload.id ? { ...iss, ...action.payload.changes } : iss
        ),
      };
    case 'SET_ATTENDANCE':
      return {
        ...state,
        attendance: [
          ...state.attendance.filter(a => !action.payload.find(na => na.workerId === a.workerId && na.date === a.date)),
          ...action.payload,
        ],
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.userId === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'ADD_AUDIT':
      return { ...state, auditLog: [action.payload, ...state.auditLog] };
    case 'ADD_SITE_PHOTO':
      return { ...state, sitePhotos: [action.payload, ...state.sitePhotos] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.changes } : t
        ),
      };
    case 'UPDATE_PROJECT_PROGRESS':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? { ...p, progress: action.payload.progress } : p
        ),
        sites: state.sites.map(s => {
          const proj = state.projects.find(p => p.id === action.payload.id);
          if (proj && s.id === proj.siteId) {
            return { ...s, lastUpdate: 'Just now' };
          }
          return s;
        }),
      };
    case 'PROCESS_PAYROLL_BATCH': {
      const { recordIds, gatewayProvider, paymentRail } = action.payload;
      const targetRecords = state.payrollRecords.filter(r => recordIds.includes(r.id) && r.status !== 'Disbursed');
      const totalDisbursed = targetRecords.reduce((sum, r) => sum + r.netPayout, 0);
      const now = new Date().toISOString();

      const updatedRecords = state.payrollRecords.map(r => {
        if (recordIds.includes(r.id)) {
          const utr = r.utrNumber || `UTR${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
          return {
            ...r,
            status: 'Disbursed' as const,
            gatewayProvider: (gatewayProvider as any) || state.gatewayConfig.provider,
            paymentRail: (paymentRail as any) || r.paymentRail,
            utrNumber: utr,
            disbursedAt: now,
          };
        }
        return r;
      });

      const updatedBalance = Math.max(0, state.gatewayConfig.balance - totalDisbursed);
      const updatedUsedToday = state.gatewayConfig.usedToday + totalDisbursed;

      return {
        ...state,
        payrollRecords: updatedRecords,
        gatewayConfig: {
          ...state.gatewayConfig,
          balance: updatedBalance,
          usedToday: updatedUsedToday,
        },
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            userId: 'user-owner',
            userName: 'Rajesh Singhania',
            action: 'Batch Payroll Disbursed',
            entityType: 'PaymentGateway',
            entityId: `BATCH-${Date.now().toString().slice(-6)}`,
            details: `Disbursed ₹${totalDisbursed.toLocaleString('en-IN')} across ${targetRecords.length} accounts via ${state.gatewayConfig.provider}`,
            createdAt: now,
          },
          ...state.auditLog,
        ],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            type: 'daily_update',
            title: 'Gateway Payroll Executed',
            message: `Disbursed ₹${totalDisbursed.toLocaleString('en-IN')} for ${targetRecords.length} beneficiaries via ${state.gatewayConfig.provider}`,
            userId: 'user-owner',
            read: false,
            createdAt: now,
          },
          ...state.notifications,
        ],
      };
    }
    case 'DISBURSE_SINGLE_PAYROLL': {
      const record = state.payrollRecords.find(r => r.id === action.payload.recordId);
      if (!record || record.status === 'Disbursed') return state;

      const now = new Date().toISOString();
      const utr = action.payload.utr || `UTR${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        ...state,
        payrollRecords: state.payrollRecords.map(r =>
          r.id === action.payload.recordId
            ? { ...r, status: 'Disbursed' as const, utrNumber: utr, disbursedAt: now }
            : r
        ),
        gatewayConfig: {
          ...state.gatewayConfig,
          balance: Math.max(0, state.gatewayConfig.balance - record.netPayout),
          usedToday: state.gatewayConfig.usedToday + record.netPayout,
        },
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            userId: 'user-owner',
            userName: 'Rajesh Singhania',
            action: 'Single Instant Gateway Payout',
            entityType: 'PayrollRecord',
            entityId: record.id,
            details: `Disbursed ₹${record.netPayout.toLocaleString('en-IN')} to ${record.recipientName} (${record.paymentRail}) • UTR: ${utr}`,
            createdAt: now,
          },
          ...state.auditLog,
        ],
      };
    }
    case 'TOPUP_GATEWAY_BALANCE': {
      const newBal = state.gatewayConfig.balance + action.payload;
      return {
        ...state,
        gatewayConfig: { ...state.gatewayConfig, balance: newBal },
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            userId: 'user-owner',
            userName: 'Rajesh Singhania',
            action: 'Gateway Escrow Top-up',
            entityType: 'PaymentGateway',
            entityId: state.gatewayConfig.accountNumber,
            details: `Funded ₹${action.payload.toLocaleString('en-IN')} to virtual escrow balance`,
            createdAt: new Date().toISOString(),
          },
          ...state.auditLog,
        ],
      };
    }
    case 'UPDATE_GATEWAY_CONFIG': {
      return {
        ...state,
        gatewayConfig: { ...state.gatewayConfig, ...action.payload },
      };
    }
    case 'RESET_PAYROLL_STATUS': {
      return {
        ...state,
        payrollRecords: state.payrollRecords.map(r => ({
          ...r,
          status: 'Pending' as const,
          utrNumber: undefined,
          disbursedAt: undefined,
        })),
      };
    }
    case 'APPROVE_MAKER_CHECKER': {
      const now = new Date().toISOString();
      const approval = (state.makerCheckerApprovals || []).find(a => a.id === action.payload.approvalId);
      if (!approval) return state;

      // Update approval item
      const updatedApprovals = (state.makerCheckerApprovals || []).map(a =>
        a.id === action.payload.approvalId
          ? {
              ...a,
              status: 'Approved & Executed' as const,
              checkerName: action.payload.checkerName,
              checkerRole: action.payload.checkerRole,
              approvedAt: now,
            }
          : a
      );

      // Also disburse matching records if it's a batch
      let updatedPayroll = state.payrollRecords;
      let disbursedAmount = 0;

      if (approval.type === 'Staff Salary Batch') {
        updatedPayroll = state.payrollRecords.map(r => {
          if (r.type === 'Staff Salary' && r.status !== 'Disbursed') {
            disbursedAmount += r.netPayout;
            return {
              ...r,
              status: 'Disbursed' as const,
              utrNumber: `UTR${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
              disbursedAt: now,
            };
          }
          return r;
        });
      } else if (approval.type === 'Labour Wage Run') {
        updatedPayroll = state.payrollRecords.map(r => {
          if (r.type === 'Labour Wages' && r.status !== 'Disbursed') {
            disbursedAmount += r.netPayout;
            return {
              ...r,
              status: 'Disbursed' as const,
              utrNumber: `UTR${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
              disbursedAt: now,
            };
          }
          return r;
        });
      } else {
        disbursedAmount = approval.totalAmount;
      }

      return {
        ...state,
        makerCheckerApprovals: updatedApprovals,
        payrollRecords: updatedPayroll,
        gatewayConfig: {
          ...state.gatewayConfig,
          balance: Math.max(0, state.gatewayConfig.balance - disbursedAmount),
          usedToday: state.gatewayConfig.usedToday + disbursedAmount,
        },
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            userId: 'user-owner',
            userName: action.payload.checkerName,
            action: 'Maker-Checker Approved & Disbursed',
            entityType: 'MakerCheckerApproval',
            entityId: approval.id,
            details: `Approved "${approval.title}" for ₹${approval.totalAmount.toLocaleString('en-IN')}. Released via Banking Core.`,
            createdAt: now,
          },
          ...state.auditLog,
        ],
      };
    }
    case 'REJECT_MAKER_CHECKER': {
      return {
        ...state,
        makerCheckerApprovals: (state.makerCheckerApprovals || []).map(a =>
          a.id === action.payload.approvalId
            ? { ...a, status: 'Rejected' as const, notes: action.payload.reason || 'Rejected by checker' }
            : a
        ),
      };
    }
    case 'CREATE_PAYMENT_LINK': {
      return {
        ...state,
        clientPaymentLinks: [action.payload, ...(state.clientPaymentLinks || [])],
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            userId: 'user-owner',
            userName: 'Rajesh Singhania',
            action: 'Client Payment Link Generated',
            entityType: 'ClientPaymentLink',
            entityId: action.payload.linkNumber,
            details: `Generated link for ${action.payload.clientName} (${action.payload.projectName}) for ₹${action.payload.amount.toLocaleString('en-IN')}`,
            createdAt: new Date().toISOString(),
          },
          ...state.auditLog,
        ],
      };
    }
    case 'MARK_PAYMENT_LINK_PAID': {
      const now = new Date().toISOString();
      const link = (state.clientPaymentLinks || []).find(l => l.id === action.payload.linkId);
      if (!link || link.status === 'Paid') return state;

      const utr = `UTR${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        ...state,
        clientPaymentLinks: (state.clientPaymentLinks || []).map(l =>
          l.id === action.payload.linkId
            ? {
                ...l,
                status: 'Paid' as const,
                paymentMethod: action.payload.paymentMethod,
                paidAt: now,
                utrNumber: utr,
              }
            : l
        ),
        gatewayConfig: {
          ...state.gatewayConfig,
          balance: state.gatewayConfig.balance + link.amount, // Real Inflow!
        },
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            userId: 'client-inbound',
            userName: link.clientName,
            action: 'Inward Client Payment Captured',
            entityType: 'ClientPaymentLink',
            entityId: link.linkNumber,
            details: `Received ₹${link.amount.toLocaleString('en-IN')} via ${action.payload.paymentMethod} for ${link.projectName} • Bank UTR: ${utr}`,
            createdAt: now,
          },
          ...state.auditLog,
        ],
      };
    }
    case 'DEPOSIT_STATUTORY_CHALLAN': {
      const now = new Date().toISOString();
      const challan = (state.statutoryChallans || []).find(c => c.id === action.payload.challanId);
      if (!challan) return state;

      return {
        ...state,
        statutoryChallans: (state.statutoryChallans || []).map(c =>
          c.id === action.payload.challanId
            ? {
                ...c,
                status: 'Deposited to Treasury' as const,
                challanDate: now.split('T')[0],
                ackNumber: `NSDL${Date.now().toString().slice(-8)}`,
              }
            : c
        ),
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            userId: 'user-owner',
            userName: 'Rajesh Singhania',
            action: 'Statutory Tax Deposited',
            entityType: 'StatutoryChallan',
            entityId: challan.challanNumber,
            details: `Remitted ₹${challan.totalTaxAmount.toLocaleString('en-IN')} for ${challan.section} directly to Govt Treasury`,
            createdAt: now,
          },
          ...state.auditLog,
        ],
      };
    }
    case 'TOGGLE_ESCROW_AUTO_SWEEP': {
      return {
        ...state,
        escrowPools: (state.escrowPools || []).map(p =>
          p.id === action.payload.poolId ? { ...p, autoSweepEnabled: !p.autoSweepEnabled } : p
        ),
      };
    }
    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'interior-ops-state';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = React.useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({
          type: 'INIT',
          payload: {
            ...initialState,
            ...parsed,
            staffEmployees: parsed.staffEmployees && parsed.staffEmployees.length > 0 ? parsed.staffEmployees : initialState.staffEmployees,
            payrollRecords: parsed.payrollRecords && parsed.payrollRecords.length > 0 ? parsed.payrollRecords : initialState.payrollRecords,
            gatewayConfig: parsed.gatewayConfig || initialState.gatewayConfig,
            clientPaymentLinks: parsed.clientPaymentLinks && parsed.clientPaymentLinks.length > 0 ? parsed.clientPaymentLinks : initialState.clientPaymentLinks,
            makerCheckerApprovals: parsed.makerCheckerApprovals && parsed.makerCheckerApprovals.length > 0 ? parsed.makerCheckerApprovals : initialState.makerCheckerApprovals,
            statutoryChallans: parsed.statutoryChallans && parsed.statutoryChallans.length > 0 ? parsed.statutoryChallans : initialState.statutoryChallans,
            escrowPools: parsed.escrowPools && parsed.escrowPools.length > 0 ? parsed.escrowPools : initialState.escrowPools,
          },
        });
      }
    } catch {
      // use initial state
    }
    setHydrated(true);
  }, []);


  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // ignore storage errors
      }
    }
  }, [state, hydrated]);

  if (!hydrated) {
    return null;
  }

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// Helper: generate unique ID
export function genId(prefix: string = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Helper: reset to initial seed data
export function useResetData() {
  const { dispatch } = useStore();
  return useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'INIT', payload: initialState });
  }, [dispatch]);
}
