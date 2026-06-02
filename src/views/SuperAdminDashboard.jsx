import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import ApprovalQueue, { Toast } from '../components/ApprovalQueue';
import LiveMonitor from '../components/LiveMonitor';
import {
  ShieldAlert, Activity, Users, UserPlus, LogOut, QrCode, Settings,
  ArrowDownLeft, ArrowUpRight, Wifi, Bluetooth, Hand, Search,
  ChevronRight, Check, X, Car, Building, Hash, Smartphone, Fingerprint,
  Ticket, Shield, Bell, BarChart2, ClipboardList, Eye, ChevronDown,
  RefreshCw, Download, Filter, AlertCircle, Clock, Lock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';



// ─── Step Enrollment Form ──────────────────────────────────────────────────────
const STEPS = ['Identidad', 'Ubicación', 'Vehículo'];

const EnrollmentForm = ({ enrollResident, residents }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    rut: '', name: '', departamento: '', torre: '',
    deviceId: '', patente: '', vehiculo: '',
  });
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleNext = () => {
    if (step === 0 && (!form.rut.trim() || !form.name.trim())) {
      setMsg({ type: 'error', text: 'RUT y Nombre son obligatorios.' }); return;
    }
    if (step === 1 && (!form.departamento || !form.torre)) {
      setMsg({ type: 'error', text: 'Departamento y Torre son obligatorios.' }); return;
    }
    setMsg(null);
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = enrollResident({
      rut: form.rut.trim(),
      name: form.name.trim(),
      departamento: form.departamento,
      torre: form.torre,
      deviceId: form.deviceId.trim() || undefined,
      patente: form.patente.trim() || null,
      vehiculo: form.vehiculo.trim() || null,
    });
    setSubmitting(false);
    if (result.success) {
      setMsg({ type: 'success', text: `✓ ${result.resident.name} enrolado exitosamente.` });
      setForm({ rut: '', name: '', departamento: '', torre: '', deviceId: '', patente: '', vehiculo: '' });
      setStep(0);
    } else {
      setMsg({ type: 'error', text: result.message });
    }
  };

  const inputClass = "w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm";
  const selectClass = "w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer";
  const labelClass = "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={clsx(
              'flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all',
              i === step ? 'bg-indigo-500/20 border border-indigo-500/40' : 'opacity-50'
            )}>
              <div className={clsx(
                'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0',
                i < step ? 'bg-emerald-500 border-emerald-400 text-white' :
                i === step ? 'bg-indigo-500 border-indigo-400 text-white' :
                'bg-slate-800 border-slate-700 text-slate-500'
              )}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={clsx('text-sm font-semibold', i === step ? 'text-white' : 'text-slate-500')}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('flex-1 h-px mx-2', i < step ? 'bg-emerald-500/50' : 'bg-slate-800')} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-500/5 to-transparent">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {step === 0 && <><Hash size={18} className="text-indigo-400" /> Paso 1: Datos de Identidad</>}
            {step === 1 && <><Building size={18} className="text-indigo-400" /> Paso 2: Ubicación en el Condominio</>}
            {step === 2 && <><Car size={18} className="text-indigo-400" /> Paso 3: Vehículo (Opcional)</>}
          </h3>
        </div>

        <div className="p-6 space-y-5">
          {/* STEP 0: Identity */}
          {step === 0 && (
            <>
              <div>
                <label className={labelClass}>RUT / DNI</label>
                <div className="relative">
                  <Fingerprint size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={form.rut} onChange={set('rut')} placeholder="Ej. 12.345.678-9" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Nombre y Apellido</label>
                <div className="relative">
                  <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Ej. María González" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Dispositivo / IMEI <span className="text-slate-600 normal-case font-normal">(Opcional)</span></label>
                <div className="relative">
                  <Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={form.deviceId} onChange={set('deviceId')} placeholder="Ej. iPhone-A1B2C3 / IMEI" className={inputClass} />
                </div>
              </div>
            </>
          )}

          {/* STEP 1: Location */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>N° Departamento</label>
                <div className="relative">
                  <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select value={form.departamento} onChange={set('departamento')} className={selectClass}>
                    <option value="" disabled>Seleccionar...</option>
                    {Array.from({ length: 19 }, (_, i) => i + 6).map((n) => (
                      <option key={n} value={n} className="bg-slate-900">{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>N° Torre / Bloque</label>
                <div className="relative">
                  <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select value={form.torre} onChange={set('torre')} className={selectClass}>
                    <option value="" disabled>Seleccionar...</option>
                    {[8, 2, 6].map((t) => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Vehicle */}
          {step === 2 && (
            <>
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-sm text-indigo-300/80 mb-2 flex items-start gap-2">
                <Car size={15} className="shrink-0 mt-0.5" />
                Esta información es opcional y se usa para el control de acceso vehicular al estacionamiento.
              </div>
              <div>
                <label className={labelClass}>Patente / Placa</label>
                <div className="relative">
                  <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={form.patente} onChange={set('patente')} placeholder="Ej. AB-1234 / ABC123" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Modelo del Vehículo</label>
                <div className="relative">
                  <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={form.vehiculo} onChange={set('vehiculo')} placeholder="Ej. Toyota Corolla 2022" className={inputClass} />
                </div>
              </div>
            </>
          )}

          {/* Feedback */}
          {msg && (
            <div className={clsx(
              'rounded-xl px-4 py-3 text-sm font-medium border flex items-center gap-2',
              msg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            )}>
              {msg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
              {msg.text}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium rounded-xl py-3 transition-all text-sm">
              ← Atrás
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={handleNext}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-3 transition-all text-sm flex items-center justify-center gap-2">
              Continuar <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl py-3 transition-all text-sm flex items-center justify-center gap-2">
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Fingerprint size={16} /> Enrolar Residente</>}
            </button>
          )}
        </div>
      </div>

      {/* Recent enrolled */}
      <div className="mt-6">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Últimos Enrolados ({residents.length})
        </h4>
        <div className="space-y-2 max-h-64 overflow-auto custom-scrollbar">
          {[...residents].reverse().slice(0, 8).map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors">
              <img src={r.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{r.name}</div>
                <div className="text-xs text-slate-500">Depto. {r.departamento} · Torre {r.torre} · {r.rut}</div>
              </div>
              {r.patente && (
                <span className="text-[10px] font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded-lg shrink-0">{r.patente}</span>
              )}
              <span className="text-[10px] text-emerald-500 font-bold uppercase shrink-0">✓ Activo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Residents Grid ────────────────────────────────────────────────────────────
const ResidentsGrid = ({ residents, revokeAccess }) => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = residents.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.rut && r.rut.toLowerCase().includes(search.toLowerCase())) ||
    `${r.departamento}`.includes(search) ||
    `${r.torre}`.includes(search)
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, RUT, depto..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
        </div>
        <span className="text-sm text-slate-500">{filtered.length} de {residents.length} residentes</span>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800/60">
          {filtered.map((res) => (
            <div key={res.id} className="hover:bg-slate-800/20 transition-colors">
              <div className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === res.id ? null : res.id)}>
                <div className="flex items-center gap-3">
                  <img src={res.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" />
                  <div>
                    <div className="text-sm font-semibold text-white">{res.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{res.rut}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded-lg font-mono">D-{res.departamento}</span>
                    <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded-lg font-mono">T-{res.torre}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-emerald-500 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Activo
                  </span>
                  <ChevronDown size={16} className={clsx('text-slate-500 transition-transform', expanded === res.id && 'rotate-180')} />
                </div>
              </div>
              {expanded === res.id && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-slate-800/40 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border border-slate-700/30">
                    {[
                      ['RUT', res.rut, 'font-mono'],
                      ['Dispositivo', res.deviceId, 'font-mono text-xs'],
                      ['Ubicación', `Depto. ${res.departamento} · Torre ${res.torre}`, ''],
                      ['Enrolado', res.enrolledAt ? format(new Date(res.enrolledAt), 'dd/MM/yyyy', { locale: es }) : 'N/A', ''],
                      ['Patente', res.patente || '—', 'font-mono'],
                      ['Vehículo', res.vehiculo || '—', ''],
                    ].map(([label, value, cls]) => (
                      <div key={label}>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">{label}</div>
                        <div className={clsx('text-sm text-white', cls)}>{value}</div>
                      </div>
                    ))}
                    <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-700/30 flex justify-end">
                      <button onClick={() => revokeAccess(res.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium transition-all">
                        <Lock size={12} /> Revocar Acceso
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">No se encontraron residentes.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── QR Generator ─────────────────────────────────────────────────────────────
const QrGenerator = ({ residents, generateResidentQR }) => {
  const [rutSearch, setRutSearch] = useState('');
  const [result, setResult] = useState(null);
  const handleSearch = (e) => { e.preventDefault(); setResult(generateResidentQR(rutSearch.trim())); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden self-start">
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-500/5 to-transparent">
          <h3 className="text-base font-bold text-white flex items-center gap-2"><QrCode size={18} className="text-indigo-400" /> Generar QR por RUT</h3>
          <p className="text-xs text-slate-400 mt-1">Busque un residente enrolado para generar su código de acceso personal.</p>
        </div>
        <form onSubmit={handleSearch} className="p-6 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={rutSearch} onChange={(e) => { setRutSearch(e.target.value); setResult(null); }}
              placeholder="Ej. 12.345.678-9"
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-mono" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            <Search size={18} /> Buscar y Generar QR
          </button>
          <div className="pt-2 space-y-1.5">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Selección Rápida</p>
            {residents.map((r) => (
              <button key={r.id} type="button" onClick={() => { setRutSearch(r.rut); setResult(null); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <img src={r.avatar} alt="" className="w-6 h-6 rounded-full bg-slate-800" />
                  <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{r.name}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{r.rut}</span>
              </button>
            ))}
          </div>
        </form>
      </div>

      <div className="self-start">
        {result?.success && (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-500/5 to-indigo-500/5">
              <h3 className="text-base font-bold text-white">QR de Acceso Generado</h3>
              <p className="text-xs text-slate-400 mt-0.5">Código para {result.resident.name}</p>
            </div>
            <div className="p-6 flex flex-col items-center space-y-5">
              <div className="bg-white p-5 rounded-2xl shadow-xl">
                <QRCodeSVG value={JSON.stringify(result.qrData)} size={200} level="H" bgColor="#ffffff" fgColor="#0f172a" />
              </div>
              <div className="w-full bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 grid grid-cols-2 gap-3">
                {[['Nombre', result.resident.name], ['RUT', result.resident.rut], ['Ubicación', `D-${result.resident.departamento} · T-${result.resident.torre}`], ['Dispositivo', result.resident.deviceId]].map(([l, v]) => (
                  <div key={l}><div className="text-[10px] text-slate-500 uppercase tracking-wider">{l}</div><div className="text-sm text-white font-mono mt-0.5">{v}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}
        {result && !result.success && (
          <div className="glass-card rounded-2xl border border-rose-500/20 p-8 text-center space-y-3 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto"><X size={28} className="text-rose-400" /></div>
            <h3 className="text-base font-bold text-white">RUT No Encontrado</h3>
            <p className="text-sm text-slate-400">{result.message}</p>
          </div>
        )}
        {!result && (
          <div className="glass-card rounded-2xl border border-slate-800 p-12 text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto"><QrCode size={36} className="text-slate-600" /></div>
            <h3 className="text-base font-medium text-slate-400">Ingrese un RUT para generar el QR</h3>
            <p className="text-xs text-slate-500">El código contendrá los datos del residente verificado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sidebar Icons Config ─────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'monitor', icon: Activity, label: 'Monitor' },
  { id: 'approvals', icon: ClipboardList, label: 'Aprobaciones' },
  { id: 'enrollment', icon: UserPlus, label: 'Enrolamiento' },
  { id: 'residents', icon: Users, label: 'Residentes' },
  { id: 'qr', icon: QrCode, label: 'Generador QR' },
];

const NAV_SECTIONS = [
  {
    title: 'Monitoreo en Vivo',
    items: [{ id: 'monitor', label: 'Monitor ENTRADAS/SALIDAS', icon: Activity }],
  },
  {
    title: 'Gestión de Acceso',
    items: [
      { id: 'approvals', label: 'Cola de Aprobación', icon: ClipboardList, badge: true },
      { id: 'enrollment', label: 'Enrolamiento Manual', icon: UserPlus },
      { id: 'residents', label: 'Residentes Enrolados', icon: Users },
    ],
  },
  {
    title: 'Herramientas',
    items: [{ id: 'qr', label: 'Generador de QR', icon: QrCode }],
  },
];

// ─── Main SuperAdmin Dashboard ────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const {
    superAdminSession, superAdminLogout,
    accessHistory, addAccessEvent,
    pendingApprovals, approveUser, rejectPending,
    residents, enrollResident, revokeAccess, generateResidentQR,
    conciergeQrLog,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('monitor');
  const [openTabs, setOpenTabs] = useState(['monitor']);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const openTab = (id) => {
    if (!openTabs.includes(id)) setOpenTabs((t) => [...t, id]);
    setActiveTab(id);
  };

  const closeTab = (id, e) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t !== id);
    setOpenTabs(remaining.length ? remaining : ['monitor']);
    if (activeTab === id) setActiveTab(remaining[remaining.length - 1] || 'monitor');
  };

  const handleApprove = (id, name) => {
    approveUser(id);
    showToast(`✓ ${name || 'Residente'} aprobado y añadido al sistema.`, 'success');
  };

  const handleReject = (id, reason) => {
    rejectPending(id, reason);
    showToast(`Solicitud rechazada: "${reason}"`, 'error');
  };

  const TAB_LABELS = {
    monitor: 'Monitor en Vivo',
    approvals: 'Cola de Aprobación',
    enrollment: 'Enrolamiento',
    residents: 'Residentes',
    qr: 'Generador QR',
  };

  const TAB_ICONS = {
    monitor: Activity,
    approvals: ClipboardList,
    enrollment: UserPlus,
    residents: Users,
    qr: QrCode,
  };

  return (
    <div className="flex h-screen bg-[#0b0f1a] overflow-hidden">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* ── Icon Sidebar ── */}
      <aside className="w-[58px] bg-[#0d1117] border-r border-slate-800/80 flex flex-col items-center py-4 gap-1 shrink-0 z-30">
        {/* Logo */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
          <ShieldAlert size={18} className="text-white" />
        </div>

        {/* Nav Icons */}
        {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => openTab(id)}
            title={label}
            className={clsx(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 relative group',
              activeTab === id
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800/60'
            )}
          >
            <Icon size={18} />
            {id === 'approvals' && pendingApprovals.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                {pendingApprovals.length}
              </span>
            )}
            {/* Tooltip */}
            <span className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
              {label}
            </span>
          </button>
        ))}

        {/* Bottom: Settings + Logout */}
        <div className="mt-auto flex flex-col items-center gap-1">
          <button title="Configuración"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-slate-800/60 transition-all">
            <Settings size={16} />
          </button>
          <button onClick={superAdminLogout} title="Cerrar Sesión"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Navigation Tree Panel ── */}
      <nav className="w-[220px] bg-[#0f1520] border-r border-slate-800/80 flex flex-col shrink-0 overflow-auto custom-scrollbar">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-slate-800/60">
          <div className="text-xs font-bold text-white tracking-widest uppercase">VexWard</div>
          <div className="text-[10px] text-slate-500 mt-0.5">SuperAdmin Panel</div>
        </div>

        {/* Nav Sections */}
        <div className="flex-1 py-3 space-y-5 px-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-2 mb-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em]">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(({ id, label, icon: Icon, badge }) => (
                  <button
                    key={id}
                    onClick={() => openTab(id)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left',
                      activeTab === id
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                    )}
                  >
                    <Icon size={13} className={activeTab === id ? 'text-indigo-400' : ''} />
                    <span className="flex-1 truncate">{label}</span>
                    {badge && pendingApprovals.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center shrink-0">
                        {pendingApprovals.length}
                      </span>
                    )}
                    {activeTab === id && <ChevronRight size={11} className="text-indigo-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="px-3 py-4 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              SA
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white truncate">
                {superAdminSession?.username || 'SuperAdmin'}
              </div>
              <div className="text-[9px] text-indigo-400 font-medium">● En línea</div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Workspace ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="h-12 bg-[#0d1117] border-b border-slate-800/80 flex items-center shrink-0">
          {/* Open Tabs */}
          <div className="flex items-stretch h-full overflow-x-auto">
            {openTabs.map((tabId) => {
              const Icon = TAB_ICONS[tabId];
              const isActive = activeTab === tabId;
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={clsx(
                    'flex items-center gap-2 px-4 text-xs font-medium border-b-2 whitespace-nowrap transition-all group relative',
                    isActive
                      ? 'border-indigo-500 text-indigo-300 bg-[#0f1520]'
                      : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  )}
                >
                  {Icon && <Icon size={13} />}
                  {TAB_LABELS[tabId]}
                  {tabId !== 'monitor' && (
                    <span
                      onClick={(e) => closeTab(tabId, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all ml-0.5 p-0.5 rounded"
                    >
                      <X size={10} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right area: System status */}
          <div className="ml-auto pr-5 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Sistema Activo
            </div>
            <div className="text-xs text-slate-600 font-mono">
              {new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-auto custom-scrollbar p-6">

          {/* ── Monitor ── */}
          {activeTab === 'monitor' && (
            <div className="h-full flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-xl font-bold text-white">Monitor de Seguridad en Tiempo Real</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Seguimiento en vivo de accesos por NFC, Bluetooth y control manual.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Transmisión en Vivo
                  </span>
                </div>
              </div>
              <LiveMonitor accessHistory={accessHistory} addAccessEvent={addAccessEvent} />
            </div>
          )}

          {/* ── Approvals ── */}
          {activeTab === 'approvals' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <ClipboardList size={20} className="text-indigo-400" />
                    Cola de Aprobación
                    {pendingApprovals.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {pendingApprovals.length} pendientes
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">Residentes que solicitaron acceso y esperan validación del SuperAdmin.</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-500/5 to-transparent">
                  <p className="text-xs text-slate-400">
                    Cada solicitud proviene de la app móvil del residente. El condominio <strong className="text-slate-300">no otorga acceso</strong> hasta recibir aprobación explícita del SuperAdmin.
                  </p>
                </div>
                <ApprovalQueue
                  approvals={pendingApprovals}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            </div>
          )}

          {/* ── Enrollment ── */}
          {activeTab === 'enrollment' && (
            <div>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserPlus size={20} className="text-indigo-400" /> Enrolamiento Manual de Residentes
                </h1>
                <p className="text-sm text-slate-500 mt-1">Registre nuevos residentes directamente desde el panel SuperAdmin por pasos.</p>
              </div>
              <EnrollmentForm enrollResident={enrollResident} residents={residents} />
            </div>
          )}

          {/* ── Residents ── */}
          {activeTab === 'residents' && (
            <div>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users size={20} className="text-indigo-400" /> Residentes Enrolados
                </h1>
                <p className="text-sm text-slate-500 mt-1">{residents.length} residentes vinculados al sistema de acceso.</p>
              </div>
              <ResidentsGrid residents={residents} revokeAccess={revokeAccess} />
            </div>
          )}

          {/* ── QR ── */}
          {activeTab === 'qr' && (
            <div className="space-y-8">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <QrCode size={20} className="text-indigo-400" /> Generador de QR de Acceso
                </h1>
                <p className="text-sm text-slate-500 mt-1">Genere códigos QR personales para residentes enrolados.</p>
              </div>
              <QrGenerator residents={residents} generateResidentQR={generateResidentQR} />

              {/* ── Solicitudes de QR por Conserjería ── */}
              <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <QrCode size={14} className="text-violet-400" />
                  Solicitudes de QR por Conserjería
                  {conciergeQrLog.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">
                      {conciergeQrLog.length} registros
                    </span>
                  )}
                </h2>
                <div className="glass-card rounded-2xl border border-violet-500/15 overflow-hidden">
                  <div className="p-4 border-b border-violet-500/10 bg-gradient-to-r from-violet-500/5 to-transparent">
                    <p className="text-xs text-slate-400">
                      Registros de QR generados por la conserjería cuando un residente olvidó su dispositivo. Trazabilidad completa de cada solicitud.
                    </p>
                  </div>
                  {conciergeQrLog.length === 0 ? (
                    <div className="py-10 text-center text-slate-600 text-sm">Sin solicitudes de conserjería aún.</div>
                  ) : (
                    <div className="divide-y divide-slate-800/60">
                      {conciergeQrLog.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-4 p-4 hover:bg-slate-800/20 transition-colors">
                          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
                            <QrCode size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white">{entry.residentName}</div>
                            <div className="text-xs text-slate-500 font-mono">{entry.residentRut} · D-{entry.departamento} · T-{entry.torre}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">{entry.id}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{formatDistanceToNow(new Date(entry.time), { addSuffix: true, locale: es })}</div>
                          </div>
                          <div className="shrink-0 text-[10px] text-slate-500 hidden sm:block">Por: <span className="text-slate-300">{entry.requestedBy}</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Status bar */}
        <div className="h-7 bg-[#0d1117] border-t border-slate-800/60 flex items-center px-4 gap-4 shrink-0">
          <span className="text-[10px] text-slate-600">VexWard SuperAdmin Console</span>
          <span className="text-[10px] text-slate-700">|</span>
          <span className="text-[10px] text-indigo-500">{superAdminSession?.username}</span>
          <span className="text-[10px] text-slate-700">|</span>
          <span className="text-[10px] text-slate-600">{residents.length} residentes · {pendingApprovals.length} pendientes</span>
          <span className="ml-auto text-[10px] text-slate-700">© {new Date().getFullYear()} VexCorp</span>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
