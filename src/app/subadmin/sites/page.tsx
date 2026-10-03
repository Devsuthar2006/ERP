'use client';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { MapPin, Users, Clock } from 'lucide-react';
import { getStatusBg, getProgressColor } from '@/lib/utils';

export default function SubadminSites() {
  const { state } = useStore();
  const { user } = useAuth();
  const mySites = state.sites.filter(s => user?.assignedSiteIds.includes(s.id));

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>My Sites</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>{mySites.length} assigned sites</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {mySites.map(site => {
          const project = state.projects.find(p => p.id === site.projectId);
          const thekedar = state.users.find(u => u.id === site.thekedarId);
          return (
            <Link key={site.id} href={`/subadmin/projects/${site.projectId}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{site.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <MapPin size={12} /> {site.location}
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusBg(site.status)}`}>{site.status}</span>
                </div>
                <div className="progress-bar" style={{ marginBottom: '10px' }}>
                  <div className={`progress-bar-fill ${getProgressColor(project?.progress || 0)}`} style={{ width: `${project?.progress || 0}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span><Users size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {site.workerCount} workers</span>
                  <span>Thekedar: {thekedar?.name}</span>
                  <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {site.lastUpdate}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
