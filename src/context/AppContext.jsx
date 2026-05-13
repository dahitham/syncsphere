import React, { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);

const AVATAR_COLORS = [
  { bg: '#E8E4F0', text: '#5B4FA8' },
  { bg: '#E4EDF0', text: '#2E7D9A' },
  { bg: '#F0EBE4', text: '#9A6B2E' },
  { bg: '#E4F0E8', text: '#2E8A52' },
  { bg: '#F0E4E8', text: '#9A2E52' },
  { bg: '#EDE4F0', text: '#7A2E9A' },
];

function daysDiff(dateStr) {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

const getTaskPriority = (task) => {
  if (task.status === 'Finished') return 'low';

  const diff = daysDiff(task.deadline);
  if (diff < 0 || diff <= 1) return 'high';
  if (diff <= 3) return 'medium';
  return 'low';
};

const buildNotifications = (tasks) =>
  tasks
    .map(task => {
      if (task.status === 'Finished') return null;

      const diff = daysDiff(task.deadline);
      if (diff < 0) {
        return {
          ...task,
          type: 'overdue',
          icon: '⚠️',
          message: `Task is overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''}`,
        };
      }

      if (task.status === 'Not Started') {
        return {
          ...task,
          type: 'notStarted',
          icon: '⏳',
          message: 'Task has not started yet',
        };
      }

      if (task.status === 'In Progress') {
        return {
          ...task,
          type: 'inProgress',
          icon: '⏱️',
          message: 'Task is currently in progress',
        };
      }

      return null;
    })
    .filter(Boolean);

export function AppProvider({ children }) {
  const [members, setMembers] = useState([
    { id: 1, name: 'Alexandra Chen', color: AVATAR_COLORS[0] },
    { id: 2, name: 'Marcus Webb', color: AVATAR_COLORS[1] },
    { id: 3, name: 'Priya Sharma', color: AVATAR_COLORS[2] },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Redesign onboarding flow', memberId: 1, deadline: '2025-05-03', status: 'In Progress' },
    { id: 2, title: 'API performance audit', memberId: 2, deadline: '2025-05-10', status: 'Not Started' },
    { id: 3, title: 'Q2 investor report', memberId: 3, deadline: '2025-04-28', status: 'Finished' },
    { id: 4, title: 'User research synthesis', memberId: 1, deadline: '2025-05-15', status: 'Not Started' },
    { id: 5, title: 'Deploy staging environment', memberId: 2, deadline: '2025-04-30', status: 'In Progress' },
    { id: 6, title: 'Brand identity update', memberId: 3, deadline: '2025-05-20', status: 'Not Started' },
  ]);

  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem('syncsphere-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('syncsphere-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addMember = (name) => {
    const color = AVATAR_COLORS[members.length % AVATAR_COLORS.length];
    setMembers(prev => [...prev, { id: Date.now(), name, color }]);
  };

  const removeMember = (id) => setMembers(prev => prev.filter(m => m.id !== id));

  const addTask = (task) => {
    setTasks(prev => [...prev, { ...task, id: Date.now(), status: 'Not Started' }]);
  };

  const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const removeAllTasks = () => setTasks([]);

  const updateTaskStatus = (id, status) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));

  const updateTaskMember = (id, memberId) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, memberId } : t));

  const getOverdueTasks = () =>
    tasks.filter(t => t.status !== 'Finished' && daysDiff(t.deadline) < 0);

  const getDueSoonTasks = () =>
    tasks.filter(t => t.status !== 'Finished' && daysDiff(t.deadline) >= 0 && daysDiff(t.deadline) <= 2);

  const getNotifications = () => buildNotifications(tasks);

  return (
    <AppContext.Provider value={{
      members, tasks, addMember, removeMember,
      addTask, removeTask, removeAllTasks, updateTaskStatus, updateTaskMember,
      getOverdueTasks, getDueSoonTasks, daysDiff,
      getTaskPriority, getNotifications,
      theme, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
