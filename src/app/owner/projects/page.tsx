'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { getStatusBg, getProgressColor, formatCurrency, formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = state.projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Projects</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{state.projects.length} total projects</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: '36px', width: '240px' }} placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'On Track', 'Attention', 'Delayed', 'Completed'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
        {filtered.map(project => {
          const subAdmin = state.users.find(u => u.id === project.subAdminId);
          const thekedar = state.users.find(u => u.id === project.thekedarId);
          const projectTasks = state.tasks.filter(t => t.projectId === project.id);
          const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;

          return (
            <Link key={project.id} href={`/owner/projects/${project.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{project.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{project.client} • {project.location}</p>
                  </div>
                  <span className={`status-badge ${getStatusBg(project.status)}`}>{project.status}</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{project.progress}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px' }}>
                    <div className={`progress-bar-fill ${getProgressColor(project.progress)}`} style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Value</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatCurrency(project.projectValue)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Workers</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{project.workerCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Tasks</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{completedTasks}/{projectTasks.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Completion</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatDate(project.expectedCompletion)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{subAdmin?.name}</span> • Manager
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{thekedar?.name}</span> • Thekedar
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>No projects found</p>
          <p style={{ fontSize: '14px' }}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
