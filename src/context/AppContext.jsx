import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Check URL parameters for direct view routing
  const urlParams = new URLSearchParams(window.location.search);
  const initialView = urlParams.get('view') === 'simulator' ? 'simulator' : 'login';

  // Navigation State
  const [currentView, setCurrentView] = useState(initialView);
  
  // Active User State
  const [activeUser, setActiveUser] = useState(null);

  // Mock Data
  const [residents] = useState([
    { id: 1, name: 'Moisés Álvarez', house: 'Casa 12', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moises' },
    { id: 2, name: 'Lucas', house: 'Casa 8', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas' },
    { id: 3, name: 'Francisco Pino', house: 'Casa 15', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Francisco' },
    { id: 4, name: 'Sebastian Peñaloza', house: 'Casa 22', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sebastian' },
  ]);

  // Gate State
  const [gateState, setGateState] = useState('closed'); // 'closed', 'opening', 'open'
  const [lastOpenedBy, setLastOpenedBy] = useState(null);

  // History Log
  const [accessHistory, setAccessHistory] = useState([
    { id: 101, time: new Date(Date.now() - 3600000).toISOString(), name: 'Francisco Pino', method: 'App', type: 'entry' },
    { id: 102, time: new Date(Date.now() - 7200000).toISOString(), name: 'Lucas', method: 'QR Invitado', type: 'entry' },
  ]);

  // Pending Approvals
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 201, name: 'Carlos Díaz', house: 'Casa 45', requestTime: new Date(Date.now() - 86400000).toISOString() },
    { id: 202, name: 'María Gómez', house: 'Casa 7', requestTime: new Date(Date.now() - 172800000).toISOString() },
  ]);

  // Socket State
  const [socket, setSocket] = useState(null);

  // WebSocket Connection
  useEffect(() => {
    // Connect to the proxy on the same port
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Conectado al servidor WebSocket de VexWard');
    });

    newSocket.on('GATE_STATE_CHANGE', (data) => {
      setGateState(data.state);
      setLastOpenedBy(data.user);
    });

    return () => newSocket.close();
  }, []);

  // Broadcast helper
  const broadcastGateState = (state, user) => {
    if (socket) {
      socket.emit('GATE_STATE_CHANGE', { state, user });
    }
  };

  // Actions
  const login = (role) => {
    if (role === 'resident') {
      setActiveUser(residents[0]); // Default to Moisés
      setCurrentView('resident');
    } else if (role === 'admin') {
      setActiveUser({ name: 'Admin Conserjería', role: 'admin' });
      setCurrentView('admin');
    } else if (role === 'simulator') {
      setCurrentView('simulator');
      window.history.pushState({}, '', '?view=simulator');
    }
  };

  const logout = () => {
    setActiveUser(null);
    setCurrentView('login');
    window.history.pushState({}, '', window.location.pathname);
  };

  const openGate = (user) => {
    if (gateState !== 'closed') return;
    
    const openingUser = user || activeUser || { name: 'Demo Remoto' };
    
    setGateState('opening');
    broadcastGateState('opening', openingUser);
    
    setTimeout(() => {
      setGateState('open');
      setLastOpenedBy(openingUser);
      broadcastGateState('open', openingUser);
      
      // Log history
      const newEntry = {
        id: Date.now(),
        time: new Date().toISOString(),
        name: openingUser.name,
        method: 'App',
        type: 'entry'
      };
      setAccessHistory(prev => [newEntry, ...prev]);

      // Auto close after 5 seconds
      setTimeout(() => {
        setGateState('closed');
        setLastOpenedBy(null);
        broadcastGateState('closed', null);
      }, 5000);
      
    }, 1500); // Simulate network/mechanical delay
  };
  
  const revokeAccess = (residentId) => {
    console.log(`Access revoked for resident ID: ${residentId}`);
    alert(`Acceso revocado temporalmente.`);
  };

  const approveUser = (id) => {
    setPendingApprovals(prev => prev.filter(req => req.id !== id));
  };

  const generateGuestPass = (guestName) => {
    const pass = {
      id: `QR-${Math.floor(Math.random() * 10000)}`,
      guestName,
      expires: new Date(Date.now() + 86400000).toISOString(),
    };
    return pass;
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView,
      activeUser, login, logout,
      residents,
      gateState, openGate, lastOpenedBy,
      accessHistory,
      pendingApprovals, approveUser, revokeAccess,
      generateGuestPass
    }}>
      {children}
    </AppContext.Provider>
  );
};
