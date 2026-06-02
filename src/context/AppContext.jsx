import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  isSuperAdminLoggedIn, getSuperAdminSession,
  superAdminLogin as svcSuperAdminLogin, superAdminLogout as svcSuperAdminLogout,
  getResidents, saveResidents, addResident,
  getPendingApprovals, savePendingApprovals,
  approvePending as svcApprovePending, rejectPending as svcRejectPending,
  getAccessLog, appendAccessEvent,
  getConciergeQrLog, logConciergeQrRequest,
  getSosAlerts, logSosAlert,
} from '../services/mockService';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialView = urlParams.get('view') === 'simulator' ? 'simulator' : isSuperAdminLoggedIn() ? 'superadmin' : 'login';

  const [currentView, setCurrentView] = useState(initialView);
  const [activeUser, setActiveUser] = useState(isSuperAdminLoggedIn() ? getSuperAdminSession() : null);
  const [superAdminSession, setSuperAdminSession] = useState(isSuperAdminLoggedIn() ? getSuperAdminSession() : null);
  const [residents, setResidents] = useState(getResidents);
  const [gateState, setGateState] = useState('closed');
  const [lastOpenedBy, setLastOpenedBy] = useState(null);
  const [accessHistory, setAccessHistory] = useState(getAccessLog);
  const [pendingApprovals, setPendingApprovals] = useState(getPendingApprovals);
  const [conciergeQrLog, setConciergeQrLog] = useState(getConciergeQrLog);
  const [sosAlerts, setSosAlerts] = useState(getSosAlerts);
  const [guestPasses, setGuestPasses] = useState([
    { id: 'QR-8821', guestName: 'Pedro Martínez', createdBy: { name: 'Moisés Álvarez', rut: '12.345.678-9', departamento: 12, torre: 8 }, createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), expires: new Date(Date.now() + 86400000).toISOString(), status: 'active', issuedBy: 'resident' },
    { id: 'QR-4419', guestName: 'Ana López', createdBy: { name: 'Francisco Pino', rut: '22.741.856-K', departamento: 15, torre: 6 }, createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), expires: new Date(Date.now() - 3600000).toISOString(), status: 'used', issuedBy: 'resident' },
  ]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    newSocket.on('GATE_STATE_CHANGE', (data) => { setGateState(data.state); setLastOpenedBy(data.user); });
    return () => newSocket.close();
  }, []);

  const broadcastGateState = (state, user) => { if (socket) socket.emit('GATE_STATE_CHANGE', { state, user }); };

  // ─── SuperAdmin Auth ───────────────────────────────────────────────────────
  const superAdminLogin = useCallback((username, password) => {
    const result = svcSuperAdminLogin(username, password);
    if (result.success) { setSuperAdminSession(result.session); setActiveUser(result.session); setCurrentView('superadmin'); }
    return result;
  }, []);

  const superAdminLogout = useCallback(() => {
    svcSuperAdminLogout(); setSuperAdminSession(null); setActiveUser(null); setCurrentView('login');
    window.history.pushState({}, '', window.location.pathname);
  }, []);

  // ─── Enrollment ───────────────────────────────────────────────────────────
  const enrollResident = useCallback(({ name, rut, departamento, torre, deviceId, patente, vehiculo }) => {
    if (residents.some((r) => r.rut === rut)) return { success: false, error: 'RUT_DUPLICADO', message: 'Ya existe un residente con este RUT.' };
    if (deviceId && residents.some((r) => r.deviceId === deviceId)) return { success: false, error: 'DISPOSITIVO_DUPLICADO', message: 'Este dispositivo ya está vinculado a otro residente.' };
    const newResident = { id: Date.now(), name, rut, departamento: Number(departamento), torre: Number(torre), deviceId: deviceId || `MANUAL-${Date.now()}`, patente: patente || null, vehiculo: vehiculo || null, role: 'resident', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.split(' ')[0]}`, enrolledAt: new Date().toISOString() };
    const updated = addResident(newResident);
    setResidents(updated);
    return { success: true, resident: newResident };
  }, [residents]);

  // ─── Approvals ────────────────────────────────────────────────────────────
  const approveUser = useCallback((id) => {
    const result = svcApprovePending(id);
    if (result) { setPendingApprovals(getPendingApprovals()); setResidents(getResidents()); }
    return result;
  }, []);

  const rejectPending = useCallback((id, reason) => {
    svcRejectPending(id, reason); setPendingApprovals(getPendingApprovals());
  }, []);

  // ─── Access Log ───────────────────────────────────────────────────────────
  const addAccessEvent = useCallback((type, overrides = {}) => {
    const event = appendAccessEvent(type, overrides);
    setAccessHistory((prev) => [event, ...prev].slice(0, 200));
    return event;
  }, []);

  // ─── Concierge QR Log ──────────────────────────────────────────────────────
  const addConciergeQrRequest = useCallback((data) => {
    const entry = logConciergeQrRequest(data);
    setConciergeQrLog((prev) => [entry, ...prev]);
    return entry;
  }, []);

  // ─── SOS ─────────────────────────────────────────────────────────────────
  const sendSosAlert = useCallback((resident) => {
    const alert = logSosAlert({ residentName: resident.name, rut: resident.rut, departamento: resident.departamento, torre: resident.torre });
    setSosAlerts((prev) => [alert, ...prev]);
    // Also log as access event
    const event = appendAccessEvent('entry', { name: resident.name, accessType: 'SOS', type: 'sos', departamento: resident.departamento, torre: resident.torre });
    setAccessHistory((prev) => [event, ...prev].slice(0, 200));
    return alert;
  }, []);

  // ─── General ─────────────────────────────────────────────────────────────
  const login = (role) => {
    if (role === 'resident') { setActiveUser(residents[0]); setCurrentView('resident'); }
    else if (role === 'admin') { setActiveUser({ name: 'Admin Conserjería', role: 'admin' }); setCurrentView('admin'); }
    else if (role === 'simulator') { setCurrentView('simulator'); window.history.pushState({}, '', '?view=simulator'); }
  };

  const logout = () => { setActiveUser(null); setCurrentView('login'); window.history.pushState({}, '', window.location.pathname); };

  const openGate = (user) => {
    if (gateState !== 'closed') return;
    const openingUser = user || activeUser || { name: 'Demo Remoto' };
    setGateState('opening');
    broadcastGateState('opening', openingUser);
    setTimeout(() => {
      setGateState('open');
      setLastOpenedBy(openingUser);
      broadcastGateState('open', openingUser);
      const newEntry = { id: Date.now(), time: new Date().toISOString(), name: openingUser.name, method: openingUser.method || 'App', type: 'entry', departamento: openingUser.departamento || null, torre: openingUser.torre || null, accessType: openingUser.method || 'App' };
      setAccessHistory((prev) => [newEntry, ...prev]);
      setTimeout(() => { setGateState('closed'); setLastOpenedBy(null); broadcastGateState('closed', null); }, 5000);
    }, 1500);
  };

  const revokeAccess = (residentId) => alert('Acceso revocado temporalmente.');

  const generateGuestPass = (guestName, resident, issuedBy = 'resident') => {
    const pass = { id: `QR-${Math.floor(Math.random() * 10000)}`, guestName, createdBy: resident ? { name: resident.name, rut: resident.rut, departamento: resident.departamento, torre: resident.torre } : { name: activeUser?.name || 'Desconocido', rut: activeUser?.rut || 'N/A', departamento: activeUser?.departamento || 0, torre: activeUser?.torre || 0 }, createdAt: new Date().toISOString(), expires: new Date(Date.now() + 86400000).toISOString(), status: 'active', issuedBy };
    setGuestPasses((prev) => [pass, ...prev]);
    return pass;
  };

  const generateResidentQR = (rut) => {
    const resident = residents.find((r) => r.rut === rut);
    if (!resident) return { success: false, error: 'RUT_NO_ENCONTRADO', message: 'No se encontró un residente con este RUT.' };
    const qrData = { type: 'RESIDENT_ACCESS', id: resident.id, name: resident.name, rut: resident.rut, departamento: resident.departamento, torre: resident.torre, deviceId: resident.deviceId, generatedAt: new Date().toISOString(), validUntil: new Date(Date.now() + 86400000 * 365).toISOString() };
    return { success: true, resident, qrData };
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView, activeUser, login, logout,
      superAdminSession, superAdminLogin, superAdminLogout,
      residents, setResidents, enrollResident,
      gateState, openGate, lastOpenedBy,
      accessHistory, addAccessEvent,
      pendingApprovals, approveUser, rejectPending, revokeAccess,
      guestPasses, generateGuestPass, generateResidentQR,
      conciergeQrLog, addConciergeQrRequest,
      sosAlerts, sendSosAlert,
    }}>
      {children}
    </AppContext.Provider>
  );
};
