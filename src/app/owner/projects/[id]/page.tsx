'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Calendar, IndianRupee, Users, ListTodo, Package,
  AlertTriangle, Camera, Clock, CheckCircle2, FileText,
} from 'lucide-react';
import { getStatusBg, getProgressColor, formatCurrency, formatDate, timeAgo } from '@/lib/utils';

export default function ProjectDetailPage() {
  const params = useParams();
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  const project = state.projects.find(p => p.id === params.id);
  if (!project) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Project not found</div>;

  const subAdmin = state.users.find(u => u.id === project.subAdminId);
  const thekedar = state.users.find(u => u.id === project.thekedarId);
  const tasks = state.tasks.filter(t => t.projectId === project.id);
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const updates = state.dailyUpdates.filter(u => u.projectId === project.id);
  const materials = state.materialRequests.filter(mr => mr.projectId === project.id);
  const issues = state.issues.filter(i => i.projectId === project.id);
  const photos = state.sitePhotos.filter(p => p.projectId === project.id);
  const reports = state.dailyReports.filter(r => r.projectId === project.id);
  const workers = state.workers.filter(w => w.assignedSiteId === project.siteId);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'progress', label: 'Progress' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'materials', label: 'Materials' },
    { id: 'labour', label: 'Labour' },
    { id: 'issues', label: 'Issues' },
    { id: 'updates', label: 'Updates' },
    { id: 'photos', label: 'Photos' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link href="/owner/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      {/* Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{project.name}</h1>
              <span className={`status-badge ${getStatusBg(project.status)}`}>{project.status}</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{project.client}</span> • {project.location}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{project.address}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{project.progress}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overall Progress</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar" style={{ height: '10px', marginTop: '16px', borderRadius: '5px' }}>
          <div className={`progress-bar-fill ${getProgressColor(project.progress)}`} style={{ width: `${project.progress}%`, borderRadius: '5px' }} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginTop: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Project Value</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{formatCurrency(project.projectValue)}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Tasks</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{completedTasks.length}/{tasks.length} done</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(6,182,212,0.06)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Workers Today</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{project.workerCount}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Material Requests</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{materials.length}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Open Issues</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{issues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(168,85,247,0.06)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Timeline</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{formatDate(project.startDate)} — {formatDate(project.expectedCompletion)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Team */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Project Team</h3>
            {[
              { label: 'Site Manager', user: subAdmin },
              { label: 'Thekedar', user: thekedar },
              { label: 'Client', user: { name: project.client } },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(30,41,59,0.5)' : 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.user?.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Description */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Project Details</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>{project.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <MapPin size={14} /> {project.address}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Calendar size={14} /> {formatDate(project.startDate)} — {formatDate(project.expectedCompletion)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <IndianRupee size={14} /> {formatCurrency(project.projectValue)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Daily Progress Updates</h3>
          {updates.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No progress updates yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {updates.map((update, i) => (
                <div key={update.id} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: i < updates.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{update.time}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{update.taskName}</span>
                      <span className={`status-badge ${getStatusBg(update.status)}`} style={{ fontSize: '11px' }}>{update.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{update.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>Progress: {update.progress}%</span>
                      <span>By: {update.submittedByName}</span>
                      <span>{formatDate(update.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Tasks ({tasks.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map(task => (
              <div key={task.id} style={{ padding: '16px', borderRadius: '10px', background: 'rgba(148,163,184,0.04)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>{task.name}</span>
                    <span className={`status-badge ${getStatusBg(task.status)}`} style={{ fontSize: '11px' }}>{task.status}</span>
                  </div>
                  <span className={`status-badge ${getStatusBg(task.priority)}`} style={{ fontSize: '11px' }}>{task.priority}</span>
                </div>
                <div className="progress-bar" style={{ marginBottom: '8px' }}>
                  <div className={`progress-bar-fill ${getProgressColor(task.progress)}`} style={{ width: `${task.progress}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{task.progress}% complete</span>
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Material Requests ({materials.length})</h3>
          {materials.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No material requests</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Material</th><th>Qty</th><th>Priority</th><th>Requested By</th><th>Status</th></tr>
              </thead>
              <tbody>
                {materials.map(mr => (
                  <tr key={mr.id}>
                    <td style={{ fontWeight: 600, fontSize: '13px' }}>{mr.requestId}</td>
                    <td>{mr.materialName}</td>
                    <td>{mr.quantity} {mr.unit}</td>
                    <td><span className={`status-badge ${getStatusBg(mr.priority)}`} style={{ fontSize: '11px' }}>{mr.priority}</span></td>
                    <td style={{ fontSize: '13px' }}>{mr.requestedByName}</td>
                    <td><span className={`status-badge ${getStatusBg(mr.status)}`} style={{ fontSize: '11px' }}>{mr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'labour' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Workers ({workers.length})</h3>
          <table className="data-table">
            <thead>
              <tr><th>Worker ID</th><th>Name</th><th>Trade</th><th>Daily Wage</th><th>Status</th></tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 600, fontSize: '13px' }}>{w.workerId}</td>
                  <td>{w.name}</td>
                  <td><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{w.trade}</span></td>
                  <td>{formatCurrency(w.dailyWage)}</td>
                  <td><span className={`status-badge ${getStatusBg(w.status === 'Active' ? 'On Track' : 'Delayed')}`} style={{ fontSize: '11px' }}>{w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Issues ({issues.length})</h3>
          {issues.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No issues reported</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {issues.map(issue => (
                <div key={issue.id} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(148,163,184,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{issue.issueId}</span>
                        <span className={`status-badge ${getStatusBg(issue.priority)}`} style={{ fontSize: '11px' }}>{issue.priority}</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{issue.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{issue.description}</div>
                    </div>
                    <span className={`status-badge ${getStatusBg(issue.status)}`} style={{ fontSize: '11px' }}>{issue.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                    <span>Reported by: {issue.reportedByName}</span>
                    <span>{timeAgo(issue.createdAt)}</span>
                    <span>Category: {issue.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'updates' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Daily Reports</h3>
          {reports.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No daily reports submitted yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reports.map(report => (
                <div key={report.id} style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(148,163,184,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>{formatDate(report.date)}</div>
                    <span className={`status-badge ${getStatusBg(report.overallProgress)}`} style={{ fontSize: '11px' }}>{report.overallProgress}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Workers Present</div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>{report.workersPresent}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Submitted By</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{report.submittedByName}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong>Work Completed:</strong> {report.workCompleted}
                  </div>
                  {report.materialNeeded && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <strong>Material Needed:</strong> {report.materialNeeded}
                    </div>
                  )}
                  {report.issues && (
                    <div style={{ fontSize: '13px', color: '#ef4444' }}>
                      <strong>Issues:</strong> {report.issues}
                    </div>
                  )}
                  {report.notes && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                      {report.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Site Photos ({photos.length})</h3>
          {photos.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No photos uploaded yet</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {photos.map(photo => (
                <div key={photo.id} style={{ borderRadius: '12px', overflow: 'hidden', background: 'rgba(148,163,184,0.08)', border: '1px solid var(--border-color)' }}>
                  <div style={{ aspectRatio: '4/3', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={26} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{photo.caption}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{photo.uploadedByName} • {timeAgo(photo.createdAt)}</div>
                    <span className={`status-badge ${getStatusBg(photo.category === 'Issue' ? 'High' : 'On Track')}`} style={{ fontSize: '10px', marginTop: '6px' }}>{photo.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
