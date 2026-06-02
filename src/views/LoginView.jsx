import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  ShieldCheck, User, Shield, Monitor, Mail, Lock, KeyRound,
  ArrowRight, Building, Hash, ShieldAlert, Eye, EyeOff
} from 'lucide-react';
import clsx from 'clsx';

// ─── SuperAdmin Login Panel ───────────────────────────────────────────────────
const SuperAdminLoginPanel = () => {
  const { superAdminLogin } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Simulate slight network delay for realism
    await new Promise((r) => setTimeout(r, 600));
    const result = superAdminLogin(username.trim(), password);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-400 ml-1">Usuario SuperAdmin</label>
        <div className="relative">
          <ShieldAlert size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            placeholder="MoisesSuperAdmin"
            autoComplete="username"
            className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-400 ml-1">Contraseña</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••••••"
            autoComplete="current-password"
            className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <ShieldAlert size={15} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25 mt-2"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <ShieldAlert size={18} />
            Acceder como SuperAdmin
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Security notice */}
      <p className="text-center text-[11px] text-slate-600 mt-1">
        🔒 Acceso restringido — Solo personal autorizado VexCorp
      </p>
    </form>
  );
};

// ─── Main Login View ──────────────────────────────────────────────────────────
const LoginView = () => {
  const { login } = useAppContext();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'superadmin'
  const [email, setEmail] = useState('moises@vexward.com');
  const [password, setPassword] = useState('123456');
  const [regName, setRegName] = useState('');
  const [regDepto, setRegDepto] = useState('');
  const [regTorre, setRegTorre] = useState('');
  const [regId, setRegId] = useState('');

  const handleManualLogin = async (e) => {
    e.preventDefault();
    const API_URL = '/api';
    try {
      if (mode === 'login') {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success) {
          login(data.role);
        } else {
          alert(data.message || 'Error al iniciar sesión.');
        }
      } else {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: regName, rut: regId, departamento: regDepto, torre: regTorre, email, password }),
        });
        const data = await res.json();
        if (data.success) {
          alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
          setMode('login');
        } else {
          alert(data.message || 'Error al registrar.');
        }
      }
    } catch {
      if (email.includes('admin')) login('admin');
      else login('resident');
    }
  };

  const tabs = [
    { id: 'login', label: 'Iniciar Sesión' },
    { id: 'register', label: 'Registrarse' },
    { id: 'superadmin', label: '⚡ SuperAdmin' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-violet-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/8 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Container */}
      <div className="z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl sm:rounded-3xl sm:shadow-2xl sm:border sm:border-slate-800/80 min-h-screen sm:min-h-0 flex flex-col justify-center p-8 relative">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={clsx(
            "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg border transition-all duration-500",
            mode === 'superadmin'
              ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-indigo-400 shadow-indigo-500/20 border-indigo-500/30"
              : "bg-gradient-to-br from-violet-500/20 to-indigo-500/10 text-violet-400 shadow-violet-500/15 border-violet-500/20"
          )}>
            {mode === 'superadmin' ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">VexWard</h1>
          <p className="text-slate-400 text-sm">
            {mode === 'superadmin' ? 'Acceso SuperAdmin — VexCorp' : 'Control de Acceso Inteligente'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={clsx(
                "flex-1 py-2 text-xs font-medium rounded-lg transition-all",
                mode === tab.id
                  ? tab.id === 'superadmin'
                    ? "bg-indigo-600/80 text-white shadow-sm"
                    : "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SuperAdmin Panel */}
        {mode === 'superadmin' && (
          <div className="mb-8">
            <div className="mb-5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2">
              <ShieldAlert size={15} className="text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-xs text-indigo-300/80 leading-relaxed">
                Panel exclusivo para <strong className="text-indigo-300">SuperAdministradores</strong>. Las sesiones persisten entre recargas de página.
              </p>
            </div>
            <SuperAdminLoginPanel />
          </div>
        )}

        {/* Standard Login/Register Form */}
        {(mode === 'login' || mode === 'register') && (
          <>
            <form onSubmit={handleManualLogin} className="space-y-4 mb-8">
              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 ml-1">Nombre y Apellido</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Ej. Juan Pérez"
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 ml-1">RUT</label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" value={regId} onChange={(e) => setRegId(e.target.value)} placeholder="Ej. 12.345.678-9"
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400 ml-1">Departamento</label>
                      <div className="relative">
                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <select value={regDepto} onChange={(e) => setRegDepto(e.target.value)}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all text-sm appearance-none cursor-pointer">
                          <option value="" disabled>Depto.</option>
                          {Array.from({ length: 19 }, (_, i) => i + 6).map((n) => (
                            <option key={n} value={n} className="bg-slate-900">{n}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400 ml-1">Torre</label>
                      <div className="relative">
                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <select value={regTorre} onChange={(e) => setRegTorre(e.target.value)}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all text-sm appearance-none cursor-pointer">
                          <option value="" disabled>Torre</option>
                          {[8, 2, 6].map((t) => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Contraseña</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm" />
                </div>
              </div>
              <button type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-violet-500/20 mt-2">
                {mode === 'login' ? 'Ingresar' : 'Crear Cuenta'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
              <div className="relative bg-slate-900/90 px-4 text-xs text-slate-500 font-medium uppercase">Accesos de Demostración</div>
            </div>

            <div className="space-y-3">
              <button type="button" onClick={() => login('resident')}
                className="w-full bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 rounded-xl p-3 flex items-center gap-3 group active:scale-[0.98]">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                  <KeyRound size={20} />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Entrar como Residente</div>
                  <div className="text-slate-400 text-xs">Autocompletar (Moisés)</div>
                </div>
              </button>
              <button type="button" onClick={() => login('admin')}
                className="w-full bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 rounded-xl p-3 flex items-center gap-3 group active:scale-[0.98]">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <Shield size={20} />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Entrar como Administrador</div>
                  <div className="text-slate-400 text-xs">Autocompletar (Conserjería)</div>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center">
              <button onClick={() => login('simulator')}
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-violet-400 transition-colors">
                <Monitor size={14} />
                Abrir Simulador de Reja (Pantalla Completa)
              </button>
            </div>
          </>
        )}

        <div className="mt-8 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">© {new Date().getFullYear()} VexCorp. Todos los derechos reservados.</p>
          <p className="text-[10px] text-slate-600 mt-0.5">VexWard® es un producto desarrollado y propiedad de VexCorp.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
