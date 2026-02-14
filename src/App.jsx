import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LiveMonitor from './components/LiveMonitor';
import IRPSMIntegration from './components/IRPSMIntegration';

function App() {
  const [activeView, setActiveView] = useState('monitor');

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
        <Header />

        <main className="flex-1 overflow-hidden relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${activeView === 'monitor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <LiveMonitor />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-300 ${activeView === 'irpsm' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <IRPSMIntegration />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
