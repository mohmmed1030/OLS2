import React from 'react';
import { SYSTEM_PHASES } from '../data/roadmapData';
import { ArrowRight, CheckCircle2, Clock, Sparkles, Layers } from 'lucide-react';

interface RoadmapViewProps {
  onSelectPhase: (phaseId: number) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onSelectPhase }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Evolution Pipeline Roadmap
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete trajectory from foundational architecture (v0.1) to full autonomous production system (v1.0).
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Total Milestones: <span className="text-white font-mono-code font-bold">7 Phases</span>
        </div>
      </div>

      <div className="space-y-4">
        {SYSTEM_PHASES.map((phase) => {
          const isTarget = phase.id === 1;

          return (
            <div
              key={phase.id}
              className={`p-6 rounded-xl border transition-all ${
                isTarget
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono-code text-xs font-bold text-indigo-400">
                      {phase.version}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 font-medium">
                      Phase {phase.id} of 7
                    </span>
                    {isTarget && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-semibold text-emerald-400">
                          Active Target
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white">
                    {phase.name}
                  </h3>
                </div>

                <button
                  onClick={() => onSelectPhase(phase.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                    isTarget
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span>Inspect Phase {phase.id}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                {phase.description}
              </p>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  Key Deliverables
                </div>
                <div className="flex flex-wrap gap-2">
                  {phase.keyPillars.map((pillar, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50"
                    >
                      {pillar}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
