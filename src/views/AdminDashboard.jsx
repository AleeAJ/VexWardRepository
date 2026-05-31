import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Activity, Users, ShieldAlert, Check, X, Search, UserMinus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminDashboard = () => {
  const { logout, accessHistory, pendingApprovals, approveUser, residents, revokeAccess } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.house.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Main Content Dashboard */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full">
        
        {/* Left Column: Live Feed & Stats */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-sm font-medium mb-1">Accesos Hoy</div>
                  <div className="text-3xl font-bold text-white">{accessHistory.length + 12}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Activity size={24} />
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-sm font-medium mb-1">Residentes</div>
                  <div className="text-3xl font-bold text-white">{residents.length}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-sm font-medium mb-1">Alertas</div>
                  <div className="text-3xl font-bold text-white">0</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <ShieldAlert size={24} />
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
                      <div className="text-xs text-slate-400">{req.house}</div>
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
                        <div className="text-xs text-slate-500">{res.house}</div>
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
    </div>
  );
};

export default AdminDashboard;
