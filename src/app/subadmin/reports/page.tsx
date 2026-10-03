'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { formatDate, getStatusBg } from '@/lib/utils';
import { FileText } from 'lucide-react';

export default function SubadminReports() {
  const { state } = useStore();
  const { user } = useAuth();
  const myProjects = state.projects.filter(p => user?.assignedProjectIds.includes(p.id));
  const myReports = state.dailyReports.filter(r => myProjects.some(p => p.id === r.projectId));

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Daily Reports</h1>
      {myReports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}><FileText size={32} style={{ marginBottom: '12px', opacity: 0.5 }} /><p>No daily reports yet</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myReports.map(report => {
            const project = myProjects.find(p => p.id === report.projectId);
            return (
              <div key={report.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>{project?.name} — {formatDate(report.date)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>By: {report.submittedByName}</div>
                  </div>
                  <span className={`status-badge ${getStatusBg(report.overallProgress)}`}>{report.overallProgress}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Workers Present: {report.workersPresent}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}><strong>Work:</strong> {report.workCompleted}</div>
                {report.materialNeeded && <div style={{ fontSize: '13px', color: '#f59e0b' }}><strong>Material Needed:</strong> {report.materialNeeded}</div>}
                {report.issues && <div style={{ fontSize: '13px', color: '#ef4444', marginTop: '4px' }}><strong>Issues:</strong> {report.issues}</div>}
                {report.notes && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>{report.notes}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
