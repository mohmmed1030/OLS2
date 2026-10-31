import React from 'react';
import { SYSTEM_PHASES } from '../data/roadmapData';
import { X, Check, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface PhaseDetailModalProps {
  phaseId: number | null;
  onClose: () => void;
  onSelectPhase: (phaseId: number) => void;
}

export const PhaseDetailModal: React.FC<PhaseDetailModalProps> = ({
  phaseId,
  onClose,
  onSelectPhase,
}) => {
  if (phaseId === null) return null;
  const phase = SYSTEM_PHASES.find((p) => p.id === phaseId) || SYSTEM_PHASES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-mono-code text-xs font-bold">
              {phase.version}
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-white">
                {phase.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Phase {phase.id} of 7</span>
                <span aria-hidden="true">·</span>
                <span className={phase.id === 1 ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                  {phase.id === 1 ? 'Current Readiness Target' : 'Successive Evolutionary Step'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Phase Overview & Scope
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {phase.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Architectural Pillars & Deliverables
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {phase.keyPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-200"
                >
                  <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{pillar}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-200/90 leading-relaxed">
              <strong className="text-white font-semibold">Strict Additive Preservation Guarantee:</strong>{' '}
              All components, state structures, and design tokens created in this and earlier phases remain 100% active and un-deleted in subsequent releases through v1.0.
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {phase.id < 7 ? (
              <button
                onClick={() => onSelectPhase(phase.id + 1)}
                className="hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <span>Next: Phase {phase.id + 1}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <span>Final Phase Target (v1.0)</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
