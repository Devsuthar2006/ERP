'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { ArrowLeft, Camera, Send } from 'lucide-react';
import Link from 'next/link';
import { getProgressColor } from '@/lib/utils';

export default function UpdateProgressPage() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const myProject = state.projects.find(p => p.thekedarId === user?.id);
  const myTasks = state.tasks.filter(t => t.thekedarId === user?.id && t.projectId === myProject?.id);

  const [selectedTask, setSelectedTask] = useState('');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const task = myTasks.find(t => t.id === selectedTask);

  const handleSubmit = () => {
    if (!selectedTask || !user || !myProject) return;
    setSubmitting(true);

    const taskObj = myTasks.find(t => t.id === selectedTask)!;
    const updateId = genId('du-');
    const now = new Date().toISOString();

    // Create daily update
    dispatch({
      type: 'ADD_DAILY_UPDATE',
      payload: {
        id: updateId,
        projectId: myProject.id,
        siteId: myProject.siteId,
        taskId: selectedTask,
        taskName: taskObj.name,
        submittedBy: user.id,
        submittedByName: user.name,
        date: '2026-10-01',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        progress,
        description: notes,
        status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started',
        photos: [],
        createdAt: now,
      },
    });

    // Update task
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: selectedTask,
        changes: {
          progress,
          status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started',
        },
      },
    });

    // Notification to owner
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: genId('notif-'),
        type: 'daily_update',
        title: 'New Site Update',
        message: `${user.name} updated ${taskObj.name} to ${progress}% at ${myProject.name}`,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        userId: 'user-owner',
        read: false,
        createdAt: now,
      },
    });

    // Notification to sub-admin
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: genId('notif-'),
        type: 'daily_update',
        title: 'Site Update',
        message: `${user.name} updated ${taskObj.name} to ${progress}%`,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        userId: myProject.subAdminId,
        read: false,
        createdAt: now,
      },
    });

    // Audit log
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        id: genId('audit-'),
        userId: user.id,
        userName: user.name,
        action: 'submitted progress update',
        entityType: 'DailyUpdate',
        entityId: updateId,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        details: `${taskObj.name} — ${progress}% ${notes ? '— ' + notes : ''}`,
        createdAt: now,
      },
    });

    setTimeout(() => {
      showToast('✓ Progress update submitted successfully');
      setSubmitting(false);
      router.push('/thekedar/home');
    }, 500);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <Link href="/thekedar/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Update Progress</h1>

      {/* Task Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label className="form-label">Select Task</label>
        <select className="form-select" value={selectedTask} onChange={e => { setSelectedTask(e.target.value); const t = myTasks.find(tk => tk.id === e.target.value); if (t) setProgress(t.progress); }}>
          <option value="">Choose a task...</option>
          {myTasks.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.progress}%)</option>
          ))}
        </select>
      </div>

      {selectedTask && task && (
        <>
          {/* Current Progress */}
          <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Progress: {task.progress}%</div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div className={`progress-bar-fill ${getProgressColor(task.progress)}`} style={{ width: `${task.progress}%` }} />
            </div>
          </div>

          {/* Progress Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">New Progress</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
              {[25, 50, 75, 100].map(val => (
                <button
                  key={val}
                  onClick={() => setProgress(val)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 700,
                    background: progress === val ? 'rgba(59,130,246,0.2)' : 'rgba(148,163,184,0.08)',
                    border: progress === val ? '2px solid #3b82f6' : '2px solid var(--border-color)',
                    color: progress === val ? '#60a5fa' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Notes</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Describe work completed..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Photo Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Add Photos</label>
            <button className="btn-secondary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
              <Camera size={18} /> Upload Photo
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>Demo: Photos are simulated</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !notes}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
          >
            {submitting ? 'Submitting...' : 'Submit Update'}
            {!submitting && <Send size={18} />}
          </button>
        </>
      )}
    </div>
  );
}
