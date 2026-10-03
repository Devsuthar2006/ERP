'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { Bell, CheckCircle2, Package, AlertTriangle, FileText, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

const iconMap: Record<string, any> = {
  daily_update: FileText,
  material_request: Package,
  material_approval: CheckCircle2,
  issue: AlertTriangle,
  task_assignment: Users,
  project_delay: Clock,
  worker_update: Users,
  daily_report: FileText,
};

const colorMap: Record<string, string> = {
  daily_update: '#10b981',
  material_request: '#f59e0b',
  material_approval: '#10b981',
  issue: '#ef4444',
  task_assignment: '#3b82f6',
  project_delay: '#ef4444',
  worker_update: '#06b6d4',
  daily_report: '#a855f7',
};

export default function NotificationsPage() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();

  const notifications = state.notifications.filter(n => n.userId === user?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unread = notifications.filter(n => !n.read);

  const handleMarkAllRead = () => {
    if (user) dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: user.id });
  };

  const handleMarkRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Notifications</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary" style={{ fontSize: '13px' }}>
            Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notifications.map(notif => {
          const Icon = iconMap[notif.type] || Bell;
          const color = colorMap[notif.type] || '#60a5fa';
          return (
            <div
              key={notif.id}
              onClick={() => handleMarkRead(notif.id)}
              className="glass-card"
              style={{
                padding: '16px 20px', cursor: 'pointer',
                borderLeft: notif.read ? 'none' : `3px solid ${color}`,
                opacity: notif.read ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{notif.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{notif.message}</div>
                    </div>
                    {!notif.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '6px' }} />}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {notif.projectName && <span>{notif.projectName} • </span>}
                    {timeAgo(notif.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Bell size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No notifications</p>
        </div>
      )}
    </div>
  );
}
