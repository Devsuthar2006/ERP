'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function RequestMaterialPage() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const myProject = state.projects.find(p => p.thekedarId === user?.id);

  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requiredBy, setRequiredBy] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedMat = state.materials.find(m => m.id === material);

  const handleSubmit = () => {
    if (!material || !quantity || !reason || !user || !myProject || !selectedMat) return;
    setSubmitting(true);

    const now = new Date().toISOString();
    const requestId = `MR-${1030 + state.materialRequests.length}`;
    const mrId = genId('mr-');

    dispatch({
      type: 'ADD_MATERIAL_REQUEST',
      payload: {
        id: mrId,
        requestId,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        materialId: selectedMat.id,
        materialName: selectedMat.name,
        quantity: parseInt(quantity),
        unit: selectedMat.unit,
        requiredBy: requiredBy || '2026-10-10',
        priority: priority as any,
        reason,
        requestedBy: user.id,
        requestedByName: user.name,
        status: 'Pending',
        createdAt: now,
      },
    });

    // Notify owner
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: genId('notif-'),
        type: 'material_request',
        title: 'New Material Request',
        message: `${selectedMat.name} — ${quantity} ${selectedMat.unit} requested for ${myProject.name}`,
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
        type: 'material_request',
        title: 'Material Request',
        message: `${selectedMat.name} — ${quantity} ${selectedMat.unit} requested by ${user.name}`,
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
        action: 'created material request',
        entityType: 'MaterialRequest',
        entityId: requestId,
        projectId: myProject.id,
        projectName: myProject.name,
        siteId: myProject.siteId,
        details: `${selectedMat.name} — ${quantity} ${selectedMat.unit} — ${reason}`,
        createdAt: now,
      },
    });

    setTimeout(() => {
      showToast('✓ Material request submitted successfully');
      setSubmitting(false);
      router.push('/thekedar/materials');
    }, 500);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <Link href="/thekedar/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Request Material</h1>
      {myProject && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>{myProject.name}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label className="form-label">Material</label>
          <select className="form-select" value={material} onChange={e => setMaterial(e.target.value)}>
            <option value="">Select material...</option>
            {state.materials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Quantity {selectedMat && `(${selectedMat.unit})`}</label>
          <input className="form-input" type="number" placeholder="Enter quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
        </div>

        <div>
          <label className="form-label">Required By</label>
          <input className="form-input" type="date" value={requiredBy} onChange={e => setRequiredBy(e.target.value)} />
        </div>

        <div>
          <label className="form-label">Priority</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
            {['Low', 'Medium', 'High', 'Urgent'].map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: priority === p ? (p === 'Urgent' ? 'rgba(239,68,68,0.2)' : p === 'High' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)') : 'rgba(148,163,184,0.08)',
                  border: priority === p ? `2px solid ${p === 'Urgent' ? '#ef4444' : p === 'High' ? '#f59e0b' : '#3b82f6'}` : '2px solid var(--border-color)',
                  color: priority === p ? (p === 'Urgent' ? '#ef4444' : p === 'High' ? '#f59e0b' : '#60a5fa') : 'var(--text-muted)',
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
          <label className="form-label">Reason</label>
          <textarea className="form-input" rows={3} placeholder="Why is this material needed?" value={reason} onChange={e => setReason(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !material || !quantity || !reason}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '8px' }}
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
          {!submitting && <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
