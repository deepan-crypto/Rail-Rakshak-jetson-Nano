/**
 * INTEGRATION EXAMPLE: How to use LiveDashcam in your React app
 * 
 * There are multiple ways to integrate the LiveDashcam component:
 * 1. As the main dashboard (full-page)
 * 2. As a route/page in your router
 * 3. As a modal/drawer component
 * 4. Embedded in another dashboard
 */

// ============================================================
// OPTION 1: Simple direct import (main content)
// ============================================================

import React from 'react';
import LiveDashcam from './components/LiveDashcam';

function App() {
  return <LiveDashcam />;
}

export default App;

// ============================================================
// OPTION 2: Using React Router (recommended for multi-page app)
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LiveDashcam from './components/LiveDashcam';
import Login from './components/Login';

function AppWithRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<LiveDashcam />} />
        {/* Add other routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppWithRouter;

// ============================================================
// OPTION 3: Tab/Tab Panel (in a tabbed interface)
// ============================================================

import { useState } from 'react';
import LiveDashcam from './components/LiveDashcam';
import LiveMonitor from './components/LiveMonitor'; // existing component

function AppWithTabs() {
  const [activeTab, setActiveTab] = useState('dashcam');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Tab Navigation */}
      <div className="flex gap-4 p-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('dashcam')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'dashcam'
              ? 'border-b-2 border-cyan-500 text-cyan-500'
              : 'text-slate-400'
          }`}
        >
          🎥 Live Dashcam
        </button>
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'monitor'
              ? 'border-b-2 border-cyan-500 text-cyan-500'
              : 'text-slate-400'
          }`}
        >
          📊 Monitor
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'dashcam' && <LiveDashcam />}
        {activeTab === 'monitor' && <LiveMonitor />}
      </div>
    </div>
  );
}

export default AppWithTabs;

// ============================================================
// OPTION 4: Conditional Rendering (based on feature flag)
// ============================================================

import { useEffect, useState } from 'react';
import LiveDashcam from './components/LiveDashcam';
import Dashboard from './pages/Dashboard'; // existing page

function AppConditional() {
  const [showTelemetry, setShowTelemetry] = useState(false);

  useEffect(() => {
    // Check if user has permission or feature is enabled
    const userRole = localStorage.getItem('userRole');
    const canViewTelemetry = userRole === 'admin' || userRole === 'controller';
    setShowTelemetry(canViewTelemetry);
  }, []);

  return (
    <div>
      {showTelemetry ? <LiveDashcam /> : <Dashboard />}
    </div>
  );
}

export default AppConditional;

// ============================================================
// OPTION 5: In a Layout with other components
// ============================================================

import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LiveDashcam from './components/LiveDashcam';

function AppWithLayout() {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          <LiveDashcam />
        </div>
      </div>
    </div>
  );
}

export default AppWithLayout;

// ============================================================
// OPTION 6: Full App with Auth & Layout (Production Example)
// ============================================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import LiveDashcam from './components/LiveDashcam';
import LiveMonitor from './components/LiveMonitor';

function ProtectedLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function AppProduction() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/telemetry"
          element={
            <ProtectedLayout>
              <LiveDashcam />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard/monitor"
          element={
            <ProtectedLayout>
              <LiveMonitor />
            </ProtectedLayout>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard/telemetry" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppProduction;

// ============================================================
// CONFIGURATION: Environment Variables
// ============================================================

/*
Add to your .env file in the frontend folder:

VITE_SOCKET_URL=http://localhost:5000

For production (Vercel):
VITE_SOCKET_URL=https://your-backend-domain.com:5000

The LiveDashcam component will automatically use this URL:
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
*/

// ============================================================
// MANUAL SETUP: If you want to customize
// ============================================================

/*
1. Make sure socket.io-client is installed:
   npm install socket.io-client

2. The LiveDashcam component handles everything:
   - Connects to WebSocket automatically
   - Receives real-time telemetry
   - Renders live image feed
   - Displays detection logs
   - Shows connection status

3. No additional setup needed!

4. For styling customization, edit the component directly
   at: frontend/src/components/LiveDashcam.jsx
*/

// ============================================================
// TESTING: Verify the integration works
// ============================================================

/*
1. Start the backend:
   cd backend
   npm start

2. Start the frontend:
   cd frontend
   npm run dev

3. In a new terminal, send test data:
   cd backend
   npm run test:telemetry

4. The dashboard should display the incoming data!

5. For continuous testing:
   npm run test:stream 30  # 30-second stream
*/
