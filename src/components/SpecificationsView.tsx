import React from 'react';
import { BookOpen, Palette, Code, Check } from 'lucide-react';

export const SpecificationsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white tracking-tight">
          System Specifications & Architectural Standards
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          High-end engineering standards governed by the Frontend Design Constitution and Education Systems reference.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Palette className="w-4 h-4" />
            <h3 className="font-semibold text-sm text-white">Color Architecture</h3>
          </div>
          <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <p><strong>60% Canvas:</strong> Slate-950 deep backdrop</p>
            <p><strong>30% Structural:</strong> Slate-900 panels with Slate-800 hairline borders</p>
            <p><strong>10% Accent:</strong> Vibrant Indigo (#6366F1) & Cyan accents with explicit text descriptors</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <BookOpen className="w-4 h-4" />
            <h3 className="font-semibold text-sm text-white">Typographic Hierarchy</h3>
          </div>
          <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <p><strong>Display:</strong> Outfit for geometric headings</p>
            <p><strong>Prose:</strong> Plus Jakarta Sans for reading and instructions</p>
            <p><strong>Data/Code:</strong> Space Mono with tabular numerals for precision</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Code className="w-4 h-4" />
            <h3 className="font-semibold text-sm text-white">Interactive Rules</h3>
          </div>
          <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <p><strong>Top Bar:</strong> Strict 3-zone contract, 1 line only</p>
            <p><strong>Zero-Pill:</strong> Clean unboxed text with typographic separators</p>
            <p><strong>Latency:</strong> Feedback response under 150ms</p>
          </div>
        </div>
      </div>
    </div>
  );
};
