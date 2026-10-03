'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import {
  LayoutDashboard, FolderKanban, MapPin, Users, Package, AlertTriangle,
  BarChart3, UserCog, Bell, Settings, LogOut, Building2, FileText,
  Home, ListTodo, ClipboardList, User, ChevronLeft, Menu, X, CreditCard,
} from 'lucide-react';
import { useState } from 'react';

const ownerNav = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/projects', label: 'Projects', icon: FolderKanban },
  { href: '/owner/sites', label: 'Sites', icon: MapPin },
  { href: '/owner/labour', label: 'Labour Force', icon: Users },
  { href: '/owner/materials', label: 'Materials', icon: Package },
  { href: '/owner/issues', label: 'Issues', icon: AlertTriangle },
  { href: '/owner/reports', label: 'Reports', icon: BarChart3 },
  { href: '/owner/users', label: 'Users & Contractors', icon: UserCog },
  { href: '/owner/notifications', label: 'Notifications', icon: Bell },
];

const subadminNav = [
  { href: '/subadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subadmin/projects', label: 'My Projects', icon: FolderKanban },
  { href: '/subadmin/sites', label: 'My Sites', icon: MapPin },
  { href: '/subadmin/labour', label: 'Labour Force', icon: Users },
  { href: '/subadmin/materials', label: 'Materials', icon: Package },
  { href: '/subadmin/issues', label: 'Issues', icon: AlertTriangle },
  { href: '/subadmin/reports', label: 'Daily Reports', icon: FileText },
  { href: '/subadmin/notifications', label: 'Notifications', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { state } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const nav = user.role === 'owner' ? ownerNav : subadminNav;
  const unreadCount = state.notifications.filter(n => n.userId === user.id && !n.read).length;

  const renderNav = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '18px 12px' : '18px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={18} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Interior Ops</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Control System</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {nav.map(item => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/owner/dashboard' && item.href !== '/subadmin/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              style={collapsed ? { justifyContent: 'center', padding: '10px' } : { marginBottom: '4px' }}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.label === 'Notifications' && unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#dc2626', color: 'white', fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Connected Fintech Gateway Software (Launches in separate tab) */}
      {!collapsed && user.role === 'owner' && (
        <div style={{ padding: '12px 14px', margin: '0 10px 10px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              INTEGRATED SOFTWARE
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, background: '#ecfdf5', color: '#047857', padding: '1px 5px', borderRadius: '3px' }}>
              SYNCED
            </span>
          </div>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            InteriorPay Gateway
          </div>
          <a
            href="/gateway"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Launch Payout Software ↗
          </a>
        </div>
      )}

      {/* User Section */}
      <div style={{ padding: collapsed ? '14px 8px' : '14px 16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', fontWeight: 700, color: 'white' }}>
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role === 'subadmin' ? 'Site Manager' : user.role === 'owner' ? 'Admin / Owner' : user.role}</div>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="sidebar-link"
          style={{ width: '100%', color: '#ef4444', ...(collapsed ? { justifyContent: 'center', padding: '12px' } : {}) }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="show-mobile-only"
        onClick={() => setMobileOpen(true)}
        style={{ position: 'fixed', top: '12px', left: '12px', zIndex: 60, width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="show-mobile-only" onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 70 }} />
      )}

      {/* Mobile sidebar */}
      <aside
        className="show-mobile-only"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px',
          background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)',
          zIndex: 80, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <button onClick={() => setMobileOpen(false)} style={{ position: 'absolute', top: '16px', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        {renderNav()}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hide-mobile"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: collapsed ? '68px' : '250px',
          background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)',
          transition: 'width 0.3s ease', zIndex: 40, overflow: 'hidden',
        }}
      >
        {renderNav()}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', top: '24px', right: '-12px', width: '24px', height: '24px',
            borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)',
          }}
        >
          <ChevronLeft size={14} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>
      </aside>
    </>
  );
}

export function TopBar({ title }: { title?: string }) {
  const { user } = useAuth();
  const { state } = useStore();
  if (!user) return null;

  const unreadCount = state.notifications.filter(n => n.userId === user.id && !n.read).length;
  const notifHref = user.role === 'owner' ? '/owner/notifications' : '/subadmin/notifications';

  return (
    <header className="hide-mobile" style={{
      height: '64px', borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', background: 'var(--bg-primary)',
    }}>
      <div>
        {title && <h1 style={{ fontSize: '18px', fontWeight: 600 }}>{title}</h1>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user.role === 'owner' && (
          <a
            href="/gateway"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: '#0f172a',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <CreditCard size={14} color="#2563eb" />
            Payout Gateway Portal ↗
          </a>
        )}
        <Link href={notifHref} style={{ position: 'relative', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unreadCount}
            </span>
          )}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white' }}>
            {user.name.charAt(0)}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
        </div>
      </div>
    </header>
  );
}

// Thekedar mobile bottom nav
export function ThekedarBottomNav() {
  const pathname = usePathname();
  const navItems = [
    { href: '/thekedar/home', label: 'Home', icon: Home },
    { href: '/thekedar/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/thekedar/materials', label: 'Materials', icon: Package },
    { href: '/thekedar/updates', label: 'Updates', icon: ClipboardList },
    { href: '/thekedar/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)', height: '60px',
    }}>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Desktop layout wrapper for owner/subadmin
export function DesktopLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '250px', transition: 'margin 0.3s ease' }} className="desktop-main">
        <TopBar title={title} />
        <div style={{ padding: '24px 28px' }}>
          {children}
        </div>
      </main>
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-main {
            margin-left: 0 !important;
            padding-top: 56px;
          }
          .desktop-main > div {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Mobile layout wrapper for thekedar
export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '70px' }}>
      {children}
      <ThekedarBottomNav />
    </div>
  );
}
