import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  LogOut, Unlock, UserPlus, History, X, QrCode, Fingerprint,
  ArrowDownLeft, ArrowUpRight, AlertTriangle, ShieldAlert,
  Check, Clock, Home, Bell, ChevronRight, User
} from 'lucide-react';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';

// ─── SOS Confirmation Modal ───────────────────────────────────────────────────
const SOSModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative z-10 w-full sm:max-w-sm bg-[#1a0808] border border-red-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-red-500/20 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
      {/* Red top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

      <div className="p-8 text-center space-y-5">
        {/* Warning Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
            <AlertTriangle size={36} className="text-red-400" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">⚠️ Alerta de Emergencia</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            ¿Estás seguro? Esto notificará al <strong className="text-white">conserje</strong> y al <strong className="text-white">policía local del condominio</strong>.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300/80 text-left flex items-start gap-2">
          <ShieldAlert size={13} className="shrink-0 mt-0.5" />
          Esta acción es registrada y notifica inmediatamente a los servicios de seguridad del condominio.
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onCancel}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-2xl py-3.5 transition-all text-sm active:scale-95">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl py-3.5 transition-all text-sm active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
            <ShieldAlert size={16} /> Enviar Alerta
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── SOS Sent Screen ──────────────────────────────────────────────────────────
const SOSSentScreen = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/95 backdrop-blur-sm">
    <div className="text-center px-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mx-auto w-28 h-28">
        <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
        <div className="relative w-28 h-28 rounded-full bg-red-500/30 border-2 border-red-400/60 flex items-center justify-center">
          <ShieldAlert size={52} className="text-red-300" />
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-black text-white mb-2">🚨 Alerta Enviada</h2>
        <p className="text-red-200/80 text-base leading-relaxed">
          El conserje y las autoridades del condominio han sido notificados.<br />
          <span className="text-sm text-red-300/60 mt-1 block">Por favor, permanece en un lugar seguro.</span>
        </p>
      </div>
      <button onClick={onClose} className="mt-4 text-red-300/50 text-sm hover:text-red-200 transition-colors underline">
        Volver a inicio
      </button>
    </div>
  </div>
);

// ─── History Entry Card ───────────────────────────────────────────────────────
const HistoryCard = ({ entry }) => {
  const isEntry = entry.type === 'entry';
  const isSos = entry.type === 'sos';
  return (
    <div className={clsx(
      'flex items-center gap-3 p-4 rounded-2xl border transition-colors',
      isSos ? 'bg-red-950/30 border-red-500/25' :
      isEntry ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-800/30 border-slate-700/30'
    )}>
      <div className={clsx(
        'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0',
        isSos ? 'bg-red-500/20 text-red-400' :
        isEntry ? 'bg-violet-500/15 text-violet-400' : 'bg-amber-500/15 text-amber-400'
      )}>
        {isSos ? <ShieldAlert size={18} /> : isEntry ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{entry.name}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={clsx('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', isSos ? 'text-red-400 bg-red-500/10 border-red-500/25' : isEntry ? 'text-violet-400 bg-violet-500/10 border-violet-500/25' : 'text-amber-400 bg-amber-500/10 border-amber-500/25')}>
            {isSos ? '🚨 SOS' : isEntry ? '↓ Entrada' : '↑ Salida'}
          </span>
          <span className="text-[10px] text-slate-500">{entry.method || 'App'}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px] font-mono text-slate-400">{format(new Date(entry.time), 'HH:mm:ss')}</div>
        <div className="text-[10px] text-slate-600">{formatDistanceToNow(new Date(entry.time), { addSuffix: true, locale: es })}</div>
      </div>
    </div>
  );
};

// ─── ResidentApp ──────────────────────────────────────────────────────────────
const ResidentApp = () => {
  const { activeUser, logout, gateState, openGate, accessHistory, generateGuestPass, sendSosAlert } = useAppContext();
  const [activeTab, setActiveTab] = useState('home');
  const [guestName, setGuestName] = useState('');
  const [activePass, setActivePass] = useState(null);
  const [sosState, setSosState] = useState('idle'); // 'idle' | 'confirm' | 'sent'

  // Filter history for this resident
  const myHistory = accessHistory
    .filter((h) => !h.name || h.name === activeUser?.name || h.name === 'Desconocido')
    .slice(0, 40);

  const handleCreatePass = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setActivePass(generateGuestPass(guestName, activeUser));
    setGuestName('');
  };

  const handleSOSConfirm = () => {
    if (activeUser) sendSosAlert(activeUser);
    setSosState('sent');
    setTimeout(() => { setSosState('idle'); setActiveTab('home'); }, 8000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex justify-center items-stretch">
      {/* SOS Modals */}
      {sosState === 'confirm' && <SOSModal onConfirm={handleSOSConfirm} onCancel={() => setSosState('idle')} />}
      {sosState === 'sent' && <SOSSentScreen onClose={() => { setSosState('idle'); setActiveTab('home'); }} />}

      {/* App Shell — mobile-first, card on desktop */}
      <div className="w-full max-w-md flex flex-col min-h-screen relative bg-[#0f1117] sm:shadow-2xl sm:shadow-violet-900/20">

        {/* ── Header ── */}
        <header className="px-5 pt-safe-top py-4 flex items-center justify-between border-b border-slate-800/60 bg-[#0f1117]/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={activeUser?.avatar} alt={activeUser?.name} className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 shadow" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0f1117]" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">{activeUser?.name}</div>
              <div className="text-violet-400 text-xs font-medium">
                {activeUser?.departamento ? `Depto. ${activeUser.departamento} · Torre ${activeUser.torre}` : 'Residente'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95">
              <Bell size={16} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f1117]"></span>
            </button>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6 space-y-10 animate-in fade-in duration-300">
              <div className="text-center">
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Bienvenido a casa</h2>
                <p className="text-slate-400 text-sm">Presiona para abrir la reja principal</p>
              </div>

              {/* Gate Button */}
              <div className="relative">
                <div className={clsx(
                  'absolute inset-0 rounded-full blur-3xl transition-all duration-1000',
                  gateState === 'closed' ? 'bg-violet-500/25 scale-100' :
                  gateState === 'opening' ? 'bg-violet-400/50 scale-110 animate-pulse' :
                  'bg-emerald-400/50 scale-125'
                )} />
                <button
                  onClick={() => openGate({ name: activeUser?.name || 'Residente', method: 'App', departamento: activeUser?.departamento, torre: activeUser?.torre })}
                  disabled={gateState !== 'closed'}
                  className={clsx(
                    'relative w-56 h-56 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-500 shadow-2xl overflow-hidden border-4 group',
                    gateState === 'closed'
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-violet-500/40 hover:border-violet-400/80 active:scale-95'
                      : gateState === 'opening'
                        ? 'bg-slate-800 border-violet-400/60 scale-95'
                        : 'bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-400 scale-100'
                  )}
                >
                  <div className={clsx('absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent opacity-0 transition-opacity', gateState === 'closed' && 'group-hover:opacity-100')} />
                  {gateState === 'opening' ? (
                    <span className="w-14 h-14 border-[5px] border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
                  ) : (
                    <Unlock size={60} className={clsx('transition-all duration-500', gateState === 'closed' ? 'text-violet-400' : 'text-white drop-shadow-md')} />
                  )}
                  <span className={clsx('text-xl font-black tracking-widest uppercase', gateState === 'closed' ? 'text-slate-200' : gateState === 'opening' ? 'text-violet-300' : 'text-white')}>
                    {gateState === 'closed' ? 'ABRIR' : gateState === 'opening' ? '...' : 'ABIERTA'}
                  </span>
                </button>
              </div>

              {/* Status pill */}
              <div className={clsx(
                'flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all',
                gateState === 'closed' ? 'bg-slate-800/60 border-slate-700/50 text-slate-400' :
                gateState === 'opening' ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' :
                'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              )}>
                <span className={clsx('w-2.5 h-2.5 rounded-full', gateState === 'closed' ? 'bg-slate-500' : gateState === 'opening' ? 'bg-violet-400 animate-pulse' : 'bg-emerald-400 animate-pulse')} />
                {gateState === 'closed' ? 'Sistema Listo' : gateState === 'opening' ? 'Abriendo...' : 'Acceso Concedido'}
              </div>

              {/* Quick info */}
              <div className="w-full grid grid-cols-2 gap-3">
                {[
                  { label: 'Departamento', value: `Nº ${activeUser?.departamento || '—'}` },
                  { label: 'Torre', value: `Nº ${activeUser?.torre || '—'}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
                    <div className="text-lg font-bold text-white mt-1">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISITAS TAB */}
          {activeTab === 'guests' && (
            <div className="px-5 pt-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Pase de Visitas</h2>
                <p className="text-slate-400 text-sm">Genera un acceso temporal QR para tu visitante.</p>
              </div>

              {!activePass ? (
                <form onSubmit={handleCreatePass} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Nombre del Invitado</label>
                    <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ej. Juan Pérez"
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-base" />
                  </div>
                  <button type="submit" disabled={!guestName.trim()}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-2xl px-4 py-4 transition-all active:scale-[0.97] shadow-lg shadow-violet-500/20 flex justify-center items-center gap-2 text-base">
                    <QrCode size={20} /> Generar Pase QR
                  </button>
                </form>
              ) : (
                <div className="glass-card rounded-3xl overflow-hidden border border-violet-500/25 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-indigo-400" />
                  <div className="p-5 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Pase para</div>
                        <div className="text-xl font-black text-white">{activePass.guestName}</div>
                      </div>
                      <button onClick={() => setActivePass(null)} className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={15} /></button>
                    </div>
                    <div className="bg-white p-5 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-xl shadow-violet-500/10">
                      <QRCodeSVG value={JSON.stringify({ type: 'GUEST_PASS', id: activePass.id, guest: activePass.guestName, residentRut: activePass.createdBy?.rut || activeUser?.rut, residentName: activePass.createdBy?.name || activeUser?.name, depto: activePass.createdBy?.departamento || activeUser?.departamento, torre: activePass.createdBy?.torre || activeUser?.torre, expires: activePass.expires })} size={168} level="H" bgColor="#ffffff" fgColor="#0f172a" />
                    </div>
                    <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30 space-y-2">
                      {[['ID del Pase', activePass.id, 'text-violet-400 font-mono'], ['Autorizado por', activeUser?.name, 'text-slate-300'], ['RUT Residente', activeUser?.rut, 'text-slate-400 font-mono text-xs flex items-center gap-1']].map(([l, v, cls]) => (
                        <div key={l} className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{l}</span>
                          <span className={clsx('text-xs', cls)}>{l === 'RUT Residente' ? <><Fingerprint size={10} />{v}</> : v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-sm text-slate-300">
                      Válido hasta: <span className="font-semibold text-violet-400">{format(new Date(activePass.expires), "dd 'de' MMMM, HH:mm", { locale: es })}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HISTORIAL TAB */}
          {activeTab === 'history' && (
            <div className="px-5 pt-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Mi Historial</h2>
                <p className="text-slate-400 text-sm">Registro de tus entradas, salidas y alertas.</p>
              </div>
              <div className="space-y-2.5">
                {myHistory.map((entry) => <HistoryCard key={entry.id} entry={entry} />)}
                {myHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4"><History size={28} className="text-slate-600" /></div>
                    <p className="text-slate-500 font-medium">Sin registros aún</p>
                    <p className="text-slate-600 text-sm mt-1">Tus accesos aparecerán aquí.</p>
                  </div>
                )}
              </div>
              <div className="pb-4 pt-6 border-t border-slate-800 text-center">
                <p className="text-[11px] text-slate-600">© {new Date().getFullYear()} VexCorp · VexWard®</p>
              </div>
            </div>
          )}

          {/* SOS TAB */}
          {activeTab === 'sos' && sosState === 'idle' && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6 space-y-8 animate-in fade-in duration-300">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto border border-red-500/30">
                  <ShieldAlert size={28} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Botón de Emergencia</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Úsalo solo en situaciones de emergencia real. Notificará inmediatamente al conserje y a la policía local.
                </p>
              </div>

              {/* SOS Button */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500/25 blur-3xl scale-90" />
                <button
                  onClick={() => setSosState('confirm')}
                  className="relative w-52 h-52 rounded-full flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-red-700 to-red-900 border-4 border-red-500/60 shadow-2xl shadow-red-500/30 active:scale-95 transition-all sos-pulse group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ShieldAlert size={64} className="text-red-200 drop-shadow-lg" />
                  <span className="text-2xl font-black text-red-100 tracking-widest uppercase drop-shadow">SOS</span>
                </button>
              </div>

              <div className="w-full p-4 rounded-2xl bg-red-950/40 border border-red-500/20 text-xs text-red-300/70 text-center leading-relaxed">
                ⚠️ Al presionar, se enviará una alerta de emergencia con tu nombre, departamento y torre a los servicios de seguridad del condominio.
              </div>
            </div>
          )}

          {/* PERFIL TAB */}
          {activeTab === 'profile' && (
            <div className="px-5 pt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-300 pb-20">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <img src={activeUser?.avatar} alt={activeUser?.name} className="w-28 h-28 rounded-full border-4 border-slate-800 shadow-xl object-cover" />
                  <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[#0f1117]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{activeUser?.name}</h2>
                  <p className="text-slate-400 text-sm mt-1">{activeUser?.email || 'residente@vexward.com'}</p>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-3xl p-5 border border-slate-700/50 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-sm text-slate-400">Departamento</span>
                  <span className="text-base font-bold text-white">{activeUser?.departamento || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-sm text-slate-400">Torre</span>
                  <span className="text-base font-bold text-white">{activeUser?.torre || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-400">RUT</span>
                  <span className="text-sm font-mono text-slate-300">{activeUser?.rut || 'N/A'}</span>
                </div>
              </div>

              <button onClick={logout} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-2xl px-4 py-4 transition-all active:scale-[0.98] shadow-lg flex justify-center items-center gap-2 mt-4 text-base">
                <LogOut size={20} /> Cerrar Sesión
              </button>
            </div>
          )}
        </main>

        {/* ── Bottom Navigation ── */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0f1117]/95 backdrop-blur-xl border-t border-slate-800/80 z-20" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="relative flex items-center h-[76px] px-2">
            
            {/* Left Items (Historial & Visitas) */}
            <div className="flex-1 flex justify-evenly items-center">
              <button onClick={() => setActiveTab('history')} className={clsx('flex flex-col items-center gap-1.5 transition-all w-14', activeTab === 'history' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300')}>
                <History size={24} />
                <span className="text-[10px] font-medium">Historial</span>
              </button>

              <button onClick={() => setActiveTab('guests')} className={clsx('flex flex-col items-center gap-1.5 transition-all w-14', activeTab === 'guests' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300')}>
                <UserPlus size={24} />
                <span className="text-[10px] font-medium">Visitas</span>
              </button>
            </div>

            {/* Reja (Center FAB) */}
            <div className="w-[88px] relative flex justify-center h-full">
              <button onClick={() => setActiveTab('home')} className={clsx(
                'absolute -top-7 w-[76px] h-[76px] rounded-[24px] flex flex-col items-center justify-center shadow-2xl border-[6px] border-[#0f1117] transition-all active:scale-95 gap-1.5',
                activeTab === 'home' 
                  ? 'bg-gradient-to-b from-violet-500 to-indigo-600 text-white shadow-violet-500/30' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              )}>
                <Unlock size={26} />
                <span className="text-[11px] font-black uppercase tracking-widest">Reja</span>
              </button>
            </div>

            {/* Right Items (SOS & Perfil) */}
            <div className="flex-1 flex justify-evenly items-center">
              <button onClick={() => setActiveTab('sos')} className={clsx('flex flex-col items-center gap-1.5 transition-all w-14', activeTab === 'sos' ? 'text-red-400' : 'text-slate-500 hover:text-red-400')}>
                <ShieldAlert size={24} />
                <span className="text-[10px] font-bold">SOS</span>
              </button>

              <button onClick={() => setActiveTab('profile')} className={clsx('flex flex-col items-center gap-1.5 transition-all w-14', activeTab === 'profile' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300')}>
                <User size={24} />
                <span className="text-[10px] font-medium">Perfil</span>
              </button>
            </div>

          </div>
        </nav>
      </div>
    </div>
  );
};

export default ResidentApp;
