import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Activity, Users, ShieldAlert, Check, X, Search, UserMinus, UserPlus, QrCode, Smartphone, Hash, Building, Fingerprint, Eye, ChevronDown, ChevronUp, Ticket } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const { logout, accessHistory, pendingApprovals, approveUser, residents, revokeAccess, enrollResident, guestPasses, generateResidentQR } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'enrollment', 'passes', 'qrgen'

  // Enrollment form state
  const [enrollName, setEnrollName] = useState('');
  const [enrollRut, setEnrollRut] = useState('');
  const [enrollDepto, setEnrollDepto] = useState('');
  const [enrollTorre, setEnrollTorre] = useState('');
  const [enrollDevice, setEnrollDevice] = useState('');
  const [enrollMsg, setEnrollMsg] = useState(null); // { type: 'success' | 'error', text: string }

  // QR Generator state
  const [qrRutSearch, setQrRutSearch] = useState('');
  const [qrResult, setQrResult] = useState(null);

  // Expanded resident details
  const [expandedResident, setExpandedResident] = useState(null);

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    `depto ${r.departamento}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `torre ${r.torre}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.rut && r.rut.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEnroll = (e) => {
    e.preventDefault();
    if (!enrollName.trim() || !enrollRut.trim() || !enrollDepto || !enrollTorre || !enrollDevice.trim()) {
      setEnrollMsg({ type: 'error', text: 'Todos los campos son obligatorios.' });
      return;
    }
    
    const result = enrollResident({
      name: enrollName.trim(),
      rut: enrollRut.trim(),
      departamento: enrollDepto,
      torre: enrollTorre,
      deviceId: enrollDevice.trim(),
    });
    
    if (result.success) {
      setEnrollMsg({ type: 'success', text: `✓ ${result.resident.name} enrolado exitosamente.` });
      setEnrollName(''); setEnrollRut(''); setEnrollDepto(''); setEnrollTorre(''); setEnrollDevice('');
      setTimeout(() => setEnrollMsg(null), 4000);
    } else {
      setEnrollMsg({ type: 'error', text: result.message });
    }
  };

  const handleQrSearch = (e) => {
    e.preventDefault();
    const result = generateResidentQR(qrRutSearch.trim());
    setQrResult(result);
  };

  const activePasses = guestPasses.filter(p => p.status === 'active' && new Date(p.expires) > new Date());
  
  const tabs = [
    { id: 'overview', label: 'Panel General', icon: Activity },
    { id: 'enrollment', label: 'Enrolamiento', icon: UserPlus },
    { id: 'passes', label: 'Pases de Visita', icon: Ticket },
    { id: 'qrgen', label: 'Generar QR', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="h-16 glass-panel border-b border-slate-800 flex items-center justify-between px-8 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Conserjería Central</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-slate-300 font-medium">Sistema Activo</span>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Salir</span>
          </button>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-emerald-400 text-emerald-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'passes' && activePasses.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {activePasses.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===================== OVERVIEW TAB ===================== */}
      {activeTab === 'overview' && (
        <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full">
          
          {/* Left Column: Live Feed & Stats */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-xs font-medium mb-1">Accesos Hoy</div>
                    <div className="text-2xl font-bold text-white">{accessHistory.length + 12}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Activity size={20} />
                  </div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-xs font-medium mb-1">Enrolados</div>
                    <div className="text-2xl font-bold text-white">{residents.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Fingerprint size={20} />
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-xs font-medium mb-1">Pases Activos</div>
                    <div className="text-2xl font-bold text-white">{activePasses.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <Ticket size={20} />
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-xs font-medium mb-1">Alertas</div>
                    <div className="text-2xl font-bold text-white">0</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <ShieldAlert size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Feed */}
            <div className="glass-card rounded-2xl border border-slate-800 flex-1 flex flex-col min-h-[400px]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Registro de Accesos en Vivo
                </h2>
                <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">Exportar</button>
              </div>
              
              <div className="p-2 flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Usuario / Invitado</th>
                      <th className="py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Método</th>
                      <th className="py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Tiempo</th>
                      <th className="py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {accessHistory.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors animate-in fade-in slide-in-from-top-2">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-emerald-400">
                              {entry.method.includes('Invitado') ? <Users size={16} /> : <UserMinus size={16} />}
                            </div>
                            <span className="font-medium text-slate-200">{entry.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-400">{entry.method}</td>
                        <td className="py-4 px-4 text-sm text-slate-400">
                          {formatDistanceToNow(new Date(entry.time), { addSuffix: true, locale: es })}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check size={12} />
                            Aprobado
                          </span>
                        </td>
                      </tr>
                    ))}
                    {accessHistory.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">Sin accesos recientes</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Approvals & Revocation Panel */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Pendings */}
            <div className="glass-card rounded-2xl border border-slate-800 flex flex-col">
              <div className="p-5 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white">Pendientes de Aprobación</h2>
              </div>
              <div className="p-5 space-y-4">
                {pendingApprovals.map(req => (
                  <div key={req.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-white">{req.name}</div>
                        <div className="text-xs text-slate-400">Depto. {req.departamento} · Torre {req.torre}</div>
                        <div className="text-xs text-slate-500">{req.rut}</div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(req.requestTime), { locale: es })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => approveUser(req.id)}
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={16} /> Aprobar
                      </button>
                      <button 
                        onClick={() => approveUser(req.id)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <X size={16} /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
                {pendingApprovals.length === 0 && (
                  <div className="text-center text-slate-500 py-4 text-sm">No hay solicitudes pendientes.</div>
                )}
              </div>
            </div>

            {/* Revocation Panel */}
            <div className="glass-card rounded-2xl border border-slate-800 flex-1 flex flex-col">
              <div className="p-5 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white">Panel de Bloqueo</h2>
                <p className="text-xs text-slate-400 mt-1">Revocar acceso a residentes por extravío o mora.</p>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar residente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all"
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-auto pr-1 custom-scrollbar">
                  {filteredResidents.map(res => (
                    <div key={res.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={res.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-800" />
                        <div>
                          <div className="text-sm font-medium text-slate-200">{res.name}</div>
                          <div className="text-xs text-slate-500">Depto. {res.departamento} · Torre {res.torre}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => revokeAccess(res.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Revocar Acceso"
                      >
                        <ShieldAlert size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      )}

      {/* ===================== ENROLLMENT TAB ===================== */}
      {activeTab === 'enrollment' && (
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Enrollment Form */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-500/5 to-transparent">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus size={20} className="text-emerald-400" />
                  Enrolar Nuevo Residente
                </h2>
                <p className="text-xs text-slate-400 mt-1">Vincule un residente con su dispositivo único para prevenir cuentas no supervisadas.</p>
              </div>
              
              <form onSubmit={handleEnroll} className="p-6 space-y-4">
                {/* RUT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">RUT (Identificador Único)</label>
                  <div className="relative">
                    <Fingerprint size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      value={enrollRut}
                      onChange={(e) => setEnrollRut(e.target.value)}
                      placeholder="Ej. 12.345.678-9"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Nombre */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nombre y Apellido</label>
                  <div className="relative">
                    <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      value={enrollName}
                      onChange={(e) => setEnrollName(e.target.value)}
                      placeholder="Ej. María González"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Depto & Torre */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">N° Depto.</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <select
                        value={enrollDepto}
                        onChange={(e) => setEnrollDepto(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-slate-600">Depto.</option>
                        {Array.from({ length: 19 }, (_, i) => i + 6).map(num => (
                          <option key={num} value={num} className="bg-slate-900 text-white">{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Torre</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <select
                        value={enrollTorre}
                        onChange={(e) => setEnrollTorre(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-slate-600">Torre</option>
                        <option value="8" className="bg-slate-900 text-white">8</option>
                        <option value="2" className="bg-slate-900 text-white">2</option>
                        <option value="6" className="bg-slate-900 text-white">6</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Device ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Dispositivo Telefónico (ID Único)</label>
                  <div className="relative">
                    <Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      value={enrollDevice}
                      onChange={(e) => setEnrollDevice(e.target.value)}
                      placeholder="Ej. iPhone-A1B2C3 / IMEI"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 ml-1">IMEI o identificador único del dispositivo. Solo un dispositivo por residente.</p>
                </div>

                {/* Feedback */}
                {enrollMsg && (
                  <div className={`rounded-xl p-3 text-sm font-medium border ${
                    enrollMsg.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {enrollMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mt-2"
                >
                  <Fingerprint size={18} />
                  Enrolar Residente
                </button>
              </form>
            </div>
          </div>

          {/* Enrolled Residents List */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Residentes Enrolados</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{residents.length} residentes vinculados a dispositivos</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Fingerprint size={14} className="text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">{residents.length} activos</span>
                </div>
              </div>
              
              <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-auto custom-scrollbar">
                {residents.map(res => (
                  <div key={res.id} className="hover:bg-slate-800/20 transition-colors">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedResident(expandedResident === res.id ? null : res.id)}
                    >
                      <div className="flex items-center gap-3">
                        <img src={res.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" />
                        <div>
                          <div className="text-sm font-medium text-white">{res.name}</div>
                          <div className="text-xs text-slate-400">RUT: {res.rut}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs text-slate-400">Depto. {res.departamento} · Torre {res.torre}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                            <Smartphone size={10} />
                            {res.deviceId}
                          </div>
                        </div>
                        {expandedResident === res.id ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                      </div>
                    </div>
                    
                    {expandedResident === res.id && (
                      <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-slate-800/40 rounded-xl p-4 grid grid-cols-2 gap-3 border border-slate-700/30">
                          <div>
                            <div className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">RUT</div>
                            <div className="text-sm text-white font-mono">{res.rut}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">Dispositivo</div>
                            <div className="text-sm text-white font-mono">{res.deviceId}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">Ubicación</div>
                            <div className="text-sm text-white">Depto. {res.departamento} · Torre {res.torre}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">Enrolado</div>
                            <div className="text-sm text-white">
                              {res.enrolledAt ? format(new Date(res.enrolledAt), "dd/MM/yyyy", { locale: es }) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ===================== GUEST PASSES TAB ===================== */}
      {activeTab === 'passes' && (
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Ticket size={20} className="text-violet-400" />
                  Pases de Visita Generados por Residentes
                </h2>
                <p className="text-xs text-slate-400 mt-1">Todos los QR de visita creados por residentes quedan registrados aquí.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activePasses.length} activos
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                  {guestPasses.length} totales
                </span>
              </div>
            </div>
            
            <div className="overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/30">
                    <th className="py-3 px-5 text-xs font-medium text-slate-400 uppercase tracking-wider">ID Pase</th>
                    <th className="py-3 px-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Visitante</th>
                    <th className="py-3 px-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Creado Por</th>
                    <th className="py-3 px-5 text-xs font-medium text-slate-400 uppercase tracking-wider">RUT Residente</th>
                    <th className="py-3 px-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Ubicación</th>
                    <th className="py-3 px-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Creado</th>
                    <th className="py-3 px-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Expira</th>
                    <th className="py-3 px-5 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {guestPasses.map((pass) => {
                    const isExpired = new Date(pass.expires) < new Date();
                    const statusLabel = isExpired ? 'Expirado' : pass.status === 'used' ? 'Usado' : 'Activo';
                    const statusClass = isExpired 
                      ? 'bg-slate-600/10 text-slate-400 border-slate-600/20' 
                      : pass.status === 'used' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    
                    return (
                      <tr key={pass.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-5">
                          <span className="font-mono text-sm text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">{pass.id}</span>
                        </td>
                        <td className="py-3 px-5 text-sm font-medium text-white">{pass.guestName}</td>
                        <td className="py-3 px-5 text-sm text-slate-300">{pass.createdBy.name}</td>
                        <td className="py-3 px-5 text-sm text-slate-400 font-mono">{pass.createdBy.rut}</td>
                        <td className="py-3 px-5 text-xs text-slate-400">
                          Depto. {pass.createdBy.departamento} · Torre {pass.createdBy.torre}
                        </td>
                        <td className="py-3 px-5 text-xs text-slate-400">
                          {formatDistanceToNow(new Date(pass.createdAt), { addSuffix: true, locale: es })}
                        </td>
                        <td className="py-3 px-5 text-xs text-slate-400">
                          {format(new Date(pass.expires), "dd/MM HH:mm", { locale: es })}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {guestPasses.length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-500">
                        <Ticket size={32} className="mx-auto mb-2 opacity-30" />
                        No hay pases de visita registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* ===================== QR GENERATOR TAB ===================== */}
      {activeTab === 'qrgen' && (
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Search by RUT */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden self-start">
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-blue-500/5 to-transparent">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode size={20} className="text-blue-400" />
                Generar QR por RUT
              </h2>
              <p className="text-xs text-slate-400 mt-1">Busque un residente por su RUT para generar su código QR de acceso personal.</p>
            </div>
            
            <form onSubmit={handleQrSearch} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">RUT del Residente</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    value={qrRutSearch}
                    onChange={(e) => { setQrRutSearch(e.target.value); setQrResult(null); }}
                    placeholder="Ej. 12.345.678-9"
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
              >
                <Search size={18} />
                Buscar y Generar QR
              </button>

              {/* Quick select existing residents */}
              <div className="pt-2">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-2">Selección Rápida</p>
                <div className="space-y-1.5">
                  {residents.map(res => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => { setQrRutSearch(res.rut); setQrResult(null); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <img src={res.avatar} alt="" className="w-6 h-6 rounded-full bg-slate-800" />
                        <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{res.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{res.rut}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* QR Result */}
          <div className="self-start">
            {qrResult && qrResult.success && (
              <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-500/5 to-blue-500/5">
                  <h2 className="text-lg font-bold text-white">QR de Acceso Generado</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Código válido para {qrResult.resident.name}</p>
                </div>
                
                <div className="p-6 flex flex-col items-center space-y-6">
                  {/* QR Code */}
                  <div className="bg-white p-5 rounded-2xl shadow-xl shadow-emerald-500/10">
                    <QRCodeSVG 
                      value={JSON.stringify(qrResult.qrData)}
                      size={200}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                    />
                  </div>

                  {/* Resident Info */}
                  <div className="w-full bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">Nombre</div>
                        <div className="text-sm text-white font-medium">{qrResult.resident.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">RUT</div>
                        <div className="text-sm text-white font-mono">{qrResult.resident.rut}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">Ubicación</div>
                        <div className="text-sm text-white">Depto. {qrResult.resident.departamento} · Torre {qrResult.resident.torre}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">Dispositivo</div>
                        <div className="text-sm text-white font-mono text-[13px]">{qrResult.resident.deviceId}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-700/30 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check size={14} />
                        <span className="text-xs font-medium">Verificado y Enrolado</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        ID: {qrResult.qrData.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {qrResult && !qrResult.success && (
              <div className="glass-card rounded-2xl border border-rose-500/20 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
                    <X size={32} className="text-rose-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">RUT No Encontrado</h3>
                  <p className="text-sm text-slate-400">{qrResult.message}</p>
                  <p className="text-xs text-slate-500">Verifique que el residente esté enrolado en el sistema.</p>
                </div>
              </div>
            )}

            {!qrResult && (
              <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-12 text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto">
                    <QrCode size={36} className="text-slate-600" />
                  </div>
                  <h3 className="text-base font-medium text-slate-400">Ingrese un RUT para generar el QR</h3>
                  <p className="text-xs text-slate-500">El código QR contendrá los datos del residente verificado.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default AdminDashboard;
