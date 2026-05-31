import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, User, Shield, Monitor, Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const LoginView = () => {
  const { login } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('moises@vexward.com');
  const [password, setPassword] = useState('123456');

  const handleManualLogin = (e) => {
    e.preventDefault();
    // Simple demo validation
    if (email.includes('admin')) {
      login('admin');
    } else {
      login('resident');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 relative overflow-hidden sm:bg-slate-900">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Container - Appears as a mobile screen on desktop */}
      <div className="z-10 w-full max-w-md bg-slate-900 sm:rounded-3xl sm:shadow-2xl sm:border sm:border-slate-800 min-h-screen sm:min-h-0 flex flex-col justify-center p-8 relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] border border-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">VexWard</h1>
          <p className="text-slate-400 text-sm">Control de Acceso Inteligente</p>
        </div>

        {/* Auth Tabs */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setIsLogin(true)}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              isLogin ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              !isLogin ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Registrarse
          </button>
        </div>

        {/* Realistic Auth Form */}
        <form onSubmit={handleManualLogin} className="space-y-4 mb-8">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">Nombre Completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 ml-1">Contraseña</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mt-2"
          >
            {isLogin ? 'Ingresar' : 'Crear Cuenta'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative bg-slate-900 px-4 text-xs text-slate-500 font-medium uppercase">
            Accesos de Demostración
          </div>
        </div>

        {/* Demo Quick Access */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => login('resident')}
            className="w-full bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 rounded-xl p-3 flex items-center gap-3 group active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <KeyRound size={20} />
            </div>
            <div className="text-left">
              <div className="text-white text-sm font-medium">Entrar como Residente</div>
              <div className="text-slate-400 text-xs">Autocompletar (Moisés)</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => login('admin')}
            className="w-full bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 rounded-xl p-3 flex items-center gap-3 group active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Shield size={20} />
            </div>
            <div className="text-left">
              <div className="text-white text-sm font-medium">Entrar como Administrador</div>
              <div className="text-slate-400 text-xs">Autocompletar (Conserjería)</div>
            </div>
          </button>
        </div>

        {/* Simulator Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => login('simulator')}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-emerald-400 transition-colors"
          >
            <Monitor size={14} />
            Abrir Simulador de Reja (Pantalla Completa)
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginView;
