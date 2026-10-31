import React, { useEffect, useState } from 'react';
import { useDecks } from '../context/DeckContext';
import { RotateCcw, X, CheckCircle, Trash2 } from 'lucide-react';

export const UndoToastBanner: React.FC = () => {
  const { undoToast, undoLastAction, dismissUndoToast } = useDecks();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!undoToast) {
      setProgress(100);
      return;
    }

    const duration = 6000; // 6 seconds to undo
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        dismissUndoToast();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [undoToast, dismissUndoToast]);

  if (!undoToast) return null;

  return (
    <aside
      aria-label="Undo action"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-4 text-slate-100 backdrop-blur-xl relative overflow-hidden flex items-center justify-between gap-4">
        {/* Progress bar countdown */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center gap-3 truncate">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">
              {undoToast.message}
            </div>
            <div className="text-[11px] text-slate-400">
              Recoverable via instant Undo or Trash Archive
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={undoLastAction}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            onClick={dismissUndoToast}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-90"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
