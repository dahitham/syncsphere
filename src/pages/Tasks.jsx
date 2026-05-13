import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import VoiceAssistant from '../components/VoiceAssistant';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const FILTERS = ['All', 'Not Started', 'In Progress', 'Finished', 'Overdue'];

export default function Tasks() {
  const { tasks, members, addTask, removeTask, updateTaskStatus, daysDiff, getTaskPriority } = useApp();
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', memberId: '', deadline: '' });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = tasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Overdue') return t.status !== 'Finished' && daysDiff(t.deadline) < 0;
    return t.status === filter;
  });

  const priorityOrder = { high: 1, medium: 2, low: 3 };
  const sortedTasks = filtered.slice().sort((a, b) => {
    const aPriority = getTaskPriority(a);
    const bPriority = getTaskPriority(b);
    return priorityOrder[aPriority] - priorityOrder[bPriority];
  });

  const getMember = (id) => members.find(m => m.id === id);

  const submit = () => {
    if (!form.title.trim()) { setError('Task title is required.'); return; }
    if (!form.deadline) { setError('Please select a deadline.'); return; }
    addTask({ title: form.title.trim(), memberId: form.memberId ? parseInt(form.memberId) : null, deadline: form.deadline });
    setForm({ title: '', memberId: '', deadline: '' });
    setError('');
    setShowModal(false);
  };

  const statusBarClass = (status) => {
    if (status === 'Finished') return 'status-done';
    if (status === 'In Progress') return 'status-ip';
    return 'status-ns';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-sub">{tasks.length} total tasks across your team</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Task</button>
      </div>

      <VoiceAssistant />

      <div className="filter-row">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === 'Overdue' && tasks.filter(t => t.status !== 'Finished' && daysDiff(t.deadline) < 0).length > 0 && (
              <span style={{ marginLeft: 5, color: 'inherit', opacity: .7 }}>
                ({tasks.filter(t => t.status !== 'Finished' && daysDiff(t.deadline) < 0).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="tasks-grid">
        {sortedTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">◻</div>
            <div className="empty-text">No tasks match this filter</div>
          </div>
        )}
        {sortedTasks.map((task, i) => {
          const member = getMember(task.memberId);
          const diff = daysDiff(task.deadline);
          const isOverdue = task.status !== 'Finished' && diff < 0;
          return (
            <div
              key={task.id}
              className={`task-card${isOverdue ? ' overdue' : ''}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={`task-status-bar ${statusBarClass(task.status)}`} />

              <div className="task-body">
                <div className="task-title-row">
                  <div className="task-title-text">{task.title}</div>
                  <div className={`task-priority priority-${getTaskPriority(task)}`}>
                    {getTaskPriority(task) === 'high' ? '🔴 High' : getTaskPriority(task) === 'medium' ? '🟡 Medium' : '🟢 Low'}
                  </div>
                </div>
                <div className="task-meta-row">
                  {member && (
                    <span className="task-meta-item member-chip">
                      <span
                        className="avatar-xs"
                        style={{ background: member.color.bg, color: member.color.text }}
                      >
                        {initials(member.name)}
                      </span>
                      {member.name}
                    </span>
                  )}
                  <span className="task-meta-item">
                    ◷ {task.deadline}
                  </span>
                  {isOverdue && (
                    <span className="overdue-tag">
                      ⚠ {Math.abs(diff)}d overdue
                    </span>
                  )}
                  {!isOverdue && diff === 0 && task.status !== 'Finished' && (
                    <span className="overdue-tag" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
                      Due today
                    </span>
                  )}
                  {!isOverdue && diff === 1 && task.status !== 'Finished' && (
                    <span className="overdue-tag" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
                      Due tomorrow
                    </span>
                  )}
                </div>
              </div>

              <select
                className="status-select"
                value={task.status}
                onChange={e => updateTaskStatus(task.id, e.target.value)}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Finished</option>
              </select>

              <button className="delete-btn" onClick={() => removeTask(task.id)} title="Delete task">✕</button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">New Task</div>

            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                className="form-input"
                placeholder="e.g. Redesign the landing page"
                value={form.title}
                onChange={set('title')}
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assign to</label>
                <select className="form-input" value={form.memberId} onChange={set('memberId')}>
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.deadline}
                  onChange={set('deadline')}
                />
              </div>
            </div>

            {error && <div style={{ fontSize: 13, color: 'var(--red)', marginBottom: 4 }}>{error}</div>}

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setShowModal(false); setError(''); }}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
