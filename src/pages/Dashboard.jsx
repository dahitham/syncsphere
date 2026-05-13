import React from 'react';
import { useApp } from '../context/AppContext';
import TaskChart from '../components/TaskChart';
import NotificationBell from '../components/NotificationBell';

export default function Dashboard() {
  const { tasks, members, getNotifications, daysDiff } = useApp();

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Finished').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const pending = total - done;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const notifications = getNotifications();
  const alerts = notifications;

  const getMemberName = (id) => members.find(m => m.id === id)?.name || '—';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-sub">Your team's performance at a glance</div>
        </div>
        <div className="header-actions">
          <NotificationBell />
          <div className="dashboard-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-eyebrow">Total Tasks</div>
          <div className="stat-value">{total}</div>
          <div className="stat-badge badge-accent">Active workspace</div>
        </div>

        <div className="stat-card green">
          <div className="stat-eyebrow">Completed</div>
          <div className="stat-value">{done}</div>
          <div className="progress-section">
            <div className="progress-label">
              <span>Progress</span><span>{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: pct + '%' }} />
            </div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-eyebrow">Pending</div>
          <div className="stat-value">{pending}</div>
          <div className="stat-badge badge-gold">{inProgress} in progress</div>
        </div>

        <div className="stat-card muted">
          <div className="stat-eyebrow">Team Members</div>
          <div className="stat-value">{members.length}</div>
          <div className="stat-badge badge-muted">Collaborators</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-title">
            <span>Notifications</span>
            {alerts.length > 0 && (
              <span style={{
                background: 'var(--red-light)', color: 'var(--red)',
                fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 99
              }}>
                {alerts.length}
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <div className="empty-text">All tasks are on schedule</div>
            </div>
          ) : (
            <div className="notif-list">
              {alerts.map(t => {
                const diff = daysDiff(t.deadline);
                const isOverdue = t.type === 'overdue';
                return (
                  <div key={t.id} className={`notif-item ${isOverdue ? 'notif-overdue' : 'notif-soon'}`}>
                    <span className="notif-icon">{isOverdue ? '⚠' : '◷'}</span>
                    <div>
                      <div className="notif-title">{t.title}</div>
                      <div className="notif-meta">
                        {getMemberName(t.memberId)} ·{' '}
                        {isOverdue
                          ? `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`
                          : diff === 0 ? 'Due today' : `Due in ${diff} day${diff !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Task Distribution</div>
          <TaskChart tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
