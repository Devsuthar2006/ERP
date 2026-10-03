'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { getStatusBg, getProgressColor, formatCurrency, formatDate, timeAgo } from '@/lib/utils';

export default function SubadminProjectDetail() {
  const params = useParams();
  const { state } = useStore();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const project = state.projects.find(p => p.id === params.id);

  // Access control
  if (!project || !user?.assignedProjectIds.includes(project.id)) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <ShieldAlert size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You don't have permission to view this site.</p>
        <Link href="/subadmin/projects" className="btn-primary" style={{ textDecoration: 'none' }}>Back to My Projects</Link>
      </div>
    );
  }

  const tasks = state.tasks.filter(t => t.projectId === project.id);
  const updates = state.dailyUpdates.filter(u => u.projectId === project.id);
  const materials = state.materialRequests.filter(mr => mr.projectId === project.id);
  const issues = state.issues.filter(i => i.projectId === project.id);
  const thekedar = state.users.find(u => u.id === project.thekedarId);

  const tabs = ['overview', 'tasks', 'materials', 'issues', 'updates'];

  return (
    <div className="animate-fade-in">
      <Link href="/subadmin/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{project.name}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{project.client} • {project.location} • Thekedar: {thekedar?.name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{project.progress}%</div>
            <span className={`status-badge ${getStatusBg(project.status)}`}>{project.status}</span>
          </div>
        </div>
        <div className="progress-bar" style={{ height: '10px', borderRadius: '5px' }}>
          <div className={`progress-bar-fill ${getProgressColor(project.progress)}`} style={{ width: `${project.progress}%`, borderRadius: '5px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{project.workerCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Workers</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{tasks.filter(t => t.status === 'Completed').length}/{tasks.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tasks Done</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{materials.filter(m => m.status === 'Pending').length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending MR</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{issues.filter(i => i.status === 'Open').length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Open Issues</div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.map(task => (
            <div key={task.id} className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>{task.name}</span>
                <span className={`status-badge ${getStatusBg(task.status)}`} style={{ fontSize: '11px' }}>{task.status}</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: '6px' }}>
                <div className={`progress-bar-fill ${getProgressColor(task.progress)}`} style={{ width: `${task.progress}%` }} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{task.progress}% • Due: {formatDate(task.dueDate)}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'materials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {materials.map(mr => (
            <div key={mr.id} className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{mr.requestId} • </span>
                  <span style={{ fontWeight: 600 }}>{mr.materialName}</span>
                </div>
                <span className={`status-badge ${getStatusBg(mr.status)}`} style={{ fontSize: '11px' }}>{mr.status}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{mr.quantity} {mr.unit} • {mr.reason}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>By: {mr.requestedByName} • {timeAgo(mr.createdAt)}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'issues' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {issues.map(issue => (
            <div key={issue.id} className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>{issue.title}</span>
                <span className={`status-badge ${getStatusBg(issue.status)}`} style={{ fontSize: '11px' }}>{issue.status}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{issue.description}</p>
              <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span className={`status-badge ${getStatusBg(issue.priority)}`} style={{ fontSize: '10px' }}>{issue.priority}</span>
                <span>{issue.reportedByName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'updates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {updates.map(u => (
            <div key={u.id} className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>{u.taskName}</span>
                <span className={`status-badge ${getStatusBg(u.status)}`} style={{ fontSize: '11px' }}>{u.status}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{u.description}</p>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.progress}% • {u.submittedByName} • {formatDate(u.date)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
