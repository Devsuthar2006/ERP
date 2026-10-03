'use client';
import { useState } from 'react';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { Check, X, UserCheck, UserX } from 'lucide-react';

export default function ThekedarWorkers() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();

  const mySite = state.sites.find(s => s.thekedarId === user?.id);
  const myWorkers = state.workers.filter(w => w.thekedarId === user?.id && w.assignedSiteId === mySite?.id);

  // Get today's attendance
  const todayDate = '2026-10-01';
  const getAttendance = (workerId: string) => {
    return state.attendance.find(a => a.workerId === workerId && a.date === todayDate);
  };

  const [localAttendance, setLocalAttendance] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    myWorkers.forEach(w => {
      const att = getAttendance(w.id);
      init[w.id] = att?.status || '';
    });
    return init;
  });

  const handleMark = (workerId: string, status: 'Present' | 'Absent' | 'Half Day') => {
    setLocalAttendance(prev => ({ ...prev, [workerId]: status }));
  };

  const handleSaveAttendance = () => {
    const records = myWorkers.map(w => ({
      id: genId('att-'),
      workerId: w.id,
      workerName: w.name,
      siteId: mySite!.id,
      date: todayDate,
      status: (localAttendance[w.id] || 'Present') as any,
      markedBy: user!.id,
      createdAt: new Date().toISOString(),
    }));
    dispatch({ type: 'SET_ATTENDANCE', payload: records });
    showToast('✓ Attendance saved successfully');
  };

  const presentCount = Object.values(localAttendance).filter(s => s === 'Present').length;
  const absentCount = Object.values(localAttendance).filter(s => s === 'Absent').length;
  const halfDayCount = Object.values(localAttendance).filter(s => s === 'Half Day').length;

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Workers</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        {mySite?.name} — {myWorkers.length} workers
      </p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{presentCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Present</div>
        </div>
        <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{absentCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Absent</div>
        </div>
        <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{halfDayCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Half Day</div>
        </div>
      </div>

      {/* Worker list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {myWorkers.map(w => {
          const status = localAttendance[w.id] || '';
          return (
            <div key={w.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{w.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{w.trade} • {w.workerId}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleMark(w.id, 'Present')}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: status === 'Present' ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.08)',
                    border: status === 'Present' ? '2px solid #10b981' : '2px solid var(--border-color)',
                    color: status === 'Present' ? '#10b981' : 'var(--text-muted)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <UserCheck size={16} />
                </button>
                <button
                  onClick={() => handleMark(w.id, 'Absent')}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: status === 'Absent' ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.08)',
                    border: status === 'Absent' ? '2px solid #ef4444' : '2px solid var(--border-color)',
                    color: status === 'Absent' ? '#ef4444' : 'var(--text-muted)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <UserX size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={handleSaveAttendance} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
        Save Attendance
      </button>
    </div>
  );
}
