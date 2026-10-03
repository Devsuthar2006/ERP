'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import { getStatusBg, timeAgo } from '@/lib/utils';

export default function ThekedarMaterials() {
  const { state } = useStore();
  const { user } = useAuth();
  const myRequests = state.materialRequests.filter(mr => mr.requestedBy === user?.id);

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Materials</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{myRequests.length} requests</p>
        </div>
        <Link href="/thekedar/request-material" className="btn-primary" style={{ padding: '10px 16px', fontSize: '13px', textDecoration: 'none' }}>
          <Plus size={16} /> New Request
        </Link>
      </div>

      {myRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Package size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No material requests yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {myRequests.map(mr => (
            <div key={mr.id} className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{mr.requestId}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>{mr.materialName}</div>
                </div>
                <span className={`status-badge ${getStatusBg(mr.status)}`} style={{ fontSize: '11px' }}>{mr.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>{mr.quantity} {mr.unit}</span>
                <span className={`status-badge ${getStatusBg(mr.priority)}`} style={{ fontSize: '10px' }}>{mr.priority}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                {mr.projectName} • {timeAgo(mr.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
