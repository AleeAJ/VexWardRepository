import React, { useState } from 'react';
import { Check, X, AlertTriangle, Clock, User, Building, Hash, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Reject Reasons ───────────────────────────────────────────────────────────
const REJECT_REASONS = [
  'Departamento Incorrecto',
  'Documentación Incompleta',
  'Identidad No Verificada',
  'Solicitud Duplicada',
  'Datos Inconsistentes',
  'Propietario No Confirma',
  'Otro',
];

// ─── Reject Modal ─────────────────────────────────────────────────────────────
const RejectModal = ({ applicant, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const finalReason = reason === 'Otro' ? customReason || 'Otro' : reason;
    if (!finalReason) return;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-rose-500/10 to-transparent">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Rechazar Solicitud</h3>
              <p className="text-sm text-slate-400 mt-0.5">
                {applicant.name} — Depto. {applicant.departamento} · Torre {applicant.torre}
              </p>
            </div>
          </div>
        </div>

        {/* Reason Selector */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 block">
              Motivo del Rechazo
            </label>
            <div className="space-y-2">
              {REJECT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm ${
                    reason === r
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    reason === r ? 'border-rose-500 bg-rose-500' : 'border-slate-600'
                  }`}>
                    {reason === r && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  {r}
                  {r === reason && <ChevronRight size={14} className="ml-auto text-rose-400" />}
                </button>
              ))}
            </div>
          </div>

          {reason === 'Otro' && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Especifique el motivo
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describa el motivo del rechazo..."
                rows={3}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-sm resize-none"
              />
            </div>
          )}

          {/* Info box */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 flex items-start gap-2">
            <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
            El solicitante será eliminado de la cola. Esta acción no es reversible.
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium rounded-xl py-2.5 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason || (reason === 'Otro' && !customReason.trim())}
            className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 transition-all text-sm flex items-center justify-center gap-2"
          >
            <X size={16} />
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Toast Notification ───────────────────────────────────────────────────────
export const Toast = ({ message, type = 'success', onDismiss }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm animate-in slide-in-from-right-8 fade-in duration-300 ${
    type === 'success'
      ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100'
      : 'bg-rose-900/90 border-rose-500/40 text-rose-100'
  }`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
      type === 'success' ? 'bg-emerald-500/25 text-emerald-400' : 'bg-rose-500/25 text-rose-400'
    }`}>
      {type === 'success' ? <Check size={18} /> : <X size={18} />}
    </div>
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
      <X size={14} />
    </button>
  </div>
);

// ─── Approval Queue Component ─────────────────────────────────────────────────
const ApprovalQueue = ({ approvals, onApprove, onReject }) => {
  const [rejectTarget, setRejectTarget] = useState(null);

  const handleApprove = (id, name) => {
    onApprove(id, name);
  };

  const handleRejectConfirm = (reason) => {
    onReject(rejectTarget.id, reason);
    setRejectTarget(null);
  };

  if (approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
          <Check size={28} className="text-emerald-400/50" />
        </div>
        <p className="text-slate-400 font-medium">Cola limpia</p>
        <p className="text-slate-600 text-sm mt-1">No hay solicitudes pendientes de aprobación.</p>
      </div>
    );
  }

  return (
    <>
      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          applicant={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-800/40">
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><Hash size={11} /> ID / RUT</div>
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><User size={11} /> Nombre y Apellido</div>
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><Building size={11} /> Depto. / Torre</div>
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><Clock size={11} /> Hora Solicitud</div>
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {approvals.map((req) => (
              <tr key={req.id} className="hover:bg-slate-800/20 transition-colors group animate-in fade-in duration-300">
                <td className="py-4 px-4">
                  <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                    {req.rut}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0 border border-slate-700">
                      {req.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-white">{req.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded-lg font-mono">
                      D-{req.departamento}
                    </span>
                    <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded-lg font-mono">
                      T-{req.torre}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(req.requestTime), { addSuffix: true, locale: es })}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {new Date(req.requestTime).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleApprove(req.id, req.name)}
                      id={`approve-${req.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                    >
                      <Check size={14} />
                      Aprobar
                    </button>
                    <button
                      onClick={() => setRejectTarget(req)}
                      id={`reject-${req.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                    >
                      <X size={14} />
                      Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ApprovalQueue;
