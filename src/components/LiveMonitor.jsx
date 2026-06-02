import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Activity, Wifi, Bluetooth, Hand } from 'lucide-react';
import { generateLiveEvent, formatTime } from '../services/mockService';
import clsx from 'clsx';

// ─── Access Type Badge ─────────────────────────────────────────────────────────
export const AccessBadge = ({ type }) => {
  const config = {
    NFC: { color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', Icon: Wifi },
    Bluetooth: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', Icon: Bluetooth },
    Manual: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', Icon: Hand },
    Conserjería: { color: 'bg-violet-500/15 text-violet-400 border-violet-500/30', Icon: Hand },
    App: { color: 'bg-violet-500/15 text-violet-400 border-violet-500/30', Icon: Hand },
    SOS: { color: 'bg-rose-500/15 text-rose-400 border-rose-500/30', Icon: Hand },
  };
  const { color, Icon } = config[type] || config.Manual;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${color}`}>
      <Icon size={10} />{type}
    </span>
  );
};

// ─── Event Row ────────────────────────────────────────────────────────────────
const EventRow = ({ event, isNew }) => (
  <tr className={clsx('border-b border-slate-800/60 transition-all duration-500', isNew ? 'event-row-new' : 'hover:bg-slate-800/20')}>
    <td className="py-3 px-3">
      <span className="font-mono text-[11px] text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">{event.id}</span>
    </td>
    <td className="py-3 px-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-700/70 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">{event.name.charAt(0)}</div>
        <span className="text-sm font-medium text-slate-200 whitespace-nowrap truncate max-w-[130px]">{event.name}</span>
      </div>
    </td>
    <td className="py-3 px-3"><span className="text-xs font-mono text-slate-400">D-{event.departamento}</span></td>
    <td className="py-3 px-3"><span className="text-xs font-mono text-slate-400">T-{event.torre}</span></td>
    <td className="py-3 px-3"><span className="text-xs font-mono text-slate-300 tabular-nums">{formatTime(event.time)}</span></td>
    <td className="py-3 px-3"><AccessBadge type={event.accessType || event.method || 'Manual'} /></td>
  </tr>
);

// ─── Panel Table ──────────────────────────────────────────────────────────────
const PanelTable = ({ events, type, newIds }) => (
  <div className="overflow-auto flex-1 custom-scrollbar">
    <table className="w-full text-left border-collapse min-w-[480px]">
      <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm">
        <tr>{['ID', 'Nombre', 'Depto.', 'Torre', 'Hora', 'Acceso'].map((h) => (
          <th key={h} className="py-2.5 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {events.map((ev) => <EventRow key={ev.id} event={ev} isNew={newIds.has(ev.id)} />)}
        {events.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-600 text-sm">Esperando eventos...</td></tr>}
      </tbody>
    </table>
  </div>
);

// ─── Live Monitor Component ───────────────────────────────────────────────────
const LiveMonitor = ({ accessHistory }) => {
  const [entries, setEntries] = useState({ entry: [], exit: [] });
  const [newIds, setNewIds] = useState(new Set());

  useEffect(() => {
    setEntries({
      entry: accessHistory.filter((e) => e.type === 'entry').slice(0, 40),
      exit: accessHistory.filter((e) => e.type === 'exit').slice(0, 40),
    });
  }, []);

  useEffect(() => {
    let timeout;
    const randomDelay = () => Math.floor(Math.random() * 3000) + 4000;
    const schedule = () => {
      timeout = setTimeout(() => {
        const ev = generateLiveEvent();
        setEntries((prev) => ({ ...prev, [ev.type]: [ev, ...prev[ev.type]].slice(0, 60) }));
        setNewIds((prev) => {
          const next = new Set(prev);
          next.add(ev.id);
          setTimeout(() => setNewIds((p) => { const n = new Set(p); n.delete(ev.id); return n; }), 2000);
          return next;
        });
        schedule();
      }, randomDelay());
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Entradas Hoy', val: entries.entry.length, Icon: ArrowDownLeft, color: 'emerald' },
          { label: 'Salidas Hoy', val: entries.exit.length, Icon: ArrowUpRight, color: 'amber' },
          { label: 'Total Eventos', val: entries.entry.length + entries.exit.length, Icon: Activity, color: 'violet' },
        ].map(({ label, val, Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center text-${color}-400`}><Icon size={18} /></div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</div>
              <div className="text-2xl font-bold text-white">{val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Dual Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 flex-1 min-h-0">
        {/* ENTRADAS */}
        <div className="flex flex-col rounded-2xl border border-emerald-500/25 bg-slate-900/80 overflow-hidden min-h-[360px]">
          <div className="px-5 py-3.5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-transparent flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center"><ArrowDownLeft size={14} className="text-emerald-400" /></div>
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Entradas</h3>
                <p className="text-[9px] text-slate-500">Ingresos al condominio</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
              <span className="text-[9px] text-emerald-500 font-bold uppercase">En Vivo</span>
            </div>
          </div>
          <PanelTable events={entries.entry} type="entry" newIds={newIds} />
        </div>

        {/* SALIDAS */}
        <div className="flex flex-col rounded-2xl border border-amber-500/25 bg-slate-900/80 overflow-hidden min-h-[360px]">
          <div className="px-5 py-3.5 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center"><ArrowUpRight size={14} className="text-amber-400" /></div>
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Salidas</h3>
                <p className="text-[9px] text-slate-500">Egresos del condominio</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" /></span>
              <span className="text-[9px] text-amber-500 font-bold uppercase">En Vivo</span>
            </div>
          </div>
          <PanelTable events={entries.exit} type="exit" newIds={newIds} />
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;
