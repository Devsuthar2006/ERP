'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { Camera } from 'lucide-react';
import { timeAgo, getStatusBg } from '@/lib/utils';

export default function SitePhotosPage() {
  const { state } = useStore();
  const { user } = useAuth();
  const myProject = state.projects.find(p => p.thekedarId === user?.id);
  const myPhotos = state.sitePhotos.filter(p => p.projectId === myProject?.id);

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Site Photos</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{myProject?.name}</p>

      {myPhotos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Camera size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No photos uploaded yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {myPhotos.map(photo => (
            <div key={photo.id} style={{ borderRadius: '12px', overflow: 'hidden', background: 'rgba(148,163,184,0.08)', border: '1px solid var(--border-color)' }}>
              <div style={{ aspectRatio: '4/3', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={26} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ padding: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{photo.caption}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo(photo.createdAt)}</span>
                  <span className={`status-badge ${getStatusBg(photo.category === 'Issue' ? 'High' : 'On Track')}`} style={{ fontSize: '9px' }}>{photo.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
