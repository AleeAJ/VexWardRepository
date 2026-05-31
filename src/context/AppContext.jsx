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

  // Residents Data (enrolled residents)
  const [residents, setResidents] = useState([
    { id: 1, name: 'Moisés Álvarez', departamento: 12, torre: 8, rut: '12.345.678-9', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moises', deviceId: 'iPhone-A1B2C3', enrolledAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 2, name: 'Lucas Fernández', departamento: 8, torre: 2, rut: '19.283.746-5', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas', deviceId: 'Samsung-D4E5F6', enrolledAt: new Date(Date.now() - 86400000 * 20).toISOString() },
    { id: 3, name: 'Francisco Pino', departamento: 15, torre: 6, rut: '22.741.856-K', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Francisco', deviceId: 'Pixel-G7H8I9', enrolledAt: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: 4, name: 'Sebastian Peñaloza', departamento: 22, torre: 8, rut: '27.394.851-3', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sebastian', deviceId: 'iPhone-J0K1L2', enrolledAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  ]);

  // Gate State
  const [gateState, setGateState] = useState('closed'); // 'closed', 'opening', 'open'
  const [lastOpenedBy, setLastOpenedBy] = useState(null);

  // History Log
  const [accessHistory, setAccessHistory] = useState([
    { id: 101, time: new Date(Date.now() - 3600000).toISOString(), name: 'Francisco Pino', method: 'App', type: 'entry' },
    { id: 102, time: new Date(Date.now() - 7200000).toISOString(), name: 'Lucas Fernández', method: 'QR Invitado', type: 'entry' },
  ]);

  // Pending Approvals
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 201, name: 'Carlos Díaz', departamento: 18, torre: 2, rut: '30.128.745-1', requestTime: new Date(Date.now() - 86400000).toISOString() },
    { id: 202, name: 'María Gómez', departamento: 7, torre: 6, rut: '28.654.321-0', requestTime: new Date(Date.now() - 172800000).toISOString() },
  ]);

  // Global Guest Passes Log (visible to admin)
  const [guestPasses, setGuestPasses] = useState([
    { 
      id: 'QR-8821', 
      guestName: 'Pedro Martínez', 
      createdBy: { name: 'Moisés Álvarez', rut: '12.345.678-9', departamento: 12, torre: 8 },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      expires: new Date(Date.now() + 86400000).toISOString(),
      status: 'active' // 'active', 'used', 'expired'
    },
    { 
      id: 'QR-4419', 
      guestName: 'Ana López', 
      createdBy: { name: 'Francisco Pino', rut: '22.741.856-K', departamento: 15, torre: 6 },
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      expires: new Date(Date.now() - 3600000).toISOString(),
      status: 'used'
    },
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

  // === ENROLLMENT SYSTEM ===
  
  // Enroll a new resident (admin action)
  const enrollResident = ({ name, rut, departamento, torre, deviceId }) => {
    // Validate RUT uniqueness
    const rutExists = residents.some(r => r.rut === rut);
    if (rutExists) {
      return { success: false, error: 'RUT_DUPLICADO', message: 'Ya existe un residente con este RUT.' };
    }

    // Validate device uniqueness
    const deviceExists = residents.some(r => r.deviceId === deviceId);
    if (deviceExists) {
      return { success: false, error: 'DISPOSITIVO_DUPLICADO', message: 'Este dispositivo ya está vinculado a otro residente.' };
    }

    const newResident = {
      id: Date.now(),
      name,
      rut,
      departamento: Number(departamento),
      torre: Number(torre),
      deviceId,
      role: 'resident',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.split(' ')[0]}`,
      enrolledAt: new Date().toISOString(),
    };

    setResidents(prev => [...prev, newResident]);
    return { success: true, resident: newResident };
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

  // Generate a guest pass (called by resident) - now logs to global system
  const generateGuestPass = (guestName, resident) => {
    const pass = {
      id: `QR-${Math.floor(Math.random() * 10000)}`,
      guestName,
      createdBy: resident ? {
        name: resident.name,
        rut: resident.rut,
        departamento: resident.departamento,
        torre: resident.torre,
      } : {
        name: activeUser?.name || 'Desconocido',
        rut: activeUser?.rut || 'N/A',
        departamento: activeUser?.departamento || 0,
        torre: activeUser?.torre || 0,
      },
      createdAt: new Date().toISOString(),
      expires: new Date(Date.now() + 86400000).toISOString(),
      status: 'active',
    };
    
    // Add to global guest passes (visible to admin)
    setGuestPasses(prev => [pass, ...prev]);
    
    return pass;
  };

  // Generate a QR for a resident by RUT (admin action)
  const generateResidentQR = (rut) => {
    const resident = residents.find(r => r.rut === rut);
    if (!resident) {
      return { success: false, error: 'RUT_NO_ENCONTRADO', message: 'No se encontró un residente con este RUT.' };
    }
    
    const qrData = {
      type: 'RESIDENT_ACCESS',
      id: resident.id,
      name: resident.name,
      rut: resident.rut,
      departamento: resident.departamento,
      torre: resident.torre,
      deviceId: resident.deviceId,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 86400000 * 365).toISOString(),
    };
    
    return { success: true, resident, qrData };
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView,
      activeUser, login, logout,
      residents, enrollResident,
      gateState, openGate, lastOpenedBy,
      accessHistory,
      pendingApprovals, approveUser, revokeAccess,
      guestPasses,
      generateGuestPass, generateResidentQR,
    }}>
      {children}
    </AppContext.Provider>
  );
};
