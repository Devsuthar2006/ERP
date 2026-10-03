'use client';
import { useState } from 'react';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { AlertTriangle, Search, CheckCircle, Clock } from 'lucide-react';
import { getStatusBg, timeAgo } from '@/lib/utils';

export default function IssuesPage() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = state.issues.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.projectName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleResolve = (id: string) => {
    dispatch({ type: 'UPDATE_ISSUE', payload: { id, changes: { status: 'Resolved', resolvedBy: user?.id, resolvedAt: new Date().toISOString(), resolution: 'Resolved by management' } } });
    showToast('Issue marked as resolved');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Issues</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{state.issues.length} total issues</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {['Open', 'In Review', 'Assigned', 'Resolved', 'Closed'].map(status => (
          <div key={status} className={`kpi-card ${status === 'Open' ? 'red' : status === 'Resolved' ? 'green' : 'amber'}`} style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{status}</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{state.issues.filter(i => i.status === status).length}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: '36px', width: '240px' }} placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Open', 'In Review', 'Assigned', 'Resolved', 'Closed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '7px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
              background: statusFilter === s ? '#0f172a' : '#ffffff',
              color: statusFilter === s ? '#ffffff' : 'var(--text-secondary)',
              border: statusFilter === s ? '1px solid #0f172a' : '1px solid var(--border-color)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Issues list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(issue => (
          <div key={issue.id} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>{issue.issueId}</span>
                  <span className={`status-badge ${getStatusBg(issue.priority)}`} style={{ fontSize: '11px' }}>{issue.priority}</span>
                  <span className={`status-badge ${getStatusBg(issue.category === 'Material' ? 'Attention' : 'In Progress')}`} style={{ fontSize: '11px' }}>{issue.category}</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{issue.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{issue.description}</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{issue.projectName}</span>
                  <span>Reported by: {issue.reportedByName}</span>
                  <span>{timeAgo(issue.createdAt)}</span>
                </div>
                {issue.resolution && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', fontSize: '13px', color: '#10b981' }}>
                    <strong>Resolution:</strong> {issue.resolution}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`status-badge ${getStatusBg(issue.status)}`}>{issue.status}</span>
                {(issue.status === 'Open' || issue.status === 'In Review' || issue.status === 'Assigned') && (
                  <button onClick={() => handleResolve(issue.id)} className="btn-success" style={{ padding: '8px 14px', fontSize: '13px' }}>
                    <CheckCircle size={14} /> Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <AlertTriangle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No issues found</p>
        </div>
      )}
    </div>
  );
}
