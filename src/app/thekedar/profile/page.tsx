'use client';
import { useAuth } from '@/lib/auth';
import { useStore, useResetData } from '@/lib/store';
import { User, Phone, Mail, MapPin, LogOut, RotateCcw } from 'lucide-react';

export default function ThekedarProfile() {
  const { user, logout } = useAuth();
  const { state } = useStore();
  const resetData = useResetData();

  if (!user) return null;

  const myProject = state.projects.find(p => p.thekedarId === user.id);
  const mySite = state.sites.find(s => s.thekedarId === user.id);

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Profile</h1>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', fontWeight: 700, color: 'white' }}>
          {user.name.charAt(0)}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px' }}>{user.name}</div>
        <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600, marginBottom: '4px' }}>Site Supervisor (Thekedar)</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</div>
      </div>

      <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
            <Mail size={18} style={{ color: 'var(--text-muted)' }} />
            <span>{user.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
            <Phone size={18} style={{ color: 'var(--text-muted)' }} />
            <span>{user.phone}</span>
          </div>
          {mySite && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
              <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
              <span>{mySite.name} — {mySite.location}</span>
            </div>
          )}
        </div>
      </div>

      {myProject && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Current Assignment</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{myProject.name}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{myProject.client} • {myProject.location}</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={() => { resetData(); }} className="btn-secondary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
          <RotateCcw size={16} /> Reset Demo Data
        </button>
        <button onClick={logout} className="btn-danger" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
