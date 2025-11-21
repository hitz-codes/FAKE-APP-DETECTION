import React, { useState } from 'react';
import { DetectionPanel, ManualCheckForm } from './components';
import { AppData } from './services/api';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'detection' | 'manual'>('detection');
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fake App Detection System</h1>
        <p>Detect suspicious financial apps across PhonePe, Paytm, and GPay platforms</p>
      </header>

      <div className="App-tabs">
        <button
          className={`tab-button ${activeTab === 'detection' ? 'active' : ''}`}
          onClick={() => setActiveTab('detection')}
        >
          Detection Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          Manual App Check
        </button>
      </div>

      <main className="App-main">
        {activeTab === 'detection' && (
          <DetectionPanel 
            selectedApp={selectedApp}
            onAppSelect={setSelectedApp}
          />
        )}
        {activeTab === 'manual' && (
          <ManualCheckForm />
        )}
      </main>
    </div>
  );
};

export default App;
