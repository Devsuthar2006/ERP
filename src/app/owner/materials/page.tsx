'use client';
import { useState } from 'react';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { Package, Search, Check, X, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { getStatusBg, formatDate, timeAgo } from '@/lib/utils';

export default function MaterialsPage() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = state.materialRequests.filter(mr => {
    const matchSearch = mr.materialName.toLowerCase().includes(search.toLowerCase()) || mr.projectName.toLowerCase().includes(search.toLowerCase()) || mr.requestId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || mr.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = state.materialRequests.filter(mr => mr.status === 'Pending').length;
  const approved = state.materialRequests.filter(mr => mr.status === 'Approved').length;
  const ordered = state.materialRequests.filter(mr => mr.status === 'Ordered').length;
  const delivered = state.materialRequests.filter(mr => mr.status === 'Delivered').length;

  const handleApprove = (id: string) => {
    dispatch({ type: 'UPDATE_MATERIAL_REQUEST', payload: { id, changes: { status: 'Approved', approvedBy: user?.id, approvedAt: new Date().toISOString() } } });
    const mr = state.materialRequests.find(m => m.id === id);
    if (mr) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: genId('notif-'), type: 'material_approval', title: 'Material Request Approved', message: `${mr.materialName} — ${mr.quantity} ${mr.unit} approved for ${mr.projectName}`, projectId: mr.projectId, projectName: mr.projectName, siteId: mr.siteId, userId: mr.requestedBy, read: false, createdAt: new Date().toISOString() } });
      dispatch({ type: 'ADD_AUDIT', payload: { id: genId('audit-'), userId: user!.id, userName: user!.name, action: 'approved material request', entityType: 'MaterialRequest', entityId: mr.requestId, projectId: mr.projectId, projectName: mr.projectName, siteId: mr.siteId, details: `${mr.materialName} — ${mr.quantity} ${mr.unit}`, createdAt: new Date().toISOString() } });
    }
    showToast('Material request approved');
  };

  const handleReject = (id: string) => {
    dispatch({ type: 'UPDATE_MATERIAL_REQUEST', payload: { id, changes: { status: 'Rejected', approvedBy: user?.id, rejectionReason: 'Rejected by admin' } } });
    showToast('Material request rejected', 'error');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Material Requests</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{state.materialRequests.length} total requests</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="kpi-card amber" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock size={16} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{pending}</div>
        </div>
        <div className="kpi-card green" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Approved</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{approved}</div>
        </div>
        <div className="kpi-card blue" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Truck size={16} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ordered</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{ordered}</div>
        </div>
        <div className="kpi-card cyan" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Package size={16} style={{ color: '#06b6d4' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Delivered</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{delivered}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: '36px', width: '240px' }} placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Pending', 'Approved', 'Ordered', 'Delivered', 'Rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '7px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
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

      {/* Requests */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(mr => (
          <div key={mr.id} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>{mr.requestId}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{mr.projectName}</span>
                  <span className={`status-badge ${getStatusBg(mr.priority)}`} style={{ fontSize: '11px' }}>{mr.priority}</span>
                </div>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Material</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{mr.materialName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quantity</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{mr.quantity} {mr.unit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Required By</div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{formatDate(mr.requiredBy)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Requested By</div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{mr.requestedByName}</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Reason:</strong> {mr.reason}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{timeAgo(mr.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`status-badge ${getStatusBg(mr.status)}`}>{mr.status}</span>
                {mr.status === 'Pending' && (
                  <>
                    <button onClick={() => handleApprove(mr.id)} className="btn-success" style={{ padding: '8px 14px', fontSize: '13px' }}>
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => handleReject(mr.id)} className="btn-danger" style={{ padding: '8px 14px', fontSize: '13px' }}>
                      <X size={14} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Package size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>No material requests found</p>
          <p style={{ fontSize: '14px' }}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
