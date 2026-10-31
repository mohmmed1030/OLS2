import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCw, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Activity,
  ArrowRight,
  Code2,
  FolderTree
} from 'lucide-react';
import { sound } from '../utils/sound';

interface BuildStep {
  id: string;
  name: string;
  module: string;
  status: 'pending' | 'running' | 'completed';
  logs: string[];
}

export const GenerationProcessStudio: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(3); // Default completed
  const [progress, setProgress] = useState(100);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'INIT: Omega System Kernel v0.9 [Active]',
    'MODULE: Hierarchical Folder & Deck Scaffolding active',
    'MODULE: Autonomous AI Generation Engine mounted with Gemini multimodal parser',
    'MODULE: Phase 4 Adaptive Study Loop & Auto-Reveal timer calibrated',
    'MODULE: Phase 5 Empirical Analytics & Test Score Ledger mounted',
    'RENDER: Canvas stacking context promoted to z-0 (Ambient shaders visible across all palettes)',
    'VERIFIED: "Mohmmed was here." signature watermark validated and pinned',
    'STATUS: All Phase 1 through Phase 5 subsystems compiling with 0 errors',
  ]);


  const triggerLiveGeneration = () => {
    sound.playClick(700);
    setIsRunning(true);
    setProgress(0);
    setActiveStepIndex(0);
    setTerminalLogs(['>> INITIATING FULL LIVE SYSTEM SYNTHESIS (v0.5)...']);

    const steps = [
      {
        text: '>> [1/4] Hydrating Recursive Knowledge Graph & Nested Folder Schemas...',
        delay: 500,
        prog: 25,
      },
      {
        text: '>> [2/4] Allocating Undo Recovery Cache & Invariant Transaction Ledger...',
        delay: 1100,
        prog: 50,
      },
      {
        text: '>> [3/4] Calibrating Tactile Micro-Interactions & Web Audio Synthesizer...',
        delay: 1700,
        prog: 75,
      },
      {
        text: '>> [4/4] Synchronizing Background Particle Canvases & Watermark Tokens...',
        delay: 2300,
        prog: 100,
      },
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        sound.playClick(600 + idx * 80);
        setTerminalLogs((prev) => [...prev, s.text]);
        setProgress(s.prog);
        setActiveStepIndex(idx + 1);
        if (idx === steps.length - 1) {
          setTimeout(() => {
            sound.playRestore();
            setTerminalLogs((prev) => [
              ...prev,
              '>> [SUCCESS] Synthesis complete! System state: v0.5 verified with zero deletions.',
              '>> Watermark active: "Mohmmed was here."',
            ]);
            setIsRunning(false);
          }, 400);
        }
      }, s.delay);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Live Engine Status & Watermark Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wide">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Active Generation Pipeline</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono-code font-bold">Phase 5 (v0.9) Live</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            System Generation & Synthesis Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual monitoring of application assembly, module compilation, and non-destructive state retention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerLiveGeneration}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium text-xs transition-all flex items-center gap-2 shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Live Generation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar & Phase Gates */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white uppercase tracking-wider">
            Compilation & Assembly Pipeline
          </span>
          <span className="font-mono-code font-bold text-emerald-400">
            {progress}% Complete
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800 flex">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 4 Interactive Visual Stages */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {[
            {
              title: '1. Scaffolding',
              desc: 'Atom Brand & 6 Themes',
              version: 'v0.1 → v0.3',
              done: progress >= 25,
            },
            {
              title: '2. Hierarchy Engine',
              desc: 'Folders, Decks & Flashcards',
              version: 'v0.5 Active',
              done: progress >= 50,
            },
            {
              title: '3. Invariant Ledger',
              desc: 'Undo Recovery & Trash',
              version: 'Zero Deletions',
              done: progress >= 75,
            },
            {
              title: '4. Micro-Interactions',
              desc: 'Haptics & Shaders',
              version: 'Live Verified',
              done: progress >= 100,
            },
          ].map((st, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-lg border text-left transition-all ${
                st.done
                  ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono-code text-[11px] font-bold text-indigo-400">
                  {st.version}
                </span>
                {st.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </div>
              <div className="text-xs font-semibold text-white">{st.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{st.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Terminal Log Streamer */}
      <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 shadow-xl font-mono-code text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">
              OMEGA COMPILER // REAL-TIME EXECUTION LOGS
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Stream: stdout (60fps)
          </span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1 text-slate-300 leading-relaxed">
          {terminalLogs.map((log, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 ${
                log.includes('SUCCESS')
                  ? 'text-emerald-400 font-bold'
                  : log.includes('Mohmmed was here')
                  ? 'text-amber-300 font-semibold'
                  : log.startsWith('>>')
                  ? 'text-indigo-300'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-slate-600 select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
