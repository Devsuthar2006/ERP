'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { MapPin, Users, Package, AlertTriangle, Clock, ArrowRight, ListTodo } from 'lucide-react';
import { getStatusBg, getProgressColor, timeAgo } from '@/lib/utils';

export default function SubadminDashboard() {
  const { state } = useStore();
  const { user } = useAuth();

  if (!user) return null;

  // Only assigned projects/sites
  const myProjects = state.projects.filter(p => user.assignedProjectIds.includes(p.id));
  const mySites = state.sites.filter(s => user.assignedSiteIds.includes(s.id));
  const myWorkers = mySites.reduce((sum, s) => sum + s.workerCount, 0);
  const myMR = state.materialRequests.filter(mr => myProjects.some(p => p.id === mr.projectId) && mr.status === 'Pending');
  const myIssues = state.issues.filter(i => myProjects.some(p => p.id === i.projectId) && i.status !== 'Resolved' && i.status !== 'Closed');
  const myTasks = state.tasks.filter(t => myProjects.some(p => p.id === t.projectId) && t.status === 'Delayed');
  const myNotifications = state.notifications.filter(n => n.userId === user.id && !n.read);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>
          Good Morning, {user.name.split(' ')[0]}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Thursday, 1 October 2026</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <div className="kpi-card blue">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>My Sites</p>
          <p style={{ fontSize: '32px', fontWeight: 700 }}>{mySites.length}</p>
        </div>
        <div className="kpi-card green">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Workers Today</p>
          <p style={{ fontSize: '32px', fontWeight: 700 }}>{myWorkers}</p>
        </div>
        <div className="kpi-card amber">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Pending Requests</p>
          <p style={{ fontSize: '32px', fontWeight: 700 }}>{myMR.length}</p>
        </div>
        <div className="kpi-card red">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Open Issues</p>
          <p style={{ fontSize: '32px', fontWeight: 700 }}>{myIssues.length}</p>
        </div>
        <div className="kpi-card purple">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Delayed Tasks</p>
          <p style={{ fontSize: '32px', fontWeight: 700 }}>{myTasks.length}</p>
        </div>
      </div>

      {/* My Sites */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>My Assigned Sites</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {myProjects.map(project => {
            const thekedar = state.users.find(u => u.id === project.thekedarId);
            return (
              <Link key={project.id} href={`/subadmin/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{project.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{project.location} • {thekedar?.name}</div>
                    </div>
                    <span className={`status-badge ${getStatusBg(project.status)}`} style={{ fontSize: '11px' }}>{project.status}</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: '8px' }}>
                    <div className={`progress-bar-fill ${getProgressColor(project.progress)}`} style={{ width: `${project.progress}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>{project.progress}% complete</span>
                    <span>{project.workerCount} workers</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Recent Activity</h2>
        {myNotifications.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No new activity</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {myNotifications.slice(0, 8).map((notif, i) => (
              <div key={notif.id} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < myNotifications.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', background: notif.type === 'issue' ? '#ef4444' : '#10b981' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{notif.message}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{notif.projectName} • {timeAgo(notif.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
