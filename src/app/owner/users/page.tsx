'use client';
import { useState, useMemo } from 'react';
import { useStore, genId } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/toast';
import {
  Shield, User as UserIcon, HardHat, MapPin, Phone, Mail,
  Search, Filter, Plus, Edit2, CheckCircle2, XCircle,
  Building2, Users, Star, Wrench, MoreVertical, X, Check, Briefcase
} from 'lucide-react';
import { User, UserRole, WorkerTrade } from '@/lib/types';

export default function UsersPage() {
  const { state, dispatch } = useStore();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'thekedar' | 'subadmin' | 'owner'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [tradeFilter, setTradeFilter] = useState<string>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalRole, setModalRole] = useState<UserRole>('thekedar');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [siteAssignUser, setSiteAssignUser] = useState<User | null>(null);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAgency, setFormAgency] = useState('');
  const [formTrade, setFormTrade] = useState('');
  const [formWorkers, setFormWorkers] = useState('10');
  const [formSites, setFormSites] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const openAddModal = (role: UserRole) => {
    setModalRole(role);
    setFormName('');
    setFormEmail('');
    setFormPhone('+91 ');
    setFormAgency(role === 'thekedar' ? '' : '');
    setFormTrade(role === 'thekedar' ? 'Carpentry & Modular Kitchens' : 'Site Operations');
    setFormWorkers('15');
    setFormSites([]);
    setFormStatus('Active');
    setShowAddModal(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPhone(u.phone);
    setFormAgency(u.agencyName || '');
    setFormTrade(u.trade || '');
    setFormWorkers(String(u.workerCount || 10));
    setFormSites(u.assignedSiteIds || []);
    setFormStatus(u.status || 'Active');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      showToast('Please provide full name and email', 'error');
      return;
    }

    const newUser: User = {
      id: `user-${modalRole}-${genId()}`,
      name: formName,
      email: formEmail,
      password: 'demo123',
      role: modalRole,
      phone: formPhone,
      agencyName: modalRole === 'thekedar' ? formAgency : undefined,
      trade: formTrade,
      workerCount: modalRole === 'thekedar' ? parseInt(formWorkers) || 0 : undefined,
      rating: modalRole === 'thekedar' ? 5.0 : undefined,
      status: formStatus,
      assignedSiteIds: formSites,
      assignedProjectIds: formSites.map(sid => {
        const s = state.sites.find(site => site.id === sid);
        return s ? s.projectId : '';
      }).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_USER', payload: newUser });
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        id: `aud-${genId()}`,
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: newUser.id,
        details: `Added new ${modalRole === 'thekedar' ? 'Contractor' : 'User'}: ${newUser.name}`,
        userId: currentUser?.id || 'admin',
        userName: currentUser?.name || 'Admin',
        createdAt: new Date().toISOString(),
      },
    });

    showToast(`${modalRole === 'thekedar' ? 'Contractor' : 'User'} ${newUser.name} created successfully!`, 'success');
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    dispatch({
      type: 'UPDATE_USER',
      payload: {
        id: editingUser.id,
        changes: {
          name: formName,
          email: formEmail,
          phone: formPhone,
          agencyName: formAgency,
          trade: formTrade,
          workerCount: parseInt(formWorkers) || 0,
          status: formStatus,
          assignedSiteIds: formSites,
          assignedProjectIds: formSites.map(sid => {
            const s = state.sites.find(site => site.id === sid);
            return s ? s.projectId : '';
          }).filter(Boolean),
        },
      },
    });

    showToast(`Updated ${formName} successfully`, 'success');
    setEditingUser(null);
  };

  const handleToggleStatus = (u: User) => {
    const nextStatus = u.status === 'Inactive' ? 'Active' : 'Inactive';
    dispatch({
      type: 'UPDATE_USER',
      payload: { id: u.id, changes: { status: nextStatus } },
    });
    showToast(`${u.name} marked as ${nextStatus}`, 'success');
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return state.users.filter(u => {
      // Tab filter
      if (activeTab === 'thekedar' && u.role !== 'thekedar') return false;
      if (activeTab === 'subadmin' && u.role !== 'subadmin') return false;
      if (activeTab === 'owner' && u.role !== 'owner') return false;

      // Status filter
      if (statusFilter !== 'all' && (u.status || 'Active') !== statusFilter) return false;

      // Trade filter
      if (tradeFilter !== 'all' && u.trade && !u.trade.toLowerCase().includes(tradeFilter.toLowerCase())) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone.toLowerCase().includes(q);
        const matchesAgency = u.agencyName?.toLowerCase().includes(q);
        const matchesTrade = u.trade?.toLowerCase().includes(q);
        const matchesSite = u.assignedSiteIds.some(sid => {
          const s = state.sites.find(site => site.id === sid);
          return s?.name.toLowerCase().includes(q) || s?.location.toLowerCase().includes(q);
        });
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesAgency && !matchesTrade && !matchesSite) {
          return false;
        }
      }

      return true;
    });
  }, [state.users, state.sites, activeTab, statusFilter, tradeFilter, searchQuery]);

  // Aggregate metrics
  const totalThekedars = state.users.filter(u => u.role === 'thekedar').length;
  const totalSubadmins = state.users.filter(u => u.role === 'subadmin').length;
  const totalSupervisedLabour = state.users
    .filter(u => u.role === 'thekedar')
    .reduce((sum, u) => sum + (u.workerCount || 0), 0);
  const totalActiveSitesAssigned = new Set(
    state.users.filter(u => u.role === 'thekedar').flatMap(u => u.assignedSiteIds)
  ).size;

  const roleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return { bg: '#0f172a', text: '#ffffff', label: 'Owner / Admin' };
      case 'subadmin':
        return { bg: '#e0e7ff', text: '#3730a3', label: 'Site Manager' };
      case 'thekedar':
        return { bg: '#dcfce7', text: '#166534', label: 'Contractor / Thekedar' };
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Users & Contractor Directory
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Full administrative control: oversee office staff, site managers, and thekedar contractor firms across all sites.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openAddModal('subadmin')} className="btn-secondary">
            <Plus size={16} /> Add Site Manager
          </button>
          <button onClick={() => openAddModal('thekedar')} className="btn-primary">
            <HardHat size={16} /> Onboard Thekedar
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="kpi-card blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contractor Firms
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {totalThekedars}
              </div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                Active Thekedars
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardHat size={20} color="#2563eb" />
            </div>
          </div>
        </div>

        <div className="kpi-card green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Labour Managed
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {totalSupervisedLabour}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Supervised on field
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#059669" />
            </div>
          </div>
        </div>

        <div className="kpi-card cyan">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Site Managers
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {totalSubadmins}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Sub-Admin personnel
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#0284c7" />
            </div>
          </div>
        </div>

        <div className="kpi-card purple">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sites Active
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {totalActiveSitesAssigned} / {state.sites.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Under direct supervision
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} color="#7c3aed" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '14px' }}>
          {/* Segmented Tab Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                background: activeTab === 'all' ? '#0f172a' : '#f8fafc',
                color: activeTab === 'all' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'all' ? '1px solid #0f172a' : '1px solid var(--border-color)',
                transition: 'all 0.15s ease'
              }}
            >
              All Members ({state.users.length})
            </button>
            <button
              onClick={() => setActiveTab('thekedar')}
              style={{
                padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                background: activeTab === 'thekedar' ? '#0f172a' : '#f8fafc',
                color: activeTab === 'thekedar' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'thekedar' ? '1px solid #0f172a' : '1px solid var(--border-color)',
                transition: 'all 0.15s ease'
              }}
            >
              Thekedars / Contractors ({totalThekedars})
            </button>
            <button
              onClick={() => setActiveTab('subadmin')}
              style={{
                padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                background: activeTab === 'subadmin' ? '#0f172a' : '#f8fafc',
                color: activeTab === 'subadmin' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'subadmin' ? '1px solid #0f172a' : '1px solid var(--border-color)',
                transition: 'all 0.15s ease'
              }}
            >
              Site Managers ({totalSubadmins})
            </button>
            <button
              onClick={() => setActiveTab('owner')}
              style={{
                padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                background: activeTab === 'owner' ? '#0f172a' : '#f8fafc',
                color: activeTab === 'owner' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'owner' ? '1px solid #0f172a' : '1px solid var(--border-color)',
                transition: 'all 0.15s ease'
              }}
            >
              Owner & Admins
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing <b>{filteredUsers.length}</b> records
          </div>
        </div>

        {/* Search & Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search name, phone, agency, or site..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
            <option value="all">Status: All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select className="form-select" value={tradeFilter} onChange={e => setTradeFilter(e.target.value)}>
            <option value="all">Trade: All Specialties</option>
            <option value="Carpentry">Carpentry & Modular</option>
            <option value="Civil">Civil, Marble & Flooring</option>
            <option value="Electrical">Electrical & Automation</option>
            <option value="False Ceiling">False Ceiling & POP</option>
            <option value="Painting">Painting & Textures</option>
            <option value="Heritage">Heritage & Polish</option>
          </select>
        </div>
      </div>

      {/* Users / Contractors Table List */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: '220px' }}>User / Agency</th>
              <th>Role</th>
              <th>Trade / Specialty</th>
              <th>Assigned Sites</th>
              <th>Labour Headcount</th>
              <th>Performance</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              const assignedSites = state.sites.filter(s => u.assignedSiteIds.includes(s.id));
              const badge = roleBadgeStyle(u.role);
              const isActive = (u.status || 'Active') === 'Active';

              return (
                <tr key={u.id} style={{ opacity: isActive ? 1 : 0.65 }}>
                  {/* User / Agency column */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '8px',
                        background: u.role === 'owner' ? '#0f172a' : u.role === 'subadmin' ? '#1e40af' : '#059669',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, flexShrink: 0
                      }}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                          {u.name}
                        </div>
                        {u.agencyName && (
                          <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>
                            {u.agencyName}
                          </div>
                        )}
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span>{u.phone}</span>
                          <span>•</span>
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      background: badge.bg,
                      color: badge.text,
                    }}>
                      {badge.label}
                    </span>
                  </td>

                  {/* Trade / Specialty */}
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {u.trade || (u.role === 'owner' ? 'Executive Director' : 'General Management')}
                    </div>
                  </td>

                  {/* Assigned Sites */}
                  <td>
                    {assignedSites.length === 0 ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {u.role === 'owner' ? 'All Sites (Director)' : 'Unassigned'}
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                        {assignedSites.map(s => (
                          <span
                            key={s.id}
                            style={{
                              padding: '2px 8px', borderRadius: '4px',
                              background: '#f1f5f9', border: '1px solid var(--border-color)',
                              fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500
                            }}
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Labour Headcount */}
                  <td>
                    {u.role === 'thekedar' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="#059669" />
                        <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                          {u.workerCount || 0}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>workers</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  {/* Rating */}
                  <td>
                    {u.role === 'thekedar' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706', fontSize: '13px', fontWeight: 600 }}>
                        <Star size={13} fill="#d97706" />
                        <span>{u.rating ? u.rating.toFixed(1) : '4.8'}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', padding: 0
                      }}
                    >
                      <span style={{
                        display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                        background: isActive ? '#059669' : '#dc2626'
                      }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: isActive ? '#059669' : '#dc2626' }}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(u)}
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        title="Edit Details / Reassign Sites"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>No users or contractors found matching criteria.</p>
          </div>
        )}
      </div>

      {/* Add User / Contractor Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                  {modalRole === 'thekedar' ? 'Onboard Thekedar / Contractor Firm' : 'Add Team Member'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Assign site access and operational responsibilities
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">System Role</label>
                <select
                  className="form-select"
                  value={modalRole}
                  onChange={e => setModalRole(e.target.value as UserRole)}
                >
                  <option value="thekedar">Thekedar (Site Contractor / Supervisor)</option>
                  <option value="subadmin">Site Manager (Sub-Admin)</option>
                  <option value="owner">Admin / Director</option>
                </select>
              </div>

              {modalRole === 'thekedar' && (
                <div>
                  <label className="form-label">Contractor / Agency Firm Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Royal Woodcraft & Modular Solutions"
                    value={formAgency}
                    onChange={e => setFormAgency(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">
                    {modalRole === 'thekedar' ? 'Lead Supervisor Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ratan Lal Suthar"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 98290 XXXXX"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Email Address (Login)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="contractor@demo.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Trade / Domain Specialty</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Carpentry, MEP, Civil"
                    value={formTrade}
                    onChange={e => setFormTrade(e.target.value)}
                  />
                </div>
              </div>

              {modalRole === 'thekedar' && (
                <div>
                  <label className="form-label">Labour Headcount Managed</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 25"
                    value={formWorkers}
                    onChange={e => setFormWorkers(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="form-label">Assign Project Sites</label>
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', background: '#f8fafc' }}>
                  {state.sites.map(s => {
                    const isChecked = formSites.includes(s.id);
                    return (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setFormSites(formSites.filter(id => id !== s.id));
                            } else {
                              setFormSites([...formSites, s.id]);
                            }
                          }}
                        />
                        <span>{s.name} ({s.location})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Save & Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                  Edit {editingUser.role === 'thekedar' ? 'Contractor' : 'User'}: {editingUser.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Update contact info, site reassignments, and active status
                </p>
              </div>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {editingUser.role === 'thekedar' && (
                <div>
                  <label className="form-label">Contractor / Agency Firm Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formAgency}
                    onChange={e => setFormAgency(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Trade / Specialty</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formTrade}
                    onChange={e => setFormTrade(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {editingUser.role === 'thekedar' && (
                  <div>
                    <label className="form-label">Labour Headcount</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formWorkers}
                      onChange={e => setFormWorkers(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Assigned Project Sites</label>
                <div style={{ maxHeight: '130px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', background: '#f8fafc' }}>
                  {state.sites.map(s => {
                    const isChecked = formSites.includes(s.id);
                    return (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setFormSites(formSites.filter(id => id !== s.id));
                            } else {
                              setFormSites([...formSites, s.id]);
                            }
                          }}
                        />
                        <span>{s.name} ({s.location})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
