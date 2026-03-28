import React, { useState } from 'react';
import { usePrep } from './context/PrepContext';
import BottomNav from './components/BottomNav';
import DashboardView from './views/DashboardView';
import SubjectsView from './views/SubjectsView';
import ScheduleView from './views/ScheduleView';
import SetupView from './views/SetupView';
import TimerView from './views/TimerView';
import PlanSwitcherView from './views/PlanSwitcherView';

function App() {
  const { settings } = usePrep();
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Active Timer state
  const [activeTopic, setActiveTopic] = useState(null);

  if (!settings.setupComplete) {
    return <SetupView />;
  }

  // If a topic timer is active, show only the TimerView full screen
  if (activeTopic) {
    return <TimerView topic={activeTopic} onClose={() => setActiveTopic(null)} />;
  }

  // Render current tab view
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onStartTimer={setActiveTopic} onSwitchPlan={() => setActiveTab('plans')} />;
      case 'plans':
        return <PlanSwitcherView onBack={() => setActiveTab('dashboard')} />;
      case 'subjects':
        return <SubjectsView />;
      case 'schedule':
        return <ScheduleView />;
      default:
        return <DashboardView onStartTimer={setActiveTopic} />;
    }
  };

  return (
    <div className="app-container">
      {renderView()}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
