'use client';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { getStatusBg, timeAgo } from '@/lib/utils';

export default function SubadminIssues() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();
  const myProjects = state.projects.filter(p => user?.assignedProjectIds.includes(p.id));
  const myIssues = state.issues.filter(i => myProjects.some(p => p.id === i.projectId));

  const handleResolve = (id: string) => {
    dispatch({ type: 'UPDATE_ISSUE', payload: { id, changes: { status: 'Resolved', resolvedBy: user?.id, resolvedAt: new Date().toISOString(), resolution: 'Resolved by site manager' } } });
    showToast('Issue resolved');
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Issues</h1>
      {myIssues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}><AlertTriangle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} /><p>No issues</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {myIssues.map(issue => (
            <div key={issue.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{issue.issueId}</span>
                    <span className={`status-badge ${getStatusBg(issue.priority)}`} style={{ fontSize: '11px' }}>{issue.priority}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{issue.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{issue.description}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{issue.projectName} • {issue.reportedByName} • {timeAgo(issue.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`status-badge ${getStatusBg(issue.status)}`}>{issue.status}</span>
                  {issue.status !== 'Resolved' && issue.status !== 'Closed' && (
                    <button onClick={() => handleResolve(issue.id)} className="btn-success" style={{ padding: '8px 12px', fontSize: '13px' }}><CheckCircle size={14} /> Resolve</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
