import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, History, AlertCircle } from 'lucide-react';

export const PreservationLedgerView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white tracking-tight">
          Preservation Ledger & Non-Destructive Invariant
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically aligned commitment to preserve every module, layout, and interaction across all 7 releases.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-white">
              The Omega Invariant Rule
            </h3>
            <p className="text-xs text-slate-400">
              Invariant: ∀ Phase Pₙ where n ∈ [1..7], Features(Pₙ) ⊇ Features(Pₙ₋₁). No deletion allowed.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            When transitioning between phases, the engineering strategy strictly mandates:
          </p>
          <ul className="space-y-2 list-none pl-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Additive Scaffolding:</strong> New features are added in dedicated modules without tearing down existing components.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Design Consistency:</strong> Established color tokens, typography scales, and interaction ergonomics remain consistent and honored.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>State Retention:</strong> Existing state schemas are extended with optional or backward-compatible properties.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-indigo-400" />
            <h4 className="font-semibold text-sm text-white">Version History Ledger</h4>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
              <span className="font-mono-code font-bold text-slate-300">v0.1 (Current)</span>
              <span className="text-emerald-400 font-medium">Foundation Initialized</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/80 text-slate-500">
              <span className="font-mono-code font-bold">v0.2</span>
              <span>Pending Phase 1 Requirements</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/80 text-slate-500">
              <span className="font-mono-code font-bold">v0.3 – v0.9</span>
              <span>Scheduled Phases 2–6</span>
            </div>
            <div className="flex items-center justify-between py-2 text-slate-500">
              <span className="font-mono-code font-bold">v1.0</span>
              <span>Final Release Milestone</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="font-semibold text-sm text-white">Integrity Guardrails</h4>
          </div>
          <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
            <p>
              • All TypeScript interfaces reside in central type registries.
            </p>
            <p>
              • Components follow self-contained, modular single-responsibility principles.
            </p>
            <p>
              • Automated build compilation checks ensure zero regressions at every turn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
