'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { ArrowLeft, Camera, Send } from 'lucide-react';
import Link from 'next/link';

const categories = ['Material', 'Labour', 'Design', 'Electrical', 'Client', 'Other'] as const;

export default function ReportIssuePage() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const myProject = state.projects.find(p => p.thekedarId === user?.id);

  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!category || !title || !description || !user || !myProject) return;
    setSubmitting(true);

    const now = new Date().toISOString();
    const issueId = `ISS-${307 + state.issues.length}`;
    const id = genId('iss-');

    dispatch({
      type: 'ADD_ISSUE',
      payload: {
        id,
        issueId,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        category: category as any,
        title,
        description,
        priority: priority as any,
        status: 'Open',
        reportedBy: user.id,
        reportedByName: user.name,
        photos: [],
        createdAt: now,
      },
    });

    // Notify owner
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: genId('notif-'),
        type: 'issue',
        title: priority === 'High' || priority === 'Critical' ? `${priority} Priority Issue` : 'New Issue Reported',
        message: `${title} at ${myProject.name}`,
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
        type: 'issue',
        title: 'Issue Reported',
        message: `${user.name} reported: ${title}`,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        userId: myProject.subAdminId,
        read: false,
        createdAt: now,
      },
    });

    // Audit
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        id: genId('audit-'),
        userId: user.id,
        userName: user.name,
        action: 'reported issue',
        entityType: 'Issue',
        entityId: issueId,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        details: `${title} — ${priority} priority`,
        createdAt: now,
      },
    });

    setTimeout(() => {
      showToast('✓ Issue reported successfully');
      setSubmitting(false);
      router.push('/thekedar/home');
    }, 500);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <Link href="/thekedar/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Report Issue</h1>
      {myProject && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>{myProject.name}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label className="form-label">Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: category === c ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.08)',
                  border: category === c ? '2px solid #3b82f6' : '2px solid var(--border-color)',
                  color: category === c ? '#60a5fa' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">Title</label>
          <input className="form-input" placeholder="Brief issue title..." value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={4} placeholder="Describe the issue in detail..." value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div>
          <label className="form-label">Priority</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
            {['Low', 'Medium', 'High', 'Critical'].map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: priority === p ? (p === 'Critical' ? 'rgba(239,68,68,0.2)' : p === 'High' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)') : 'rgba(148,163,184,0.08)',
                  border: priority === p ? `2px solid ${p === 'Critical' ? '#ef4444' : p === 'High' ? '#f59e0b' : '#3b82f6'}` : '2px solid var(--border-color)',
                  color: priority === p ? (p === 'Critical' ? '#ef4444' : p === 'High' ? '#f59e0b' : '#60a5fa') : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">Add Photo</label>
          <button className="btn-secondary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
            <Camera size={18} /> Upload Photo
          </button>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>Demo: Photos are simulated</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !category || !title || !description}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '8px' }}
        >
          {submitting ? 'Submitting...' : 'Submit Issue'}
          {!submitting && <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
