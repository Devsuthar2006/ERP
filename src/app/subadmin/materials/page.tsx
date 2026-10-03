'use client';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { Check, X, Package } from 'lucide-react';
import { getStatusBg, formatDate, timeAgo } from '@/lib/utils';

export default function SubadminMaterials() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();

  const myProjects = state.projects.filter(p => user?.assignedProjectIds.includes(p.id));
  const myMR = state.materialRequests.filter(mr => myProjects.some(p => p.id === mr.projectId));

  const handleApprove = (id: string) => {
    dispatch({ type: 'UPDATE_MATERIAL_REQUEST', payload: { id, changes: { status: 'Approved', approvedBy: user?.id, approvedAt: new Date().toISOString() } } });
    const mr = state.materialRequests.find(m => m.id === id);
    if (mr) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: genId('notif-'), type: 'material_approval', title: 'Material Request Approved', message: `${mr.materialName} — ${mr.quantity} ${mr.unit} approved`, projectId: mr.projectId, projectName: mr.projectName, siteId: mr.siteId, userId: mr.requestedBy, read: false, createdAt: new Date().toISOString() } });
    }
    showToast('Material request approved');
  };

  const handleReject = (id: string) => {
    dispatch({ type: 'UPDATE_MATERIAL_REQUEST', payload: { id, changes: { status: 'Rejected' } } });
    showToast('Material request rejected', 'error');
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Materials</h1>
      {myMR.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}><Package size={32} style={{ marginBottom: '12px', opacity: 0.5 }} /><p>No material requests</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {myMR.map(mr => (
            <div key={mr.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '13px' }}>{mr.requestId}</span>
                    <span style={{ fontWeight: 600 }}>{mr.materialName}</span>
                    <span className={`status-badge ${getStatusBg(mr.priority)}`} style={{ fontSize: '11px' }}>{mr.priority}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{mr.quantity} {mr.unit} • {mr.projectName} • By: {mr.requestedByName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{mr.reason} • {timeAgo(mr.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`status-badge ${getStatusBg(mr.status)}`}>{mr.status}</span>
                  {mr.status === 'Pending' && (
                    <>
                      <button onClick={() => handleApprove(mr.id)} className="btn-success" style={{ padding: '8px 12px', fontSize: '13px' }}><Check size={14} /> Approve</button>
                      <button onClick={() => handleReject(mr.id)} className="btn-danger" style={{ padding: '8px 12px', fontSize: '13px' }}><X size={14} /> Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
