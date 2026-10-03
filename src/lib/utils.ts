import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(dateStr: string): string {
  const now = new Date('2026-10-01T17:30:00');
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'On Track':
    case 'Completed':
    case 'Approved':
    case 'Delivered':
    case 'Resolved':
    case 'Closed':
    case 'Present':
    case 'Good':
      return 'text-emerald-700';
    case 'Attention':
    case 'In Progress':
    case 'Pending':
    case 'In Review':
    case 'Ordered':
    case 'Normal':
    case 'Half Day':
    case 'Medium':
      return 'text-amber-700';
    case 'Delayed':
    case 'Rejected':
    case 'Critical':
    case 'High':
    case 'Absent':
      return 'text-red-700';
    case 'Not Started':
    case 'Low':
      return 'text-slate-600';
    default:
      return 'text-slate-700';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'On Track':
    case 'Completed':
    case 'Approved':
    case 'Delivered':
    case 'Resolved':
    case 'Closed':
    case 'Present':
    case 'Good':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Attention':
    case 'In Progress':
    case 'Pending':
    case 'In Review':
    case 'Ordered':
    case 'Normal':
    case 'Half Day':
    case 'Medium':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Delayed':
    case 'Rejected':
    case 'Critical':
    case 'High':
    case 'Absent':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'Not Started':
    case 'Low':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Partially Delivered':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-emerald-500';
  if (progress >= 50) return 'bg-amber-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}
