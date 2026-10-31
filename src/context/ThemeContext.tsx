import React, { createContext, useContext, useEffect, useState } from 'react';
import { BackgroundPatternId, PaletteId, ThemeContextType, ThemeMode } from '../types/theme';
import { safeStorage } from '../utils/storage';

interface ThemeColorTokens {
  bgCanvas: string;
  bgSurface: string;
  bgCard: string;
  colorPrimary: string;
  colorPrimaryHover: string;
  colorPrimaryLight: string;
  colorTextMain: string;
  colorTextMuted: string;
  colorBorder: string;
  colorBorderSubtle: string;
}

const THEME_TOKENS: Record<PaletteId, { dark: ThemeColorTokens; light: ThemeColorTokens }> = {
  indigo: {
    dark: {
      bgCanvas: '#090d16',
      bgSurface: '#0f172a',
      bgCard: '#1e293b',
      colorPrimary: '#94a3b8',
      colorPrimaryHover: '#cbd5e1',
      colorPrimaryLight: 'rgba(148, 163, 184, 0.15)',
      colorTextMain: '#ffffff',
      colorTextMuted: '#94a3b8',
      colorBorder: '#334155',
      colorBorderSubtle: '#475569',
    },
    light: {
      bgCanvas: '#f8fafc',
      bgSurface: '#ffffff',
      bgCard: '#f1f5f9',
      colorPrimary: '#64748b',
      colorPrimaryHover: '#475569',
      colorPrimaryLight: 'rgba(100, 116, 139, 0.12)',
      colorTextMain: '#0f172a',
      colorTextMuted: '#64748b',
      colorBorder: '#cbd5e1',
      colorBorderSubtle: '#94a3b8',
    },
  },
  gold: {
    dark: {
      bgCanvas: '#12100b',
      bgSurface: '#1a1711',
      bgCard: '#262219',
      colorPrimary: '#f59e0b',
      colorPrimaryHover: '#d97706',
      colorPrimaryLight: 'rgba(245, 158, 11, 0.15)',
      colorTextMain: '#fef3c7',
      colorTextMuted: '#a89f91',
      colorBorder: '#383020',
      colorBorderSubtle: '#4d432d',
    },
    light: {
      bgCanvas: '#fdfbf7',
      bgSurface: '#ffffff',
      bgCard: '#faf5ea',
      colorPrimary: '#d97706',
      colorPrimaryHover: '#b45309',
      colorPrimaryLight: 'rgba(217, 119, 6, 0.08)',
      colorTextMain: '#292524',
      colorTextMuted: '#78716c',
      colorBorder: '#fde68a',
      colorBorderSubtle: '#fed7aa',
    },
  },
  black: {
    dark: {
      bgCanvas: '#050505',
      bgSurface: '#0f0f0f',
      bgCard: '#1a1a1a',
      colorPrimary: '#ef4444',
      colorPrimaryHover: '#dc2626',
      colorPrimaryLight: 'rgba(239, 68, 68, 0.15)',
      colorTextMain: '#ffffff',
      colorTextMuted: '#a3a3a3',
      colorBorder: '#262626',
      colorBorderSubtle: '#3f1515',
    },
    light: {
      bgCanvas: '#fafafa',
      bgSurface: '#ffffff',
      bgCard: '#f4f4f5',
      colorPrimary: '#dc2626',
      colorPrimaryHover: '#b91c1c',
      colorPrimaryLight: 'rgba(220, 38, 38, 0.12)',
      colorTextMain: '#09090b',
      colorTextMuted: '#71717a',
      colorBorder: '#e4e4e7',
      colorBorderSubtle: '#fecaca',
    },
  },
  pink: {
    dark: {
      bgCanvas: '#140a17',
      bgSurface: '#210f26',
      bgCard: '#2d1434',
      colorPrimary: '#ec4899',
      colorPrimaryHover: '#db2777',
      colorPrimaryLight: 'rgba(236, 72, 153, 0.15)',
      colorTextMain: '#fdf2f8',
      colorTextMuted: '#b89cb5',
      colorBorder: '#3e1a47',
      colorBorderSubtle: '#572563',
    },
    light: {
      bgCanvas: '#fdf8fb',
      bgSurface: '#ffffff',
      bgCard: '#fce7f3',
      colorPrimary: '#db2777',
      colorPrimaryHover: '#be185d',
      colorPrimaryLight: 'rgba(219, 39, 119, 0.08)',
      colorTextMain: '#371b3d',
      colorTextMuted: '#83547f',
      colorBorder: '#fbcfe8',
      colorBorderSubtle: '#f472b6',
    },
  },
  nature: {
    dark: {
      bgCanvas: '#07130e',
      bgSurface: '#0f241c',
      bgCard: '#173629',
      colorPrimary: '#10b981',
      colorPrimaryHover: '#059669',
      colorPrimaryLight: 'rgba(16, 185, 129, 0.15)',
      colorTextMain: '#ecfdf5',
      colorTextMuted: '#8ba89b',
      colorBorder: '#1c4232',
      colorBorderSubtle: '#2a5a45',
    },
    light: {
      bgCanvas: '#f6fbf8',
      bgSurface: '#ffffff',
      bgCard: '#e6f7ef',
      colorPrimary: '#059669',
      colorPrimaryHover: '#047857',
      colorPrimaryLight: 'rgba(5, 150, 105, 0.08)',
      colorTextMain: '#06281e',
      colorTextMuted: '#476e5c',
      colorBorder: '#a7f3d0',
      colorBorderSubtle: '#6ee7b7',
    },
  },
  space: {
    dark: {
      bgCanvas: '#060814',
      bgSurface: '#0c1228',
      bgCard: '#151c3d',
      colorPrimary: '#06b6d4',
      colorPrimaryHover: '#0891b2',
      colorPrimaryLight: 'rgba(6, 182, 212, 0.15)',
      colorTextMain: '#ecfeff',
      colorTextMuted: '#859bb3',
      colorBorder: '#1c2650',
      colorBorderSubtle: '#2d3a75',
    },
    light: {
      bgCanvas: '#f3f6fc',
      bgSurface: '#ffffff',
      bgCard: '#e3ecfa',
      colorPrimary: '#0891b2',
      colorPrimaryHover: '#0e7490',
      colorPrimaryLight: 'rgba(8, 145, 178, 0.08)',
      colorTextMain: '#081d36',
      colorTextMuted: '#516885',
      colorBorder: '#bcd2f2',
      colorBorderSubtle: '#94bdf0',
    },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [palette, setPaletteState] = useState<PaletteId>(() => {
    return (safeStorage.getItem('omega_palette') as PaletteId) || 'indigo';
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (safeStorage.getItem('omega_mode') as ThemeMode) || 'dark';
  });

  const [backgroundPattern, setBackgroundPatternState] = useState<BackgroundPatternId>(() => {
    const saved = safeStorage.getItem('omega_bg_pattern') as BackgroundPatternId;
    const validPatterns: BackgroundPatternId[] = [
      'waves', 'constellation', 'stars', 'math_chem', 'light_rain', 'dna_synapse', 'cardio_cells'
    ];
    if (validPatterns.includes(saved)) return saved;
    return 'waves';
  });

  const [animationEnabled, setAnimationEnabledState] = useState<boolean>(() => {
    const saved = safeStorage.getItem('omega_animation_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [username, setUsernameState] = useState<string>(() => {
    return safeStorage.getItem('omega_username') || 'Scholar';
  });

  const setPalette = (newPalette: PaletteId) => {
    setPaletteState(newPalette);
    safeStorage.setItem('omega_palette', newPalette);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    safeStorage.setItem('omega_mode', newMode);
  };

  const toggleMode = () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
  };

  const setBackgroundPattern = (newPattern: BackgroundPatternId) => {
    setBackgroundPatternState(newPattern);
    safeStorage.setItem('omega_bg_pattern', newPattern);
  };

  const toggleAnimation = () => {
    const nextState = !animationEnabled;
    setAnimationEnabledState(nextState);
    safeStorage.setItem('omega_animation_enabled', String(nextState));
  };

  const setAnimationEnabled = (enabled: boolean) => {
    setAnimationEnabledState(enabled);
    safeStorage.setItem('omega_animation_enabled', String(enabled));
  };

  const setUsername = (name: string) => {
    const trimmed = name.trim() || 'Scholar';
    setUsernameState(trimmed);
    safeStorage.setItem('omega_username', trimmed);
  };

  useEffect(() => {
    const root = document.documentElement;

    // Toggle dark class
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Set data-palette attribute
    root.setAttribute('data-palette', palette);
    root.setAttribute('data-mode', mode);

    // Apply tokens directly to CSS variables
    const tokens = THEME_TOKENS[palette]?.[mode] || THEME_TOKENS.indigo[mode];
    root.style.setProperty('--bg-canvas', tokens.bgCanvas);
    root.style.setProperty('--bg-surface', tokens.bgSurface);
    root.style.setProperty('--bg-card', tokens.bgCard);
    root.style.setProperty('--color-primary', tokens.colorPrimary);
    root.style.setProperty('--color-primary-hover', tokens.colorPrimaryHover);
    root.style.setProperty('--color-primary-light', tokens.colorPrimaryLight);
    root.style.setProperty('--color-text-main', tokens.colorTextMain);
    root.style.setProperty('--color-text-muted', tokens.colorTextMuted);
    root.style.setProperty('--color-border', tokens.colorBorder);
    root.style.setProperty('--color-border-subtle', tokens.colorBorderSubtle);
  }, [palette, mode]);

  return (
    <ThemeContext.Provider
      value={{
        palette,
        mode,
        backgroundPattern,
        animationEnabled,
        username,
        setPalette,
        setMode,
        toggleMode,
        setBackgroundPattern,
        toggleAnimation,
        setAnimationEnabled,
        setUsername,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
