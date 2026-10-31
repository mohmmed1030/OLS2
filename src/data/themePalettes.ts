import { PaletteDefinition, PaletteId } from '../types/theme';

export const THEME_PALETTES: Record<PaletteId, PaletteDefinition> = {
  indigo: {
    id: 'indigo',
    name: 'White & Gray',
    description: 'Clean high-contrast monochrome with pure white, cool slate, and refined silver accents',
    previewColors: {
      dark: ['#0f172a', '#1e293b', '#e2e8f0'],
      light: ['#f8fafc', '#ffffff', '#64748b'],
    },
  },
  gold: {
    id: 'gold',
    name: 'Gold & White',
    description: 'Refined royal prestige with rich warm amber highlights and crisp porcelain surfaces',
    previewColors: {
      dark: ['#12100b', '#1c1913', '#f59e0b'],
      light: ['#fffdf9', '#ffffff', '#d97706'],
    },
  },
  black: {
    id: 'black',
    name: 'Royal Black',
    description: 'Ultra-minimal obsidian aesthetics with pure monochrome contrast and vivid crimson red accents',
    previewColors: {
      dark: ['#050505', '#121212', '#ef4444'],
      light: ['#fafafa', '#ffffff', '#dc2626'],
    },
  },
  pink: {
    id: 'pink',
    name: 'Cute Pink & Purple',
    description: 'Vibrant playful gradient tones with soft blush pastels, orchid violet, and rose accents',
    previewColors: {
      dark: ['#140a17', '#220f27', '#ec4899'],
      light: ['#fdf8fb', '#ffffff', '#db2777'],
    },
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    description: 'Deep forest ecology with organic sage, emerald botanical tones, and earthen neutrals',
    previewColors: {
      dark: ['#07130e', '#0f241b', '#10b981'],
      light: ['#f6fbf8', '#ffffff', '#059669'],
    },
  },
  space: {
    id: 'space',
    name: 'Space',
    description: 'Cosmic celestial void with deep nebula indigo, starlight cyan, and electric pulsar rays',
    previewColors: {
      dark: ['#060814', '#0d132b', '#06b6d4'],
      light: ['#f3f6fc', '#ffffff', '#0891b2'],
    },
  },
};
