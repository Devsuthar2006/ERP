'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { formatCurrency, getStatusBg } from '@/lib/utils';
import { Building2, Users, Search, Phone } from 'lucide-react';

export default function SubadminLabour() {
  const { state } = useStore();
  const { user } = useAuth();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('All');

  const mySites = state.sites.filter(s => user?.assignedSiteIds?.includes(s.id));
  const myWorkers = state.workers.filter(w => mySites.some(s => s.id === w.assignedSiteId));

  const filteredWorkers = myWorkers.filter(w => {
    const matchSite = selectedSiteId === 'all' || w.assignedSiteId === selectedSiteId;
    const matchTrade = tradeFilter === 'All' || w.trade === tradeFilter;
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.workerId.toLowerCase().includes(search.toLowerCase());
    return matchSite && matchTrade && matchSearch;
  });

  const trades = ['All', ...Array.from(new Set(myWorkers.map(w => w.trade)))];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '30px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Labour & Site Force</h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {myWorkers.length} workers deployed across your {mySites.length} assigned sites
        </p>
      </div>

      {/* Site-Wise Filter Bar */}
      <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', marginBottom: '18px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Filter Site:
        </span>
        <button
          onClick={() => setSelectedSiteId('all')}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            background: selectedSiteId === 'all' ? '#0f172a' : '#f8fafc',
            color: selectedSiteId === 'all' ? '#ffffff' : 'var(--text-secondary)',
            border: selectedSiteId === 'all' ? '1px solid #0f172a' : '1px solid var(--border-color)',
          }}
        >
          🏢 All My Sites ({myWorkers.length})
        </button>
        {mySites.map(s => {
          const count = myWorkers.filter(w => w.assignedSiteId === s.id).length;
          const isSelected = selectedSiteId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSiteId(s.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: isSelected ? '#0f172a' : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                border: isSelected ? '1px solid #0f172a' : '1px solid var(--border-color)',
              }}
            >
              {s.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: '34px', width: '100%', fontSize: '13px' }}
            placeholder="Search worker name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: '160px', fontSize: '13px' }}
          value={tradeFilter}
          onChange={e => setTradeFilter(e.target.value)}
        >
          {trades.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Showing <b>{filteredWorkers.length}</b> workers
        </span>
      </div>

      {/* Workers Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Trade</th>
              <th>Assigned Site</th>
              <th>Contractor / Thekedar</th>
              <th>Daily Wage</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.map(w => {
              const site = state.sites.find(s => s.id === w.assignedSiteId);
              const thekedar = state.users.find(u => u.id === w.thekedarId);
              return (
                <tr key={w.id}>
                  <td style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>{w.workerId}</td>
                  <td style={{ fontWeight: 600, fontSize: '13.5px' }}>{w.name}</td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600, background: '#f8fafc', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {w.trade}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: 500 }}>{site?.name}</td>
                  <td style={{ fontSize: '13px' }}>{thekedar?.agencyName || thekedar?.name}</td>
                  <td style={{ fontWeight: 600, fontSize: '13px' }}>{formatCurrency(w.dailyWage)}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{w.phone}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
