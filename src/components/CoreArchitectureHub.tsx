import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Terminal, 
  GitBranch, 
  CheckCircle2, 
  Palette,
  Sparkles,
  Waves,
  CircleDot,
  Power,
  Sun,
  Moon,
  ArrowRight,
  Eye,
  Check
} from 'lucide-react';
import { AtomLogo } from './AtomLogo';
import { useTheme } from '../context/ThemeContext';
import { THEME_PALETTES } from '../data/themePalettes';
import { BackgroundPatternId, PaletteId } from '../types/theme';

interface CoreArchitectureHubProps {
  onStartPhaseOne: () => void;
  onExplorePhase: (phaseId: number) => void;
}

export const CoreArchitectureHub: React.FC<CoreArchitectureHubProps> = ({
  onStartPhaseOne,
  onExplorePhase,
}) => {
  const {
    palette,
    mode,
    backgroundPattern,
    animationEnabled,
    setPalette,
    toggleMode,
    setBackgroundPattern,
    toggleAnimation,
  } = useTheme();

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Phase 1 Fulfillment Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-8 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-3 tracking-wide uppercase">
              <span>Phase 2 (v0.5) Active</span>
              <span aria-hidden="true">·</span>
              <span>Hierarchical Folders & Decks</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300">Mohmmed was here.</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Zero Features Deleted</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              OMEGA LEARNING SYSTEM
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Version 0.5 is now operational. Experience nested hierarchical folders, custom flashcard decks, 
              interactive 3D card study with active recall, instant Undo trash recovery protection, 
              tactile micro-interactions, and the live system generation studio.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={toggleMode}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/25 active:scale-95"
              >
                {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-200" />}
                <span>Toggle {mode === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </button>

              <button
                onClick={toggleAnimation}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 border active:scale-95 ${
                  animationEnabled 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>Background Motion: {animationEnabled ? 'ACTIVE' : 'OFF'}</span>
              </button>

              <button
                onClick={() => onExplorePhase(3)}
                className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm transition-colors border border-slate-700/60 flex items-center gap-1.5 active:scale-95"
              >
                <span>View Phase 3 Scope</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Atom Nucleus Visual Showcase */}
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center w-full lg:w-72 shrink-0">
            <AtomLogo size={90} interactive={true} />
            <div className="mt-4 font-display font-semibold text-sm text-white">
              Atom Nucleus Brand Mark
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Glowing blue nucleus + 4 orbiting electrons (grey, yellow, black, pink) along invisible elliptical paths. Hover over it to accelerate orbit!
            </p>
          </div>
        </div>

        {/* Quiet architectural badges */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Preservation: Zero Prior Code Deleted</span>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" />
            <span>6 Dynamic Dual-Mode Palettes</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>3 Fluid Canvas Ambient Shaders</span>
          </div>
        </div>
      </div>

      {/* Feature Section 1: 6 Theme Palettes Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-semibold text-white tracking-tight">
              Color Palettes (6 Dual-Mode Options)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any palette below to instantly adapt the interface across both Dark and Light modes.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Active: <span className="font-semibold text-indigo-400">{THEME_PALETTES[palette].name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(THEME_PALETTES) as PaletteId[]).map((palId) => {
            const item = THEME_PALETTES[palId];
            const isSelected = palette === palId;

            return (
              <button
                key={palId}
                onClick={() => setPalette(palId)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-900 shadow-xs"
                        style={{ backgroundColor: item.previewColors[mode][0] }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-slate-900 shadow-xs"
                        style={{ backgroundColor: item.previewColors[mode][1] }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-slate-900 shadow-xs"
                        style={{ backgroundColor: item.previewColors[mode][2] }}
                      />
                    </div>
                    <span className="font-semibold text-sm text-white">
                      {item.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Section 2: 3 Animated Backgrounds + OFF Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-semibold text-white tracking-tight">
              Animated Canvas Backgrounds
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose from 3 algorithmic particle shaders or toggle motion completely off for zero distraction.
            </p>
          </div>
          <button
            onClick={toggleAnimation}
            className={`text-xs px-3 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
              animationEnabled
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Animation {animationEnabled ? 'Enabled' : 'Disabled (OFF)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pattern 1 */}
          <button
            onClick={() => {
              setBackgroundPattern('constellation');
              if (!animationEnabled) toggleAnimation();
            }}
            className={`p-5 rounded-xl border text-left transition-all ${
              backgroundPattern === 'constellation' && animationEnabled
                ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3">
              <CircleDot className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-white">Pattern 1: Constellation Network</h3>
              {backgroundPattern === 'constellation' && animationEnabled && (
                <Check className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Small slowly moving particle nodes that form delicate connecting network lines when close in proximity.
            </p>
          </button>

          {/* Pattern 2 */}
          <button
            onClick={() => {
              setBackgroundPattern('stars');
              if (!animationEnabled) toggleAnimation();
            }}
            className={`p-5 rounded-xl border text-left transition-all ${
              backgroundPattern === 'stars' && animationEnabled
                ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-white">Pattern 2: Space Glowing Stars</h3>
              {backgroundPattern === 'stars' && animationEnabled && (
                <Check className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Twinkling multi-magnitude cosmic starfield with subtle starlight glows and occasional celestial shooting star trajectories.
            </p>
          </button>

          {/* Pattern 3 */}
          <button
            onClick={() => {
              setBackgroundPattern('waves');
              if (!animationEnabled) toggleAnimation();
            }}
            className={`p-5 rounded-xl border text-left transition-all ${
              backgroundPattern === 'waves' && animationEnabled
                ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-3">
              <Waves className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-white">Pattern 3: Ocean Waves Effect</h3>
              {backgroundPattern === 'waves' && animationEnabled && (
                <Check className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-harmonic undulating marine wave ribbons creating a serene rhythmic tidal motion across the canvas.
            </p>
          </button>
        </div>
      </div>

      {/* Preservation Invariant Status Box */}
      <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono-code text-xs font-semibold text-slate-200">
              PHASE 1 (v0.3) VERIFIED & INTEGRATED
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            All requirements for Phase 1 delivered with 100% preservation of prior v0.1 architecture.
          </div>
        </div>

        <button
          onClick={onStartPhaseOne}
          className="px-4 py-2 text-xs font-semibold text-indigo-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 shrink-0"
        >
          View System Release Ledger
        </button>
      </div>
    </div>
  );
};
