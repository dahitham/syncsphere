import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Team from './pages/Team';

function Shell({ user, onLogout }) {
  const [page, setPage] = useState('Dashboard');

  const pages = {
    Dashboard: <Dashboard />,
    Tasks: <Tasks />,
    Team: <Team />,
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={onLogout} />
      <main className="main-content">
        {pages[page]}
      </main>
      <Chatbot />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <AppProvider>
        <Login onAuth={(name) => setUser(name)} />
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <Shell user={user} onLogout={() => setUser(null)} />
    </AppProvider>
  );
}
