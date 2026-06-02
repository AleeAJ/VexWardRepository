/**
 * VexWard Mock Service — Extended
 * © VexCorp. Todos los derechos reservados.
 */

// ─── SuperAdmin Credentials ───────────────────────────────────────────────────
const SUPERADMIN_CREDENTIALS = { username: 'MoisesSuperAdmin', password: 'VexWard_Secure2026!' };
const SA_SESSION_KEY = 'vexward_sa_session';

export const superAdminLogin = (username, password) => {
  if (username === SUPERADMIN_CREDENTIALS.username && password === SUPERADMIN_CREDENTIALS.password) {
    const session = { username, role: 'superadmin', loginTime: new Date().toISOString(), token: `SA-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    localStorage.setItem(SA_SESSION_KEY, JSON.stringify(session));
    return { success: true, session };
  }
  return { success: false, message: 'Credenciales incorrectas. Verifique usuario y contraseña.' };
};
export const isSuperAdminLoggedIn = () => { try { const raw = localStorage.getItem(SA_SESSION_KEY); if (!raw) return false; return JSON.parse(raw)?.role === 'superadmin'; } catch { return false; } };
export const getSuperAdminSession = () => { try { const raw = localStorage.getItem(SA_SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } };
export const superAdminLogout = () => localStorage.removeItem(SA_SESSION_KEY);

// ─── Residents ────────────────────────────────────────────────────────────────
const RESIDENTS_KEY = 'vexward_residents';

const DEFAULT_RESIDENTS = [
  { id: 1, name: 'Moisés Álvarez', departamento: 12, torre: 8, rut: '12.345.678-9', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moises', deviceId: 'iPhone-A1B2C3', patente: 'AB-1234', vehiculo: 'Toyota Corolla', enrolledAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 2, name: 'Lucas Fernández', departamento: 8, torre: 2, rut: '19.283.746-5', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas', deviceId: 'Samsung-D4E5F6', patente: 'CD-5678', vehiculo: 'Honda Civic', enrolledAt: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: 3, name: 'Francisco Pino', departamento: 15, torre: 6, rut: '22.741.856-K', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Francisco', deviceId: 'Pixel-G7H8I9', patente: null, vehiculo: null, enrolledAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 4, name: 'Sebastian Peñaloza', departamento: 22, torre: 8, rut: '27.394.851-3', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sebastian', deviceId: 'iPhone-J0K1L2', patente: 'EF-9012', vehiculo: 'Mazda 3', enrolledAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 5, name: 'Valentina Rojas', departamento: 9, torre: 2, rut: '25.318.742-6', role: 'resident', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valentina', deviceId: 'iPhone-V9W8X7', patente: 'GH-3456', vehiculo: 'Suzuki Swift', enrolledAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

export const getResidents = () => { try { const raw = localStorage.getItem(RESIDENTS_KEY); if (raw) return JSON.parse(raw); localStorage.setItem(RESIDENTS_KEY, JSON.stringify(DEFAULT_RESIDENTS)); return DEFAULT_RESIDENTS; } catch { return DEFAULT_RESIDENTS; } };
export const saveResidents = (r) => localStorage.setItem(RESIDENTS_KEY, JSON.stringify(r));
export const addResident = (resident) => { const current = getResidents(); const updated = [...current, { ...resident, id: Date.now() }]; saveResidents(updated); return updated; };

// ─── Pending Approvals ────────────────────────────────────────────────────────
const APPROVALS_KEY = 'vexward_approvals';
const DEFAULT_APPROVALS = [
  { id: 201, name: 'Carlos Díaz', departamento: 18, torre: 2, rut: '30.128.745-1', requestTime: new Date(Date.now() - 86400000).toISOString() },
  { id: 202, name: 'María Gómez', departamento: 7, torre: 6, rut: '28.654.321-0', requestTime: new Date(Date.now() - 172800000).toISOString() },
  { id: 203, name: 'Andrés Morales', departamento: 11, torre: 8, rut: '31.445.221-K', requestTime: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 204, name: 'Catalina Vega', departamento: 6, torre: 2, rut: '29.887.556-2', requestTime: new Date(Date.now() - 3600000 * 2).toISOString() },
];
export const getPendingApprovals = () => { try { const raw = localStorage.getItem(APPROVALS_KEY); if (raw) return JSON.parse(raw); localStorage.setItem(APPROVALS_KEY, JSON.stringify(DEFAULT_APPROVALS)); return DEFAULT_APPROVALS; } catch { return DEFAULT_APPROVALS; } };
export const savePendingApprovals = (a) => localStorage.setItem(APPROVALS_KEY, JSON.stringify(a));
export const approvePending = (id) => { const approvals = getPendingApprovals(); const target = approvals.find((a) => a.id === id); if (!target) return null; const newResident = { id: Date.now(), name: target.name, rut: target.rut, departamento: target.departamento, torre: target.torre, role: 'resident', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${target.name.split(' ')[0]}`, deviceId: `APP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, patente: null, vehiculo: null, enrolledAt: new Date().toISOString() }; savePendingApprovals(approvals.filter((a) => a.id !== id)); addResident(newResident); return { approval: target, resident: newResident }; };
export const rejectPending = (id, reason) => { savePendingApprovals(getPendingApprovals().filter((a) => a.id !== id)); return reason; };

// ─── Access Log (Live Feed) ───────────────────────────────────────────────────
const ACCESS_LOG_KEY = 'vexward_access_log';
const MAX_LOG_ENTRIES = 200;
const SEED_NAMES = ['Moisés Álvarez', 'Lucas Fernández', 'Francisco Pino', 'Sebastian Peñaloza', 'Valentina Rojas', 'Catalina Vega', 'Andrés Morales', 'Carla Reyes', 'Rodrigo Castillo', 'Paula Herrera', 'Diego Navarro', 'Camila Torres'];
const SEED_DEPARTMENTS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const SEED_TOWERS = [2, 6, 8];
const ACCESS_TYPES = ['NFC', 'Bluetooth', 'Manual'];
let eventCounter = 1000;

const makeEvent = (type) => { const name = SEED_NAMES[Math.floor(Math.random() * SEED_NAMES.length)]; const dept = SEED_DEPARTMENTS[Math.floor(Math.random() * SEED_DEPARTMENTS.length)]; const torre = SEED_TOWERS[Math.floor(Math.random() * SEED_TOWERS.length)]; const accessType = ACCESS_TYPES[Math.floor(Math.random() * ACCESS_TYPES.length)]; eventCounter++; return { id: `VW-${eventCounter}`, name, departamento: dept, torre, time: new Date().toISOString(), accessType, type }; };
const SEED_LOG = () => { const now = Date.now(); const entries = []; for (let i = 20; i >= 1; i--) entries.push({ ...makeEvent('entry'), time: new Date(now - i * 240000).toISOString() }); for (let i = 18; i >= 1; i--) entries.push({ ...makeEvent('exit'), time: new Date(now - i * 300000).toISOString() }); return entries; };

export const getAccessLog = () => { try { const raw = localStorage.getItem(ACCESS_LOG_KEY); if (raw) { const parsed = JSON.parse(raw); if (parsed.length > 0) return parsed; } const seeded = SEED_LOG(); localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(seeded)); return seeded; } catch { return SEED_LOG(); } };
export const appendAccessEvent = (type, overrides = {}) => { const event = { ...makeEvent(type), ...overrides }; const current = getAccessLog(); const updated = [event, ...current].slice(0, MAX_LOG_ENTRIES); localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(updated)); return event; };
export const generateLiveEvent = () => { const type = Math.random() > 0.45 ? 'entry' : 'exit'; return appendAccessEvent(type); };

// ─── Concierge QR Requests ────────────────────────────────────────────────────
const CONCIERGE_QR_KEY = 'vexward_concierge_qr_log';

export const getConciergeQrLog = () => { try { const raw = localStorage.getItem(CONCIERGE_QR_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } };

export const logConciergeQrRequest = ({ residentId, residentName, residentRut, departamento, torre, requestedBy }) => {
  const entry = { id: `CQR-${Date.now()}`, residentId, residentName, residentRut, departamento, torre, requestedBy, time: new Date().toISOString() };
  const updated = [entry, ...getConciergeQrLog()].slice(0, 100);
  localStorage.setItem(CONCIERGE_QR_KEY, JSON.stringify(updated));
  return entry;
};

// ─── SOS Alerts ───────────────────────────────────────────────────────────────
const SOS_LOG_KEY = 'vexward_sos_log';

export const getSosAlerts = () => { try { const raw = localStorage.getItem(SOS_LOG_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } };

export const logSosAlert = ({ residentName, rut, departamento, torre }) => {
  const alert = { id: `SOS-${Date.now()}`, residentName, rut, departamento, torre, time: new Date().toISOString() };
  const updated = [alert, ...getSosAlerts()].slice(0, 100);
  localStorage.setItem(SOS_LOG_KEY, JSON.stringify(updated));
  return alert;
};

// ─── Utility ──────────────────────────────────────────────────────────────────
export const formatTime = (isoString) => { try { return new Date(isoString).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); } catch { return '--:--:--'; } };
