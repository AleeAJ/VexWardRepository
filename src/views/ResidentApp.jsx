import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Unlock, UserPlus, History, X, QrCode } from 'lucide-react';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ResidentApp = () => {
  const { activeUser, logout, gateState, openGate, accessHistory, generateGuestPass } = useAppContext();
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'guests', 'history'
  const [guestName, setGuestName] = useState('');
  const [activePass, setActivePass] = useState(null);

  const handleCreatePass = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    const pass = generateGuestPass(guestName);
    setActivePass(pass);
    setGuestName('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center">
      {/* Mobile container constraint for desktop viewing */}
      <div className="w-full max-w-md bg-slate-900 min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-5 flex items-center justify-between glass-panel border-b-0 border-slate-800 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <img src={activeUser?.avatar} alt={activeUser?.name} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" />
            <div>
              <div className="text-white font-medium text-sm leading-tight">{activeUser?.name}</div>
              <div className="text-emerald-400 text-xs">{activeUser?.house}</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 px-6 pt-6">
          {activeTab === 'home' && (
            <div className="flex flex-col h-full items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Bienvenido a casa</h2>
                <p className="text-slate-400 text-sm">Presiona para abrir la reja principal</p>
              </div>

              <div className="relative">
                {/* Glowing Backgrounds */}
                <div className={clsx(
                  "absolute inset-0 rounded-full blur-3xl transition-all duration-1000",
                  gateState === 'closed' ? "bg-emerald-500/20 scale-100" :
                  gateState === 'opening' ? "bg-teal-400/40 scale-110 animate-pulse" :
                  "bg-emerald-400/50 scale-125"
                )}></div>
                
                {/* Main Button */}
                <button
                  onClick={() => openGate()}
                  disabled={gateState !== 'closed'}
                  className={clsx(
                    "relative w-64 h-64 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-500 shadow-2xl overflow-hidden group",
                    gateState === 'closed' ? "bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-emerald-500/30 hover:border-emerald-400/60 active:scale-95" :
                    gateState === 'opening' ? "bg-slate-800 border-2 border-teal-400/50 scale-95" :
                    "bg-gradient-to-b from-emerald-500 to-emerald-600 border-2 border-emerald-400 scale-100"
                  )}
                >
                  <div className={clsx(
                    "absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 transition-opacity duration-300",
                    gateState === 'closed' && "group-hover:opacity-100"
                  )}></div>
                  
                  <Unlock 
                    size={64} 
                    className={clsx(
                      "transition-all duration-500",
                      gateState === 'closed' ? "text-emerald-400" :
                      gateState === 'opening' ? "text-teal-300 animate-bounce" :
                      "text-white drop-shadow-md"
                    )} 
                  />
                  
                  <span className={clsx(
                    "text-xl font-bold tracking-wide transition-colors duration-300",
                    gateState === 'closed' ? "text-slate-200" :
                    gateState === 'opening' ? "text-teal-200" :
                    "text-white drop-shadow-sm"
                  )}>
                    {gateState === 'closed' ? 'ABRIR' :
                     gateState === 'opening' ? 'CONECTANDO...' :
                     'ABIERTO'}
                  </span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50">
                <div className={clsx(
                  "w-2.5 h-2.5 rounded-full",
                  gateState === 'closed' ? "bg-slate-500" :
                  gateState === 'opening' ? "bg-teal-400 animate-pulse" :
                  "bg-emerald-400 animate-pulse"
                )}></div>
                <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                  {gateState === 'closed' ? 'Sistema Listo' :
                   gateState === 'opening' ? 'Abriendo Reja' :
                   'Acceso Concedido'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Pase de Visitas</h2>
                <p className="text-slate-400 text-sm">Genera un acceso temporal QR.</p>
              </div>

              {!activePass ? (
                <form onSubmit={handleCreatePass} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nombre del Invitado</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!guestName.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl px-4 py-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:shadow-none flex justify-center items-center gap-2"
                  >
                    <QrCode size={20} />
                    Generar Pase
                  </button>
                </form>
              ) : (
                <div className="glass-card rounded-3xl p-6 text-center space-y-6 border border-emerald-500/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <div className="text-sm text-slate-400">Pase para</div>
                      <div className="text-xl font-bold text-white">{activePass.guestName}</div>
                    </div>
                    <button 
                      onClick={() => setActivePass(null)}
                      className="text-slate-400 hover:text-white bg-slate-800 p-1 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center">
                    {/* Simulated QR Code using a pattern */}
                    <div className="w-full h-full border-8 border-slate-900 rounded-lg flex flex-wrap gap-1 p-1 bg-white relative">
                      {[...Array(64)].map((_, i) => (
                        <div key={i} className={clsx("w-[10%] h-[10%] bg-slate-900", Math.random() > 0.5 ? "opacity-100" : "opacity-0")}></div>
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 animate-pulse"></div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300">
                    <p>Válido hasta:</p>
                    <p className="font-medium text-emerald-400">
                      {format(new Date(activePass.expires), "dd 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                  </div>

                  <button className="text-xs text-emerald-400 font-medium hover:text-emerald-300 uppercase tracking-wider">
                    Compartir Pase
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Mi Historial</h2>
                <p className="text-slate-400 text-sm">Últimos accesos registrados.</p>
              </div>

              <div className="space-y-3">
                {accessHistory.filter(h => h.name === activeUser?.name || h.name === 'Desconocido' || h.method.includes('Invitado')).map((entry) => (
                  <div key={entry.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <Unlock size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{entry.name}</div>
                      <div className="text-slate-400 text-xs flex items-center gap-2">
                        <span>{entry.method}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span>{formatDistanceToNow(new Date(entry.time), { addSuffix: true, locale: es })}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {accessHistory.length === 0 && (
                  <div className="text-center text-slate-500 py-10">No hay registros recientes</div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-6 py-4 flex justify-between items-center z-10">
          <button 
            onClick={() => setActiveTab('history')}
            className={clsx(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === 'history' ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <History size={24} />
            <span className="text-[10px] font-medium">Historial</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('home')}
            className={clsx(
              "w-14 h-14 rounded-full flex items-center justify-center -translate-y-6 shadow-lg border-4 border-slate-900 transition-transform active:scale-95",
              activeTab === 'home' ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            )}
          >
            <Unlock size={24} />
          </button>

          <button 
            onClick={() => setActiveTab('guests')}
            className={clsx(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === 'guests' ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <UserPlus size={24} />
            <span className="text-[10px] font-medium">Visitas</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ResidentApp;
