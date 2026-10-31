import React from 'react';
import { useDecks } from '../context/DeckContext';
import { X, Trash2, RotateCcw, Folder, Layers, BookOpen, AlertCircle } from 'lucide-react';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({ isOpen, onClose }) => {
  const { trash, restoreTrashItem, emptyTrash } = useDecks();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-white">
                Trash & Recovery Archive
              </h3>
              <p className="text-xs text-slate-400">
                {trash.length} deleted {trash.length === 1 ? 'item' : 'items'} available for instant restoration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {trash.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Trash2 className="w-8 h-8 mx-auto text-slate-600" />
              <div className="text-sm font-medium">Trash is empty</div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Any folders, decks, or flashcards you delete will appear here so you can recover them at any time.
              </p>
            </div>
          ) : (
            trash.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                    {item.type === 'folder' ? (
                      <Folder className="w-4 h-4 text-amber-400" />
                    ) : item.type === 'deck' ? (
                      <Layers className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-medium text-slate-200 truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Deleted {new Date(item.deletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Type: {item.type}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => restoreTrashItem(item.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-medium text-xs transition-all flex items-center gap-1.5 border border-indigo-500/30 active:scale-95 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {trash.length > 0 && (
          <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Items remain preserved in memory and localStorage
            </span>
            <button
              onClick={emptyTrash}
              className="text-rose-400 hover:text-rose-300 font-medium transition-colors hover:underline active:scale-95"
            >
              Empty Trash Permanently
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
