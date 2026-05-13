import React from 'react';
import { useApp } from '../context/AppContext';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const NAV_ITEMS = [
  { id: 'Dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'Tasks', label: 'Tasks', icon: '◻' },
  { id: 'Team', label: 'Team', icon: '◯' },
];

export default function Sidebar({ page, setPage, user, onLogout }) {
  const { theme, toggleTheme } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-name">SyncSphere</div>
        <div className="brand-tagline">Team Platform</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-label">Navigation</div>
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-theme">
        <div className="theme-label">Theme</div>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-row">
          <div className="user-avatar">{initials(user)}</div>
          <div>
            <div className="user-name">{user}</div>
            <div className="user-status">● Online</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <span>⎋</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
