'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { getStatusBg, formatDate } from '@/lib/utils';
import { FileText } from 'lucide-react';

export default function ThekedarUpdates() {
  const { state } = useStore();
  const { user } = useAuth();
  const myUpdates = state.dailyUpdates.filter(u => u.submittedBy === user?.id);

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>My Updates</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{myUpdates.length} updates submitted</p>

      {myUpdates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <FileText size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No updates submitted yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {myUpdates.map(update => (
            <div key={update.id} className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{update.taskName}</span>
                <span className={`status-badge ${getStatusBg(update.status)}`} style={{ fontSize: '11px' }}>{update.status}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{update.description}</p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Progress: {update.progress}%</span>
                <span>{formatDate(update.date)} at {update.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
