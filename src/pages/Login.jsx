import React, { useState } from 'react';
export default function Login({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.email) { setError('Please enter your email.'); return; }
    if (!form.password) { setError('Please enter your password.'); return; }
    if (mode === 'signup' && !form.name) { setError('Please enter your name.'); return; }
    const displayName = mode === 'signup' ? form.name : (form.email.split('@')[0] || 'User');
    onAuth(displayName);
  };

  return (
    <div className="auth-page">
      <div
        className="auth-left"
        style={{
          backgroundImage: "url('/team-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div>
          <div className="auth-brand">SyncSphere</div>
          <div className="auth-tagline">Team Sync Platform</div>
        </div>
        <div className="auth-quote">
          "The measure of intelligence is the ability to change."
          <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-body)' }}>
            — Albert Einstein
          </div>
        </div>
        <div className="auth-copyright">
          © 2026 SyncSphere
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap fade-in">
          <div className="auth-heading">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </div>
          <div className="auth-sub">
            {mode === 'login'
              ? 'Sign in to your workspace to continue.'
              : 'Start collaborating with your team today.'}
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="Alexandra Chen"
                value={form.name}
                onChange={set('name')}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={set('email')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>{error}</div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}
            onClick={submit}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'} →
          </button>

          <div className="auth-switch-text">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); }}>Sign up free</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
