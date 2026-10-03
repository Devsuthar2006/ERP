'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { MapPin, Users, Clock, Search } from 'lucide-react';
import { getStatusBg, getProgressColor, timeAgo } from '@/lib/utils';

export default function SitesPage() {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = state.sites.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Sites</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{state.sites.length} active sites</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: '36px', width: '220px' }} placeholder="Search sites..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filtered.map(site => {
          const project = state.projects.find(p => p.id === site.projectId);
          const subAdmin = state.users.find(u => u.id === site.subAdminId);
          const thekedar = state.users.find(u => u.id === site.thekedarId);

          return (
            <Link key={site.id} href={`/owner/projects/${site.projectId}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{site.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <MapPin size={12} /> {site.location}
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusBg(site.status)}`}>{site.status}</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{project?.progress || 0}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className={`progress-bar-fill ${getProgressColor(project?.progress || 0)}`} style={{ width: `${project?.progress || 0}%` }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginBottom: '14px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Sub-admin:</span> <span style={{ fontWeight: 500 }}>{subAdmin?.name}</span></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Thekedar:</span> <span style={{ fontWeight: 500 }}>{thekedar?.agencyName || thekedar?.name}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} style={{ color: 'var(--text-muted)' }} /> <span style={{ fontWeight: 500 }}>{site.workerCount} workers</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} style={{ color: 'var(--text-muted)' }} /> <span style={{ fontWeight: 500 }}>{site.lastUpdate}</span></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} /> {site.workerCount} Site Labours
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    View Site Details →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
