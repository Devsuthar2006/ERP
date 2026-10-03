'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Building2, Shield, HardHat, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const { login, loginAs } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        const u = ['owner@demo.com', 'rahul@demo.com', 'amit@demo.com', 'neeraj@demo.com'];
        if (email === 'owner@demo.com') router.push('/owner/dashboard');
        else if (u.slice(1).includes(email)) router.push('/subadmin/dashboard');
        else router.push('/thekedar/home');
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    setLoading(true);
    loginAs(role);
    setTimeout(() => {
      switch (role) {
        case 'owner': router.push('/owner/dashboard'); break;
        case 'subadmin': router.push('/subadmin/dashboard'); break;
        case 'thekedar': router.push('/thekedar/home'); break;
      }
    }, 250);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f8fafc' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '12px', background: '#0f172a', marginBottom: '14px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>
            <Building2 size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.02em' }}>Interior Operations</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>From Site to Office — Complete Project Visibility</p>
        </div>

        {/* Login Form */}
        <div className="glass-card" style={{ padding: '30px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '20px' }}>Sign In to Portal</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ marginBottom: '16px', padding: '9px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', fontSize: '13px', border: '1px solid #fecaca', fontWeight: 500 }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '11px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>

        {/* Quick Login */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Demo Quick Login</span>
            <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => handleQuickLogin('owner')}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
                background: '#f8fafc', border: '1px solid var(--border-color)',
                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease',
                color: 'var(--text-primary)', width: '100%', textAlign: 'left',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Login as Owner / Director</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Rajesh Singhania • Full Access</div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
            </button>

            <button
              onClick={() => handleQuickLogin('subadmin')}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
                background: '#f8fafc', border: '1px solid var(--border-color)',
                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease',
                color: 'var(--text-primary)', width: '100%', textAlign: 'left',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Login as Site Manager (Sub-Admin)</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Rahul Sharma • 5 Assigned Sites</div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
            </button>

            <button
              onClick={() => handleQuickLogin('thekedar')}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
                background: '#f8fafc', border: '1px solid var(--border-color)',
                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease',
                color: 'var(--text-primary)', width: '100%', textAlign: 'left',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HardHat size={18} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Login as Thekedar / Contractor</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Mahesh Kumar • Site Supervisor</div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '14px' }}>
            Demo Mode • Default Password: <code>demo123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
