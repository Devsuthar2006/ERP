'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { ArrowLeft, Send, Camera } from 'lucide-react';
import Link from 'next/link';

export default function DailyReportPage() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const myProject = state.projects.find(p => p.thekedarId === user?.id);
  const mySite = state.sites.find(s => s.thekedarId === user?.id);
  const myWorkers = state.workers.filter(w => w.thekedarId === user?.id && w.assignedSiteId === mySite?.id);

  const [workersPresent, setWorkersPresent] = useState(String(myWorkers.length));
  const [workCompleted, setWorkCompleted] = useState('');
  const [materialReceived, setMaterialReceived] = useState('');
  const [materialNeeded, setMaterialNeeded] = useState('');
  const [issues, setIssues] = useState('');
  const [overallProgress, setOverallProgress] = useState<'Good' | 'Normal' | 'Delayed'>('Good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!workCompleted || !user || !myProject) return;
    setSubmitting(true);

    const now = new Date().toISOString();

    dispatch({
      type: 'ADD_DAILY_REPORT',
      payload: {
        id: genId('dr-'),
        projectId: myProject.id,
        siteId: myProject.siteId,
        submittedBy: user.id,
        submittedByName: user.name,
        date: '2026-10-01',
        workersPresent: parseInt(workersPresent),
        workCompleted,
        materialReceived,
        materialNeeded,
        issues,
        overallProgress,
        notes,
        photos: [],
        createdAt: now,
      },
    });

    // Notify owner
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: genId('notif-'),
        type: 'daily_report',
        title: 'Daily Report Submitted',
        message: `${user.name} submitted daily report for ${myProject.name}`,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        userId: 'user-owner',
        read: false,
        createdAt: now,
      },
    });

    // Notify sub-admin
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: genId('notif-'),
        type: 'daily_report',
        title: 'Daily Report',
        message: `${user.name} submitted daily report`,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        userId: myProject.subAdminId,
        read: false,
        createdAt: now,
      },
    });

    setTimeout(() => {
      showToast('✓ Daily report submitted successfully');
      setSubmitting(false);
      router.push('/thekedar/home');
    }, 500);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <Link href="/thekedar/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Daily Site Report</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>{myProject?.name} • 1 October 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label className="form-label">Workers Present</label>
          <input className="form-input" type="number" value={workersPresent} onChange={e => setWorkersPresent(e.target.value)} />
        </div>

        <div>
          <label className="form-label">Work Completed Today</label>
          <textarea className="form-input" rows={3} placeholder="List today's completed work..." value={workCompleted} onChange={e => setWorkCompleted(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div>
          <label className="form-label">Material Received</label>
          <input className="form-input" placeholder="Material received today (if any)" value={materialReceived} onChange={e => setMaterialReceived(e.target.value)} />
        </div>

        <div>
          <label className="form-label">Material Needed</label>
          <input className="form-input" placeholder="Material needed urgently" value={materialNeeded} onChange={e => setMaterialNeeded(e.target.value)} />
        </div>

        <div>
          <label className="form-label">Issues</label>
          <input className="form-input" placeholder="Any issues faced today" value={issues} onChange={e => setIssues(e.target.value)} />
        </div>

        <div>
          <label className="form-label">Overall Progress</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {(['Good', 'Normal', 'Delayed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setOverallProgress(s)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: overallProgress === s ? (s === 'Good' ? 'rgba(16,185,129,0.2)' : s === 'Delayed' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)') : 'rgba(148,163,184,0.08)',
                  border: overallProgress === s ? `2px solid ${s === 'Good' ? '#10b981' : s === 'Delayed' ? '#ef4444' : '#f59e0b'}` : '2px solid var(--border-color)',
                  color: overallProgress === s ? (s === 'Good' ? '#10b981' : s === 'Delayed' ? '#ef4444' : '#f59e0b') : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">Notes</label>
          <textarea className="form-input" rows={2} placeholder="Additional notes..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div>
          <label className="form-label">Photos</label>
          <button className="btn-secondary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
            <Camera size={18} /> Add Photos
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !workCompleted}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '8px' }}
        >
          {submitting ? 'Submitting...' : 'Submit Daily Report'}
          {!submitting && <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
