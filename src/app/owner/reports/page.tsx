'use client';
import { useStore } from '@/lib/store';
import { getStatusBg, getProgressColor, formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const { state } = useStore();

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Reports</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Project and site analytics</p>
      </div>

      {/* Project Progress Report */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Project Progress Report</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Project</th><th>Progress</th><th>Tasks Done</th><th>Tasks Pending</th><th>Workers</th><th>Issues</th><th>Material Req.</th><th>Status</th></tr>
            </thead>
            <tbody>
              {state.projects.map(p => {
                const tasks = state.tasks.filter(t => t.projectId === p.id);
                const done = tasks.filter(t => t.status === 'Completed').length;
                const pending = tasks.length - done;
                const issues = state.issues.filter(i => i.projectId === p.id && i.status !== 'Resolved' && i.status !== 'Closed').length;
                const mrs = state.materialRequests.filter(mr => mr.projectId === p.id).length;
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ minWidth: '130px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className={`progress-bar-fill ${getProgressColor(p.progress)}`} style={{ width: `${p.progress}%` }} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{done}</td>
                    <td style={{ color: pending > 0 ? '#f59e0b' : 'var(--text-muted)', fontWeight: 600 }}>{pending}</td>
                    <td>{p.workerCount}</td>
                    <td style={{ color: issues > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>{issues}</td>
                    <td>{mrs}</td>
                    <td><span className={`status-badge ${getStatusBg(p.status)}`} style={{ fontSize: '11px' }}>{p.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Report */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Material Request Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {['Pending', 'Approved', 'Ordered', 'Delivered', 'Rejected'].map(status => (
            <div key={status} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(148,163,184,0.05)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
                {state.materialRequests.filter(mr => mr.status === status).length}
              </div>
              <span className={`status-badge ${getStatusBg(status)}`} style={{ fontSize: '11px' }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Site Activity */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Site Activity Report</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Site</th><th>Workers</th><th>Updates</th><th>Tasks</th><th>Materials</th><th>Issues</th><th>Photos</th></tr>
            </thead>
            <tbody>
              {state.sites.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.workerCount}</td>
                  <td>{state.dailyUpdates.filter(u => u.siteId === s.id).length}</td>
                  <td>{state.tasks.filter(t => t.siteId === s.id).length}</td>
                  <td>{state.materialRequests.filter(mr => mr.siteId === s.id).length}</td>
                  <td>{state.issues.filter(i => i.siteId === s.id).length}</td>
                  <td>{state.sitePhotos.filter(p => p.siteId === s.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
