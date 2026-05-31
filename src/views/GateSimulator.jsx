import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Lock, Unlock, LogOut } from 'lucide-react';
import clsx from 'clsx';

const GateSimulator = () => {
  const { gateState, lastOpenedBy, logout, openGate } = useAppContext();

  return (
    <div className="min-h-screen relative overflow-hidden bg-emerald-500 flex flex-col items-center justify-center">
      
      {/* Background (Success State) - Revealed when gates open */}
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[100px] opacity-50"></div>
        
        <div className="text-center flex flex-col items-center">
          <div className="w-48 h-48 rounded-full bg-white shadow-emerald-600/50 shadow-2xl flex items-center justify-center mb-8">
            <Unlock size={80} className="text-emerald-500 drop-shadow-md" />
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tighter text-white drop-shadow-lg">
            ACCESO CONCEDIDO
          </h1>
          <p className="text-4xl font-medium text-emerald-50 tracking-tight drop-shadow-md">
            Bienvenido, {lastOpenedBy?.name || 'Moisés Álvarez'}
          </p>
        </div>
      </div>

      {/* Logout Button (Always on top) */}
      <button 
        onClick={logout}
        className="absolute top-8 left-8 z-50 w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all backdrop-blur-md cursor-pointer"
        title="Volver al Login"
      >
        <LogOut size={20} />
      </button>

      {/* physical Gates Animation */}
      <div className="absolute inset-0 z-20 pointer-events-none flex">
        {/* Left Gate Panel */}
        <div 
          className={clsx(
            "w-1/2 h-full bg-slate-900 border-r-8 border-slate-950 flex flex-col justify-center items-end pr-8 transition-transform duration-[2000ms] ease-in-out relative overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.5)]",
            gateState !== 'closed' ? "-translate-x-full" : "translate-x-0"
          )}
        >
          {/* Gate Texture/Bars */}
          <div className="absolute inset-0 opacity-20 flex justify-around">
            {[...Array(5)].map((_, i) => (
              <div key={`l-bar-${i}`} className="w-8 h-full bg-black"></div>
            ))}
          </div>
          {/* Lock Icon Half */}
          <div className={clsx(
            "w-32 h-48 bg-slate-800 rounded-l-3xl border-y-4 border-l-4 border-slate-700 flex items-center justify-end pr-4 transition-all duration-500 relative z-10",
            gateState === 'opening' && "bg-teal-900 border-teal-700 animate-pulse"
          )}>
            <div className="w-12 h-12 rounded-full bg-slate-900/50 flex items-center justify-center">
              <Lock size={40} className="text-slate-500 translate-x-10" />
            </div>
          </div>
        </div>

        {/* Right Gate Panel */}
        <div 
          className={clsx(
            "w-1/2 h-full bg-slate-900 border-l-8 border-slate-950 flex flex-col justify-center items-start pl-8 transition-transform duration-[2000ms] ease-in-out relative overflow-hidden shadow-[-20px_0_50px_rgba(0,0,0,0.5)]",
            gateState !== 'closed' ? "translate-x-full" : "translate-x-0"
          )}
        >
          {/* Gate Texture/Bars */}
          <div className="absolute inset-0 opacity-20 flex justify-around">
            {[...Array(5)].map((_, i) => (
              <div key={`r-bar-${i}`} className="w-8 h-full bg-black"></div>
            ))}
          </div>
          {/* Lock Icon Half */}
          <div className={clsx(
            "w-32 h-48 bg-slate-800 rounded-r-3xl border-y-4 border-r-4 border-slate-700 flex items-center justify-start pl-4 transition-all duration-500 relative z-10",
            gateState === 'opening' && "bg-teal-900 border-teal-700 animate-pulse"
          )}>
            <div className="w-12 h-12 rounded-full bg-slate-900/50"></div>
          </div>
        </div>

        {/* Closed State Text (Interactive for Demo) */}
        <div className={clsx(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-30",
          gateState === 'closed' ? "opacity-100 delay-1000 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          {/* Hidden button to trigger opening manually on the device screen */}
          <button 
            onClick={() => openGate({ name: 'Demo Presencial' })}
            className="mt-72 outline-none"
          >
            <h1 className="text-6xl font-black tracking-tighter text-slate-600 drop-shadow-2xl hover:text-slate-500 transition-colors cursor-pointer">
              REJA CERRADA
            </h1>
          </button>
        </div>
        
        {/* Opening State Text */}
        <div className={clsx(
          "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-30",
          gateState === 'opening' ? "opacity-100" : "opacity-0"
        )}>
          <h1 className="text-5xl font-black mt-72 tracking-tighter text-teal-400 drop-shadow-2xl animate-pulse">
            SISTEMA ABRIENDO...
          </h1>
        </div>
      </div>
    </div>
  );
};

export default GateSimulator;
