import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import LiveMonitor from '../components/LiveMonitor';
import ApprovalQueue, { Toast } from '../components/ApprovalQueue';
import {
  LogOut, Activity, Users, UserPlus, QrCode, Unlock, Lock,
  ShieldAlert, Check, X, Search, Ticket, Fingerprint, Building,
  Hash, Smartphone, Car, ArrowDownLeft, ChevronDown, Clock,
  ClipboardList, KeyRound, AlertCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import clsx from 'clsx';

// ─── Gate Button Panel ────────────────────────────────────────────────────────
const GatePanel = ({ gateState, openGate, accessHistory }) => {
  const recentConcierge = accessHistory.filter((e) => e.method === 'Conserjería').slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Big Gate Button */}
      <div className="flex flex-col items-center justify-center gap-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Control de Acceso</h2>
          <p className="text-slate-400 text-sm">Abrir reja principal desde conserjería</p>
        </div>

        <div className="relative">
          <div className={clsx(
            'absolute inset-0 rounded-full blur-3xl transition-all duration-1000',
            gateState === 'closed' ? 'bg-violet-500/20 scale-100' :
            gateState === 'opening' ? 'bg-violet-400/40 scale-110 animate-pulse' :
            'bg-emerald-400/40 scale-125'
          )} />
          <button
            onClick={() => openGate({ name: 'Admin Conserjería', method: 'Conserjería', role: 'admin' })}
            disabled={gateState !== 'closed'}
            className={clsx(
              'relative w-52 h-52 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-500 shadow-2xl overflow-hidden group border-4',
              gateState === 'closed'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-violet-500/40 hover:border-violet-400/70 active:scale-95'
                : gateState === 'opening'
                  ? 'bg-slate-800 border-violet-400/50 scale-95'
                  : 'bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-400 scale-100'
            )}
          >
            <div className={clsx('absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent opacity-0 transition-opacity duration-300', gateState === 'closed' && 'group-hover:opacity-100')} />
            {gateState === 'opening' ? (
              <span className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
            ) : gateState === 'open' ? (
              <Unlock size={52} className="text-white drop-shadow-md" />
            ) : (
              <Unlock size={52} className="text-violet-400" />
            )}
            <span className={clsx('text-base font-bold tracking-widest uppercase transition-colors', gateState === 'open' ? 'text-white' : gateState === 'opening' ? 'text-violet-300' : 'text-slate-200')}>
              {gateState === 'closed' ? 'ABRIR REJA' : gateState === 'opening' ? 'ABRIENDO...' : 'ABIERTA'}
            </span>
          </button>
        </div>

        <div className={clsx(
          'flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all',
          gateState === 'closed' ? 'bg-slate-800/50 border-slate-700/50 text-slate-400' :
          gateState === 'opening' ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' :
          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        )}>
          <span className={clsx('w-2.5 h-2.5 rounded-full', gateState === 'closed' ? 'bg-slate-500' : gateState === 'opening' ? 'bg-violet-400 animate-pulse' : 'bg-emerald-400 animate-pulse')} />
          {gateState === 'closed' ? 'Reja Cerrada — Sistema Listo' : gateState === 'opening' ? 'Abriendo reja...' : 'Acceso Concedido — Reja Abierta'}
        </div>
      </div>

      {/* Recent Concierge Openings */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-violet-500/5 to-transparent">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Clock size={15} className="text-violet-400" />Últimas Aperturas desde Conserjería</h3>
        </div>
        <div className="divide-y divide-slate-800/60">
          {recentConcierge.length === 0 && (
            <div className="py-10 text-center text-slate-600 text-sm">Aún no hay aperturas registradas desde conserjería.</div>
          )}
          {recentConcierge.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-4 hover:bg-slate-800/20 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
                <Unlock size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-200">{e.name}</div>
                <div className="text-xs text-slate-500">{formatDistanceToNow(new Date(e.time), { addSuffix: true, locale: es })}</div>
              </div>
              <span className="text-[10px] font-bold uppercase text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg">Conserjería</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── QR por Residente (Olvidó Celular) ───────────────────────────────────────
const ResidentQRPanel = ({ residents, generateResidentQR, addConciergeQrRequest, conciergeQrLog }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [qrResult, setQrResult] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = residents.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.rut?.toLowerCase().includes(search.toLowerCase()) ||
    `${r.departamento}`.includes(search) ||
    `${r.id}`.includes(search)
  );

  const handleGenerateQR = (resident) => {
    const result = generateResidentQR(resident.rut);
    if (result.success) {
      setQrResult(result);
      setSelected(resident);
      addConciergeQrRequest({
        residentId: resident.id, residentName: resident.name, residentRut: resident.rut,
        departamento: resident.departamento, torre: resident.torre, requestedBy: 'Admin Conserjería',
      });
      setToast(`✓ QR generado para ${resident.name} — registrado en SuperAdmin`);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {toast && <Toast message={toast} type="success" onDismiss={() => setToast(null)} />}

      {/* Resident Search */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
            <QrCode size={18} className="text-violet-400" /> QR para Residente sin Celular
          </h2>
          <p className="text-sm text-slate-400">Busque al residente por ID, nombre o RUT y genere un QR temporal. La solicitud queda registrada en el panel SuperAdmin.</p>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-violet-300/80 flex items-start gap-2">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          Cada solicitud de QR por conserjería queda registrada automáticamente en el log del SuperAdmin para auditoría.
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQrResult(null); }}
            placeholder="Buscar por ID, nombre, RUT..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all" />
        </div>

        <div className="space-y-2 max-h-[400px] overflow-auto custom-scrollbar">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => handleGenerateQR(r)}
              className={clsx(
                'w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all group',
                selected?.id === r.id
                  ? 'bg-violet-500/15 border-violet-500/40'
                  : 'bg-slate-800/40 border-slate-800 hover:border-violet-500/30 hover:bg-slate-800'
              )}>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-600 shrink-0">
                {r.id}
              </div>
              <img src={r.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{r.name}</div>
                <div className="text-xs text-slate-400 font-mono">{r.rut} · D-{r.departamento} T-{r.torre}</div>
              </div>
              <span className="text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 font-bold">Generar QR →</span>
            </button>
          ))}
        </div>
      </div>

      {/* QR Result */}
      <div>
        {qrResult?.success ? (
          <div className="glass-card rounded-2xl border border-violet-500/25 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-5 border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-transparent">
              <h3 className="text-base font-bold text-white">QR Generado por Conserjería</h3>
              <p className="text-xs text-violet-300/80 mt-0.5">Para: {qrResult.resident.name} · Este QR queda registrado en SuperAdmin</p>
            </div>
            <div className="p-6 flex flex-col items-center space-y-5">
              <div className="bg-white p-5 rounded-2xl shadow-xl shadow-violet-500/10">
                <QRCodeSVG value={JSON.stringify(qrResult.qrData)} size={180} level="H" bgColor="#ffffff" fgColor="#0f172a" />
              </div>
              <div className="w-full bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 grid grid-cols-2 gap-3">
                {[['ID Residente', `#${qrResult.resident.id}`], ['Nombre', qrResult.resident.name], ['RUT', qrResult.resident.rut], ['Ubicación', `D-${qrResult.resident.departamento} · T-${qrResult.resident.torre}`]].map(([l, v]) => (
                  <div key={l}><div className="text-[10px] text-slate-500 uppercase tracking-wider">{l}</div><div className="text-sm text-white font-mono mt-0.5 truncate">{v}</div></div>
                ))}
              </div>
              <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400">
                <Check size={14} /> QR válido — Solicitud registrada en log de SuperAdmin
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-800 p-12 text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto"><QrCode size={36} className="text-slate-600" /></div>
            <p className="text-base font-medium text-slate-400">Seleccione un residente para generar su QR</p>
            <p className="text-xs text-slate-600">El QR permitirá el ingreso al residente que olvidó su dispositivo.</p>
          </div>
        )}

        {/* Concierge QR Log */}
        {conciergeQrLog.length > 0 && (
          <div className="mt-5 glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historial de QR por Conserjería ({conciergeQrLog.length})</h4>
            </div>
            <div className="divide-y divide-slate-800/60 max-h-48 overflow-auto custom-scrollbar">
              {conciergeQrLog.slice(0, 8).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0"><QrCode size={13} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{entry.residentName}</div>
                    <div className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(entry.time), { addSuffix: true, locale: es })}</div>
                  </div>
                  <span className="font-mono text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">{entry.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Guest Passes Tab ──────────────────────────────────────────────────────────
const GuestPassTab = ({ guestPasses, generateGuestPass }) => {
  const [guestName, setGuestName] = useState('');
  const [activePass, setActivePass] = useState(null);
  const activePasses = guestPasses.filter((p) => p.status === 'active' && new Date(p.expires) > new Date());

  const handleCreate = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    const pass = generateGuestPass(guestName, null, 'concierge');
    setActivePass(pass);
    setGuestName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Ticket size={18} className="text-violet-400" /> Crear Pase de Visita</h2>
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Nombre del Visitante</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ej. Juan Pérez"
                className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm" />
            </div>
            <button type="submit" disabled={!guestName.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <QrCode size={18} /> Generar Pase QR
            </button>
          </form>
        </div>

        {/* Active Passes List */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pases Activos ({activePasses.length})</h3>
          <div className="space-y-2">
            {activePasses.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-violet-500/20 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0"><Ticket size={15} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{p.guestName}</div>
                  <div className="text-xs text-slate-500">Creado por {p.createdBy?.name || 'Conserjería'}</div>
                </div>
                <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded">{p.id}</span>
              </div>
            ))}
            {activePasses.length === 0 && <div className="text-center text-slate-600 text-sm py-6">No hay pases activos.</div>}
          </div>
        </div>
      </div>

      {/* Generated QR */}
      <div>
        {activePass ? (
          <div className="glass-card rounded-2xl border border-violet-500/25 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-transparent flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Pase Generado</h3>
                <p className="text-xs text-slate-400 mt-0.5">Para {activePass.guestName}</p>
              </div>
              <button onClick={() => setActivePass(null)} className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={14} /></button>
            </div>
            <div className="p-6 flex flex-col items-center gap-5">
              <div className="bg-white p-5 rounded-2xl shadow-xl">
                <QRCodeSVG value={JSON.stringify({ type: 'GUEST_PASS', id: activePass.id, guest: activePass.guestName, expires: activePass.expires, issuedBy: 'Conserjería' })} size={180} level="H" bgColor="#ffffff" fgColor="#0f172a" />
              </div>
              <div className="w-full bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 space-y-2">
                {[['ID Pase', activePass.id], ['Visitante', activePass.guestName], ['Válido hasta', format(new Date(activePass.expires), "dd/MM/yy HH:mm")]].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{l}</span>
                    <span className="text-xs text-white font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-800 p-12 text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto"><Ticket size={36} className="text-slate-600" /></div>
            <p className="text-base font-medium text-slate-400">Crea un pase de visita para ver el QR</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Enrollment Tab (Step Form) ───────────────────────────────────────────────
const STEPS = ['Identidad', 'Ubicación', 'Vehículo'];
const EnrollTab = ({ enrollResident, residents }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ rut: '', name: '', departamento: '', torre: '', deviceId: '', patente: '', vehiculo: '' });
  const [msg, setMsg] = useState(null);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const inputCls = "w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm";
  const selCls = "w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all text-sm appearance-none cursor-pointer";
  const lbl = "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block";

  const handleNext = () => {
    if (step === 0 && (!form.rut.trim() || !form.name.trim())) { setMsg({ type: 'error', text: 'RUT y Nombre son obligatorios.' }); return; }
    if (step === 1 && (!form.departamento || !form.torre)) { setMsg({ type: 'error', text: 'Departamento y Torre son obligatorios.' }); return; }
    setMsg(null); setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const result = enrollResident({ rut: form.rut.trim(), name: form.name.trim(), departamento: form.departamento, torre: form.torre, deviceId: form.deviceId.trim() || undefined, patente: form.patente || null, vehiculo: form.vehiculo || null });
    if (result.success) { setMsg({ type: 'success', text: `✓ ${result.resident.name} enrolado correctamente.` }); setForm({ rut: '', name: '', departamento: '', torre: '', deviceId: '', patente: '', vehiculo: '' }); setStep(0); }
    else setMsg({ type: 'error', text: result.message });
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all', i === step ? 'bg-violet-500/20 border border-violet-500/40' : 'opacity-40')}>
              <div className={clsx('w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0', i < step ? 'bg-emerald-500 border-emerald-400 text-white' : i === step ? 'bg-violet-500 border-violet-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500')}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className={clsx('text-xs font-semibold', i === step ? 'text-white' : 'text-slate-500')}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={clsx('flex-1 h-px mx-1', i < step ? 'bg-violet-500/50' : 'bg-slate-800')} />}
          </React.Fragment>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 space-y-4">
          {step === 0 && (<>
            <div><label className={lbl}>RUT / DNI</label><div className="relative"><Fingerprint size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" value={form.rut} onChange={set('rut')} placeholder="Ej. 12.345.678-9" className={inputCls} /></div></div>
            <div><label className={lbl}>Nombre y Apellido</label><div className="relative"><Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" value={form.name} onChange={set('name')} placeholder="Ej. María González" className={inputCls} /></div></div>
            <div><label className={lbl}>Dispositivo / IMEI <span className="text-slate-600 normal-case font-normal">(Opcional)</span></label><div className="relative"><Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" value={form.deviceId} onChange={set('deviceId')} placeholder="Ej. iPhone-A1B2C3" className={inputCls} /></div></div>
          </>)}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>N° Departamento</label><div className="relative"><Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" /><select value={form.departamento} onChange={set('departamento')} className={selCls}><option value="" disabled>Seleccionar...</option>{Array.from({length:19},(_,i)=>i+6).map((n)=><option key={n} value={n} className="bg-slate-900">{n}</option>)}</select></div></div>
              <div><label className={lbl}>N° Torre</label><div className="relative"><Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" /><select value={form.torre} onChange={set('torre')} className={selCls}><option value="" disabled>Seleccionar...</option>{[8,2,6].map((t)=><option key={t} value={t} className="bg-slate-900">{t}</option>)}</select></div></div>
            </div>
          )}
          {step === 2 && (<>
            <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-violet-300/80 flex items-start gap-2"><Car size={13} className="shrink-0 mt-0.5" />Información de vehículo es opcional.</div>
            <div><label className={lbl}>Patente / Placa</label><div className="relative"><Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" value={form.patente} onChange={set('patente')} placeholder="Ej. AB-1234" className={inputCls} /></div></div>
            <div><label className={lbl}>Modelo del Vehículo</label><div className="relative"><Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" value={form.vehiculo} onChange={set('vehiculo')} placeholder="Ej. Toyota Corolla 2022" className={inputCls} /></div></div>
          </>)}
          {msg && <div className={clsx('rounded-xl px-4 py-3 text-sm font-medium border flex items-center gap-2', msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20')}>{msg.type==='success'?<Check size={14}/>:<AlertCircle size={14}/>}{msg.text}</div>}
        </div>
        <div className="px-5 pb-5 flex gap-3">
          {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium rounded-xl py-3 transition-all text-sm">← Atrás</button>}
          {step < STEPS.length - 1 ? <button onClick={handleNext} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-3 transition-all text-sm">Continuar →</button>
            : <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-3 transition-all text-sm flex items-center justify-center gap-2"><Fingerprint size={16}/>Enrolar Residente</button>}
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar Icons Config ─────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'monitor', icon: Activity, label: 'Monitor' },
  { id: 'gate', icon: Unlock, label: 'Reja' },
  { id: 'qrresident', icon: QrCode, label: 'QR Residente' },
  { id: 'passes', icon: Ticket, label: 'Pases Visita' },
];

const NAV_SECTIONS = [
  {
    title: 'Monitoreo en Vivo',
    items: [{ id: 'monitor', label: 'Monitor ENTRADAS/SALIDAS', icon: Activity }],
  },
  {
    title: 'Control Físico',
    items: [{ id: 'gate', label: 'Abrir Reja Principal', icon: Unlock }],
  },
  {
    title: 'Gestión Temporal',
    items: [
      { id: 'qrresident', label: 'QR para Residentes', icon: QrCode },
      { id: 'passes', label: 'Pases de Visitas', icon: Ticket },
    ],
  },
];

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { logout, accessHistory, residents, guestPasses, generateGuestPass,
    gateState, openGate, conciergeQrLog, addConciergeQrRequest, generateResidentQR } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('monitor');
  const [openTabs, setOpenTabs] = useState(['monitor']);

  const openTab = (id) => {
    if (!openTabs.includes(id)) setOpenTabs((t) => [...t, id]);
    setActiveTab(id);
  };

  return (
    <div className="flex h-screen bg-[#0b0f1a] overflow-hidden">
      {/* ── Icon Sidebar ── */}
      <aside className="w-[58px] bg-[#0d1117] border-r border-slate-800/80 flex flex-col items-center py-4 gap-1 shrink-0 z-30">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
          <ShieldAlert size={18} className="text-white" />
        </div>

        {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => openTab(id)}
            title={label}
            className={clsx(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 relative group',
              activeTab === id
                ? 'bg-violet-500/20 text-violet-400'
                : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800/60'
            )}
          >
            <Icon size={18} />
            {id === 'gate' && gateState === 'open' && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            <span className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
              {label}
            </span>
          </button>
        ))}

        <div className="mt-auto flex flex-col items-center gap-1">
          <button onClick={logout} title="Cerrar Sesión"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Navigation Tree Panel ── */}
      <nav className="w-[220px] bg-[#0f1520] border-r border-slate-800/80 flex flex-col shrink-0 overflow-auto custom-scrollbar">
        <div className="px-4 py-4 border-b border-slate-800/60">
          <div className="text-xs font-bold text-white tracking-widest uppercase">Conserjería</div>
          <div className="text-[10px] text-slate-500 mt-0.5">VexWard Central</div>
        </div>

        <div className="flex-1 py-3 space-y-5 px-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-2 mb-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em]">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => openTab(id)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left',
                      activeTab === id
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/20'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                    )}
                  >
                    <Icon size={13} className={activeTab === id ? 'text-violet-400' : ''} />
                    <span className="flex-1 truncate">{label}</span>
                    {id === 'gate' && gateState === 'open' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
                    {activeTab === id && <ChevronDown size={11} className="text-violet-400 shrink-0 -rotate-90" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="flex-1 bg-[#0b0f1a] flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-auto custom-scrollbar p-6 lg:p-8">
          {activeTab === 'monitor' && (
            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <div>
                  <h1 className="text-xl font-bold text-white">Monitor de Accesos en Vivo</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Registro en tiempo real de entradas y salidas del condominio.</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />En Vivo</span>
              </div>
              <div className="flex-1 min-h-0">
                <LiveMonitor accessHistory={accessHistory} />
              </div>
            </div>
          )}

          {activeTab === 'gate' && <GatePanel gateState={gateState} openGate={openGate} accessHistory={accessHistory} />}
          {activeTab === 'qrresident' && <ResidentQRPanel residents={residents} generateResidentQR={generateResidentQR} addConciergeQrRequest={addConciergeQrRequest} conciergeQrLog={conciergeQrLog} />}
          {activeTab === 'passes' && <GuestPassTab guestPasses={guestPasses} generateGuestPass={generateGuestPass} />}
        </div>

        {/* Status bar */}
        <div className="h-7 bg-[#0d1117] border-t border-slate-800/60 flex items-center px-4 gap-4 shrink-0">
          <span className="text-[10px] text-slate-600">Conserjería Central</span>
          <span className="text-[10px] text-slate-700">|</span>
          <span className="text-[10px] text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sistema Activo</span>
          <span className="ml-auto text-[10px] text-slate-700">© {new Date().getFullYear()} VexCorp</span>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
