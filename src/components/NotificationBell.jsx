import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const TYPE_LABELS = {
  overdue: { title: 'Overdue task', color: 'var(--red)' },
  notStarted: { title: 'Not started', color: 'var(--amber)' },
  inProgress: { title: 'In progress', color: 'var(--accent)' },
};

export default function NotificationBell() {
  const { getNotifications } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const notifications = useMemo(() => getNotifications(), [getNotifications]);
  const count = notifications.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [open]);

  return (
    <div className="notification-bell" ref={ref}>
      <button
        className={`bell-button${open ? ' active' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        type="button"
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {count > 0 && <span className="bell-count">{count}</span>}
      </button>

      <div className={`notification-dropdown${open ? ' open' : ''}`}>
        <div className="notification-header">
          <span>Notifications</span>
          <span className="notification-header-meta">{count} items</span>
        </div>

        {count === 0 ? (
          <div className="notification-empty">You're all caught up.</div>
        ) : (
          <div className="notification-list">
            {notifications.map((item) => {
              const label = TYPE_LABELS[item.type] || { title: 'Update', color: 'var(--text)' };
              return (
                <div key={item.id} className="notification-item">
                  <div className="notification-chip" style={{ background: label.color }}>
                    {item.icon}
                  </div>
                  <div className="notification-body">
                    <div className="notification-title">{item.title}</div>
                    <div className="notification-message">{item.message}</div>
                  </div>
                  <div className="notification-tag" style={{ color: label.color }}>
                    {label.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
