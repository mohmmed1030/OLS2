export interface StandardColor {
  hex: string;
  name: string;
  category: 'primary' | 'secondary' | 'extended';
}

export const TWELVE_STANDARD_COLORS: StandardColor[] = [
  // Primary Colors (3)
  { hex: '#ef4444', name: 'Crimson Red (Primary)', category: 'primary' },
  { hex: '#3b82f6', name: 'Cobalt Blue (Primary)', category: 'primary' },
  { hex: '#eab308', name: 'Solar Yellow (Primary)', category: 'primary' },
  
  // Secondary Colors (3)
  { hex: '#10b981', name: 'Emerald Green (Secondary)', category: 'secondary' },
  { hex: '#f97316', name: 'Vivid Orange (Secondary)', category: 'secondary' },
  { hex: '#8b5cf6', name: 'Royal Purple (Secondary)', category: 'secondary' },
  
  // Other Standard Colors (6)
  { hex: '#6366f1', name: 'Deep Indigo', category: 'extended' },
  { hex: '#06b6d4', name: 'Cyan Aqua', category: 'extended' },
  { hex: '#ec4899', name: 'Rose Pink', category: 'extended' },
  { hex: '#d97706', name: 'Warm Amber', category: 'extended' },
  { hex: '#059669', name: 'Forest Jade', category: 'extended' },
  { hex: '#64748b', name: 'Steel Slate', category: 'extended' },
];
