'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { getStatusBg, getProgressColor } from '@/lib/utils';

export default function ThekedarTasks() {
  const { state } = useStore();
  const { user } = useAuth();
  const myProject = state.projects.find(p => p.thekedarId === user?.id);
  const myTasks = state.tasks.filter(t => t.thekedarId === user?.id && t.projectId === myProject?.id);

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Tasks</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{myProject?.name} — {myTasks.length} tasks</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {myTasks.map(task => (
          <div key={task.id} className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>{task.name}</span>
              <span className={`status-badge ${getStatusBg(task.status)}`} style={{ fontSize: '11px' }}>{task.status}</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: '8px', height: '8px' }}>
              <div className={`progress-bar-fill ${getProgressColor(task.progress)}`} style={{ width: `${task.progress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>{task.progress}% complete</span>
              <span className={`status-badge ${getStatusBg(task.priority)}`} style={{ fontSize: '10px' }}>{task.priority}</span>
            </div>
          </div>
        ))}
      </div>

      <Link href="/thekedar/update-progress" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '20px', textDecoration: 'none', justifyContent: 'center', fontSize: '15px' }}>
        Update Progress
      </Link>
    </div>
  );
}
