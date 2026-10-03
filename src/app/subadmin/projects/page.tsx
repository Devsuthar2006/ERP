'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { getStatusBg, getProgressColor, formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default function SubadminProjects() {
  const { state } = useStore();
  const { user } = useAuth();
  const myProjects = state.projects.filter(p => user?.assignedProjectIds.includes(p.id));

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>My Projects</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>{myProjects.length} assigned projects</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
        {myProjects.map(project => {
          const thekedar = state.users.find(u => u.id === project.thekedarId);
          const tasks = state.tasks.filter(t => t.projectId === project.id);
          const completedTasks = tasks.filter(t => t.status === 'Completed').length;
          return (
            <Link key={project.id} href={`/subadmin/projects/${project.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{project.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{project.client} • {project.location}</p>
                  </div>
                  <span className={`status-badge ${getStatusBg(project.status)}`}>{project.status}</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{project.progress}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px' }}>
                    <div className={`progress-bar-fill ${getProgressColor(project.progress)}`} style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '13px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Workers:</span> <strong>{project.workerCount}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Tasks:</span> <strong>{completedTasks}/{tasks.length}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Thekedar:</span> <strong>{thekedar?.name?.split(' ')[0]}</strong></div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
