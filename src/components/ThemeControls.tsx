import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { THEME_PALETTES } from '../data/themePalettes';
import { BackgroundPatternId, PaletteId } from '../types/theme';
import { sound } from '../utils/sound';
import { 
  Palette, 
  Sun, 
  Moon, 
  Sparkles, 
  CircleDot, 
  Power, 
  ChevronDown, 
  Check, 
  Volume2,
  VolumeX,
  SlidersHorizontal,
  User,
  Share2,
  Binary,
  CloudRain,
  Dna,
  Activity,
  Waves
} from 'lucide-react';
import { AtomLogo } from './AtomLogo';

export const ThemeControls: React.FC = () => {
  const {
    palette,
    mode,
    backgroundPattern,
    animationEnabled,
    username,
    setPalette,
    toggleMode,
    setBackgroundPattern,
    toggleAnimation,
    setUsername,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(sound.enabled);
  const [tempUsername, setTempUsername] = useState(username);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTempUsername(username);
  }, [username]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const patternOptions: { id: BackgroundPatternId; label: string; icon: React.ReactNode }[] = [
    { id: 'waves', label: 'Sunset Ocean Waves', icon: <Waves className="w-3.5 h-3.5" /> },
    { id: 'constellation', label: 'Constellation Lines', icon: <Share2 className="w-3.5 h-3.5" /> },
    { id: 'stars', label: 'Space Glowing Stars', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'math_chem', label: 'Math & Chem Formulas', icon: <Binary className="w-3.5 h-3.5" /> },
    { id: 'light_rain', label: 'Gentle Light Rain', icon: <CloudRain className="w-3.5 h-3.5" /> },
    { id: 'dna_synapse', label: 'Medical: DNA & Synapses', icon: <Dna className="w-3.5 h-3.5" /> },
    { id: 'cardio_cells', label: 'Medical: ECG & Cells', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  const currentPaletteDef = THEME_PALETTES[palette];

  const handlePaletteSelect = (palId: PaletteId) => {
    sound.playClick(620);
    setPalette(palId);
  };

  const handleModeToggle = () => {
    sound.playClick(580);
    toggleMode();
  };

  const handleAnimationToggle = () => {
    sound.playClick(500);
    toggleAnimation();
  };

  const handlePatternSelect = (patId: BackgroundPatternId) => {
    sound.playClick(660);
    setBackgroundPattern(patId);
  };

  const handleSoundToggle = () => {
    const next = !soundActive;
    sound.enabled = next;
    setSoundActive(next);
    if (next) sound.playClick(750);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Consolidated Single Sub-Menu Trigger Button */}
      <button
        onClick={() => {
          sound.playClick(520);
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-medium cursor-pointer active:scale-95 select-none ${
          isOpen
            ? 'bg-slate-800 border-indigo-500 text-white shadow-md'
            : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-700/70 text-slate-200'
        }`}
        aria-expanded={isOpen}
        aria-label="System Preferences & Appearance Menu"
        title="Open Theme, Appearance & Settings Sub-Menu"
      >
        {/* Dual Palette Swatches */}
        <div className="flex items-center -space-x-1 shrink-0">
          <span
            className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow-xs"
            style={{ backgroundColor: currentPaletteDef.previewColors[mode][1] }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow-xs"
            style={{ backgroundColor: currentPaletteDef.previewColors[mode][2] }}
          />
        </div>

        {/* Mode Indicator Icon */}
        <span className="shrink-0">
          {mode === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
        </span>

        {/* Text Label */}
        <span className="hidden sm:inline font-medium tracking-tight">
          Preferences
        </span>

        <span className="sm:hidden font-medium text-[11px]">
          Menu
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Sub-Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2.25rem)] max-w-[340px] max-h-[82vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl backdrop-blur-2xl z-50 p-3.5 sm:p-4 space-y-3.5 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Sub-Menu Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-xs tracking-wider uppercase text-white font-display">
                System Preferences
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-500/30">
              <span>Gen 5</span>
              <span>·</span>
              <span>v1.0</span>
            </div>
          </div>

          {/* User Profile & Greeting Configuration */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Learner Profile</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                Hello, {username || 'Scholar'}!
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                onBlur={() => setUsername(tempUsername)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sound.playClick(650);
                    setUsername(tempUsername);
                  }
                }}
                placeholder="Enter preferred username..."
                maxLength={30}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 font-medium"
              />
              <button
                type="button"
                onClick={() => {
                  sound.playClick(650);
                  setUsername(tempUsername);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold active:scale-95 cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>

          {/* 1. Day Mode vs. Night Mode Segmented Control */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Appearance Mode</span>
              <span className="text-[10px] font-mono-code text-indigo-400">
                {mode === 'light' ? 'Day Active' : 'Night Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={handleModeToggle}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'light'
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Sun className={`w-3.5 h-3.5 ${mode === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Day Mode (Light)</span>
              </button>

              <button
                type="button"
                onClick={handleModeToggle}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'dark'
                    ? 'bg-indigo-600/25 text-indigo-400 border border-indigo-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Moon className={`w-3.5 h-3.5 ${mode === 'dark' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>Night Mode (Dark)</span>
              </button>
            </div>
          </div>

          {/* 2. Color Palettes Selection (6 distinct options) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Color Palette</span>
              <span className="text-[10px] font-mono-code text-indigo-400">6 Options</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(THEME_PALETTES) as PaletteId[]).map((palId) => {
                const item = THEME_PALETTES[palId];
                const isSelected = palette === palId;

                return (
                  <button
                    key={palId}
                    type="button"
                    onClick={() => handlePaletteSelect(palId)}
                    className={`flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all border ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 text-white font-semibold shadow-xs'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="flex -space-x-1 shrink-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-900"
                          style={{ backgroundColor: item.previewColors[mode][1] }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-900"
                          style={{ backgroundColor: item.previewColors[mode][2] }}
                        />
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Animated Background Shaders */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Animated Background
              </span>

              <button
                type="button"
                onClick={handleAnimationToggle}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                  animationEnabled
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
                title="Toggle canvas animation"
              >
                <Power className={`w-3 h-3 ${animationEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{animationEnabled ? 'ACTIVE' : 'OFF'}</span>
              </button>
            </div>

            <div className="space-y-1">
              {patternOptions.map((pat) => {
                const isSelected = backgroundPattern === pat.id;
                return (
                  <button
                    key={pat.id}
                    type="button"
                    disabled={!animationEnabled}
                    onClick={() => handlePatternSelect(pat.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      !animationEnabled
                        ? 'opacity-40 cursor-not-allowed text-slate-500'
                        : isSelected
                        ? 'bg-slate-800 text-white font-medium border border-indigo-500/60 shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={isSelected && animationEnabled ? 'text-indigo-400' : 'text-slate-400'}>
                        {pat.icon}
                      </span>
                      <span>{pat.label}</span>
                    </div>
                    {isSelected && animationEnabled && (
                      <Check className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Audio Micro-Interactions */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Audio Feedback
            </div>

            <button
              type="button"
              onClick={handleSoundToggle}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:bg-slate-800/80 text-xs transition-colors"
            >
              <div className="flex items-center gap-2 text-slate-200">
                {soundActive ? (
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span>Micro-Interaction Audio</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                soundActive
                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {soundActive ? 'ENABLED' : 'MUTED'}
              </span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
