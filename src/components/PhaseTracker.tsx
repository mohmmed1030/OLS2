import React from 'react';
import { SYSTEM_PHASES } from '../data/roadmapData';
import { CheckCircle2, ArrowRight, Clock, ShieldCheck, Check } from 'lucide-react';

interface PhaseTrackerProps {
  onSelectPhase: (phaseId: number) => void;
  selectedPhaseId: number;
}

export const PhaseTracker: React.FC<PhaseTrackerProps> = ({ onSelectPhase, selectedPhaseId }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-display font-semibold text-white tracking-tight">
            7-Phase Evolution Sequence
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Additive-Only Paradigm</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Phase 2 Complete (v0.5)</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">Mohmmed was here.</span>
            <span aria-hidden="true">·</span>
            <span>Zero Features Deleted</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Non-Destructive Ledger: 100% Invariant Retained</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {SYSTEM_PHASES.map((phase) => {
          const isCompleted = phase.status === 'completed';
          const isNextTarget = phase.id === 3;
          const isSelected = selectedPhaseId === phase.id;

          return (
            <button
              key={phase.id}
              onClick={() => onSelectPhase(phase.id)}
              className={`p-3.5 rounded-lg text-left transition-all relative border flex flex-col justify-between min-h-[135px] ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/30'
                  : isCompleted
                  ? 'border-emerald-500/40 bg-emerald-950/15 hover:border-emerald-500/70'
                  : isNextTarget
                  ? 'border-indigo-500/40 bg-indigo-950/15 hover:border-indigo-500/70'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-code text-xs font-semibold text-slate-400">
                    {phase.version}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isNextTarget ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-400" title="Next Milestone" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-200 line-clamp-1">
                  Phase {phase.id}
                </div>
                <div className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {phase.name.replace(/^Phase \d+:\s*/, '')}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span
                  className={
                    isCompleted
                      ? 'text-emerald-400 font-medium'
                      : isNextTarget
                      ? 'text-indigo-400 font-medium'
                      : 'text-slate-500'
                  }
                >
                  {isCompleted ? 'Completed' : isNextTarget ? 'Next Phase' : 'Queued'}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
