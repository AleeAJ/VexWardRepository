import React, { useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import LoginView from './views/LoginView';
import ResidentApp from './views/ResidentApp';
import AdminDashboard from './views/AdminDashboard';
import GateSimulator from './views/GateSimulator';

const VIEW_TITLES = {
  login: 'VexWard - Inicio | VexCorp',
  admin: 'VexWard - Panel | VexCorp',
  resident: 'VexWard - Residentes | VexCorp',
  simulator: 'VexWard - Reja | VexCorp',
};

function App() {
  const { currentView } = useAppContext();

  useEffect(() => {
    document.title = VIEW_TITLES[currentView] || 'VexWard';
  }, [currentView]);

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 font-sans">
      {currentView === 'login' && <LoginView />}
      {currentView === 'resident' && <ResidentApp />}
      {currentView === 'admin' && <AdminDashboard />}
      {currentView === 'simulator' && <GateSimulator />}
    </div>
  );
}

export default App;
