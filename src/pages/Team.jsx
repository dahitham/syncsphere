import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Team() {
  const { members, tasks, addMember, removeMember } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) { setError('Please enter a name.'); return; }
    addMember(name.trim());
    setName('');
    setError('');
    setShowModal(false);
  };

  const getMemberStats = (id) => {
    const mt = tasks.filter(t => t.memberId === id);
    const done = mt.filter(t => t.status === 'Finished').length;
    const inProgress = mt.filter(t => t.status === 'In Progress').length;
    const pct = mt.length ? Math.round((done / mt.length) * 100) : 0;
    return { total: mt.length, done, inProgress, pct };
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Team</div>
          <div className="page-sub">{members.length} collaborator{members.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Member</button>
      </div>

      {members.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◯</div>
          <div className="empty-text">No team members yet. Add one to get started.</div>
        </div>
      )}

      <div className="members-grid">
        {members.map((m, i) => {
          const stats = getMemberStats(m.id);
          return (
            <div key={m.id} className="member-card" style={{ animationDelay: `${i * 60}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  className="member-avatar"
                  style={{ background: m.color.bg, color: m.color.text }}
                >
                  {initials(m.name)}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => removeMember(m.id)}
                  title="Remove member"
                >
                  ✕
                </button>
              </div>

              <div className="member-name">{m.name}</div>
              <div className="member-stats">
                {stats.total} task{stats.total !== 1 ? 's' : ''} · {stats.done} completed
                {stats.inProgress > 0 && ` · ${stats.inProgress} in progress`}
              </div>

              <div className="member-progress">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
                  <span>Progress</span>
                  <span>{stats.pct}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: stats.pct + '%',
                      background: `linear-gradient(90deg, ${m.color.text}, ${m.color.text}aa)`,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {stats.done > 0 && (
                  <span style={{
                    fontSize: 11, padding: '2px 9px', borderRadius: 99,
                    background: 'var(--green-light)', color: 'var(--green)', fontWeight: 600
                  }}>
                    {stats.done} done
                  </span>
                )}
                {stats.inProgress > 0 && (
                  <span style={{
                    fontSize: 11, padding: '2px 9px', borderRadius: 99,
                    background: 'var(--gold-light)', color: 'var(--gold)', fontWeight: 600
                  }}>
                    {stats.inProgress} in progress
                  </span>
                )}
                {stats.total === 0 && (
                  <span style={{
                    fontSize: 11, padding: '2px 9px', borderRadius: 99,
                    background: 'var(--cream2)', color: 'var(--muted)', fontWeight: 600
                  }}>
                    No tasks yet
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Add Team Member</div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="e.g. Alexandra Chen"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                autoFocus
              />
            </div>

            {error && <div style={{ fontSize: 13, color: 'var(--red)', marginBottom: 4 }}>{error}</div>}

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setShowModal(false); setError(''); }}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
