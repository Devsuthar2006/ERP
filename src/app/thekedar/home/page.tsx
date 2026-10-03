'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import {
  TrendingUp, Users, Package, AlertTriangle, FileText, Camera,
  ChevronRight, MapPin, Clock,
} from 'lucide-react';
import { getStatusBg, getProgressColor } from '@/lib/utils';

export default function ThekedarHome() {
  const { state } = useStore();
  const { user } = useAuth();

  if (!user) return null;

  const myProject = state.projects.find(p => p.thekedarId === user.id);
  const mySite = state.sites.find(s => s.thekedarId === user.id);
  const myTasks = state.tasks.filter(t => t.thekedarId === user.id && t.projectId === myProject?.id);
  const todayTasks = myTasks.filter(t => t.status !== 'Completed');
  const myWorkers = state.workers.filter(w => w.thekedarId === user.id && w.assignedSiteId === mySite?.id);

  const quickActions = [
    { href: '/thekedar/update-progress', label: 'Update Progress', icon: TrendingUp, color: '#2563eb', bg: '#eff6ff' },
    { href: '/thekedar/workers', label: 'Workers', icon: Users, color: '#059669', bg: '#ecfdf5' },
    { href: '/thekedar/request-material', label: 'Request Material', icon: Package, color: '#d97706', bg: '#fffbeb' },
    { href: '/thekedar/report-issue', label: 'Report Issue', icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2' },
    { href: '/thekedar/daily-report', label: 'Daily Report', icon: FileText, color: '#7c3aed', bg: '#faf5ff' },
    { href: '/thekedar/site-photos', label: 'Site Photos', icon: Camera, color: '#0284c7', bg: '#f0f9ff' },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '20px', paddingTop: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
          Good Morning, {user.name.split(' ')[0]}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thursday, 1 October 2026</p>
      </div>

      {/* Current Project */}
      {myProject && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{myProject.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <MapPin size={12} /> {myProject.location}
              </div>
            </div>
            <span className={`status-badge ${getStatusBg(myProject.status)}`}>{myProject.status}</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Overall Progress</span>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{myProject.progress}%</span>
            </div>
            <div className="progress-bar" style={{ height: '10px', borderRadius: '5px' }}>
              <div className={`progress-bar-fill ${getProgressColor(myProject.progress)}`} style={{ width: `${myProject.progress}%`, borderRadius: '5px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Workers: </span><span style={{ fontWeight: 600 }}>{myWorkers.length}</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Tasks: </span><span style={{ fontWeight: 600 }}>{todayTasks.length} pending</span></div>
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>Today's Tasks</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {myTasks.slice(0, 5).map(task => (
            <div key={task.id} className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{task.name}</div>
                <div className="progress-bar" style={{ width: '100%', maxWidth: '200px' }}>
                  <div className={`progress-bar-fill ${getProgressColor(task.progress)}`} style={{ width: `${task.progress}%` }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{task.progress}%</span>
                <span className={`status-badge ${getStatusBg(task.status)}`} style={{ fontSize: '10px' }}>{task.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="quick-action-btn">
                <div className="icon-wrap" style={{ background: action.bg }}>
                  <Icon size={22} style={{ color: action.color }} />
                </div>
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
