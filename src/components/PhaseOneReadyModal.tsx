import React from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Palette, Sparkles, Check } from 'lucide-react';

interface PhaseOneReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhaseOneReadyModal: React.FC<PhaseOneReadyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-white">
                Phase 1 Delivered (v0.3)
              </h3>
              <p className="text-xs text-slate-400">
                Brand Identity, 6 Palettes & 3 Motion Canvases Integrated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5 font-mono-code leading-relaxed">
            <div className="text-emerald-400 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>PHASE 1 DELIVERED ACCORDING TO SPEC</span>
            </div>
            <div>
              • Logo: Glowing blue nucleus + 4 orbiting electrons (grey, yellow, black, pink)
            </div>
            <div>
              • 6 Color Palettes: Indigo, Gold/White, Royal Black, Pink/Purple, Nature, Space
            </div>
            <div>
              • Dark & Light Modes: Fully supported for all 6 themes
            </div>
            <div>
              • 3 Background Patterns: Rising Bubbles, Space Stars, Ocean Waves + Animation OFF
            </div>
            <div>
              • Non-Destructive Invariant: 100% of previous modules preserved
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200/90 leading-relaxed">
            <strong className="text-white">Ready for Phase 2:</strong> In the next phase, we will expand with the Curriculum & Knowledge Graph taxonomy while keeping all Phase 1 appearance and motion features intact.
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
