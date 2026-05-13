# SyncSphere — Team Sync Platform

A modern, elegant team task management application built with React.js.

## Features

- **Authentication UI** — Login & Signup with split-screen layout
- **Dashboard** — Stats cards, progress bars, doughnut chart, deadline notifications
- **Task Management** — Create, assign, filter, update status, delete tasks
- **Team Management** — Add/remove members with per-member progress tracking
- **Deadline Alerts** — Overdue tasks highlighted in red, smart notification panel

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
syncsphere/
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   └── AppContext.jsx      # Global state (tasks, members)
│   ├── pages/
│   │   ├── Login.jsx           # Auth UI (Login / Signup)
│   │   ├── Dashboard.jsx       # Stats, chart, notifications
│   │   ├── Tasks.jsx           # Task list with filters
│   │   └── Team.jsx            # Member management
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   └── TaskChart.jsx       # Doughnut chart (Chart.js)
│   ├── App.jsx                 # Root component + routing
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
└── package.json
```

## Tech Stack

- React 18 (functional components, hooks)
- Context API for global state
- Chart.js + react-chartjs-2 for the doughnut chart
- Google Fonts: Cormorant Garamond + DM Sans

## Design Notes

The UI uses an **elegant, professional** aesthetic inspired by luxury editorial design:
- Warm cream tones with deep charcoal sidebar
- Cormorant Garamond for display headings
- Subtle shadows, smooth animations, hover lift effects
- Status colors: navy (accent), forest green (done), warm gold (in progress), deep red (overdue)
