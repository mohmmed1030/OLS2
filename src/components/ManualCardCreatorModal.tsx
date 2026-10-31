import React, { useState } from 'react';
import { useDecks } from '../context/DeckContext';
import { sound } from '../utils/sound';
import { TWELVE_STANDARD_COLORS } from '../data/standardColors';
import { 
  Plus, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Tag, 
  X, 
  AlertCircle
} from 'lucide-react';

interface ManualCardCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDeckId?: string | null;
}

export const ManualCardCreatorModal: React.FC<ManualCardCreatorModalProps> = ({
  isOpen,
  onClose,
  initialDeckId = null,
}) => {
  const { decks, folders, createDeck, addCard } = useDecks();

  const [selectedDeckId, setSelectedDeckId] = useState<string>(
    initialDeckId || (decks.length > 0 ? decks[0].id : 'new')
  );

  // New deck creation state if user chooses to create new deck
  const [isCreatingNewDeck, setIsCreatingNewDeck] = useState(decks.length === 0);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckFolderId, setNewDeckFolderId] = useState<string>('root');
  const [newDeckColor, setNewDeckColor] = useState<string>(TWELVE_STANDARD_COLORS[0].hex);

  // Form Fields: Common
  const [tagsInput, setTagsInput] = useState('');
  const [createdCount, setCreatedCount] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields: Standard Flashcard
  const [standardFront, setStandardFront] = useState('');
  const [standardBack, setStandardBack] = useState('');

  // Bulk rapid mode
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkContent, setBulkContent] = useState('');

  if (!isOpen) return null;

  const parseTags = (): string[] => {
    if (!tagsInput.trim()) return ['Manual-Created'];
    return tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const ensureTargetDeck = (): string | null => {
    if (selectedDeckId === 'new' || isCreatingNewDeck || decks.length === 0) {
      if (!newDeckTitle.trim()) {
        setValidationError('Please enter a title for the new deck.');
        return null;
      }
      const folderId = newDeckFolderId === 'root' ? null : newDeckFolderId;
      const created = createDeck(
        newDeckTitle.trim(),
        newDeckDesc.trim(),
        folderId,
        newDeckColor,
        'manual'
      );
      setSelectedDeckId(created.id);
      setIsCreatingNewDeck(false);
      return created.id;
    }
    return selectedDeckId;
  };

  const resetFormFields = () => {
    setStandardFront('');
    setStandardBack('');
    setTagsInput('');
    setValidationError(null);
  };

  const handleSaveCard = (closeAfter = false) => {
    setValidationError(null);
    const deckId = ensureTargetDeck();
    if (!deckId) return;

    const tags = parseTags();

    if (isBulkMode) {
      // Bulk creation: parse line by line (Format: "Front | Back")
      const lines = bulkContent.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length === 0) {
        setValidationError('Please enter at least one card in the bulk box (Format: Question | Answer).');
        return;
      }

      let bulkAdded = 0;
      lines.forEach((line) => {
        let front = '';
        let back = '';
        if (line.includes('|')) {
          const parts = line.split('|');
          front = parts[0]?.trim() || '';
          back = parts.slice(1).join('|').trim();
        } else if (line.includes(' - ')) {
          const parts = line.split(' - ');
          front = parts[0]?.trim() || '';
          back = parts.slice(1).join(' - ').trim();
        } else {
          front = line.trim();
          back = 'Study review item';
        }

        if (front && back) {
          addCard(deckId, front, back, tags);
          bulkAdded++;
        }
      });

      sound.playRestore();
      setCreatedCount((prev) => prev + bulkAdded);
      setSuccessToast(`Successfully created ${bulkAdded} flashcards!`);
      setBulkContent('');
      if (closeAfter) {
        setTimeout(onClose, 500);
      }
      return;
    }

    // Standard Flashcard
    if (!standardFront.trim() || !standardBack.trim()) {
      setValidationError('Both Card Front (Question) and Card Back (Answer) are required.');
      return;
    }

    addCard(
      deckId,
      standardFront.trim(),
      standardBack.trim(),
      tags
    );

    sound.playRestore();
    setCreatedCount((prev) => prev + 1);
    setSuccessToast('Flashcard saved successfully!');
    setTimeout(() => setSuccessToast(null), 3000);

    resetFormFields();

    if (closeAfter) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-white">
                Manual Flashcard Creator
              </h3>
              <p className="text-[11px] text-slate-400">
                Author customized active recall 2-sided flashcard sets.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick(450);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successToast}</span>
            </div>
            <span className="font-mono-code font-bold text-[11px] text-emerald-300">
              Total created: {createdCount}
            </span>
          </div>
        )}

        {/* Target Deck Selector / Creator */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Collection Deck</span>
            </label>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsCreatingNewDeck(!isCreatingNewDeck);
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              {isCreatingNewDeck ? 'Select Existing Deck' : '+ New Deck on the fly'}
            </button>
          </div>

          {!isCreatingNewDeck && decks.length > 0 ? (
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
            >
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name} ({deck.cards.length} cards)
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-2 p-2.5 rounded-lg bg-slate-900/90 border border-indigo-500/40 animate-in fade-in">
              <div className="text-[11px] text-indigo-300 font-semibold">Create New Deck Container</div>
              <input
                type="text"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                placeholder="Deck Title (e.g. Molecular Biology Exam Practice)"
                className="w-full p-2 text-xs rounded bg-slate-950 border border-slate-700 text-white focus:outline-hidden focus:border-indigo-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Parent Folder</label>
                  <select
                    value={newDeckFolderId}
                    onChange={(e) => setNewDeckFolderId(e.target.value)}
                    className="w-full p-1.5 text-xs rounded bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="root">Root Library (Top-level)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Color Palette (12 Colors)</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {TWELVE_STANDARD_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setNewDeckColor(col.hex)}
                        title={col.name}
                        className={`w-4 h-4 rounded-full border transition-transform ${
                          newDeckColor === col.hex ? 'scale-125 border-white ring-1 ring-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                sound.playClick(500);
                setIsBulkMode(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                !isBulkMode
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Standard Flashcard</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick(600);
              setIsBulkMode(!isBulkMode);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isBulkMode
                ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-semibold'
                : 'border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {isBulkMode ? 'Bulk Mode: Active' : 'Bulk Fast Creator'}
          </button>
        </div>

        {/* Content Form Area */}
        <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
          {isBulkMode ? (
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Bulk Input (1 Card per line: <span className="font-mono-code text-indigo-400">Front | Back</span>)
              </label>
              <textarea
                value={bulkContent}
                onChange={(e) => setBulkContent(e.target.value)}
                placeholder="What is Mitochondria? | The powerhouse of the cell providing ATP&#10;What is DNA? | Deoxyribonucleic acid carrying genetic instructions&#10;Speed of light | Approximately 300,000 km/s in vacuum"
                rows={7}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono-code focus:outline-hidden focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Tip: Paste multiple Q&A pairs separated by a pipe (|) or dash (-). All cards will be created instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Card Front (Question / Concept / Term) *
                </label>
                <textarea
                  value={standardFront}
                  onChange={(e) => setStandardFront(e.target.value)}
                  placeholder="e.g. What is the difference between supervised and unsupervised learning?"
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Card Back (Answer / Definition / Breakdown) *
                </label>
                <textarea
                  value={standardBack}
                  onChange={(e) => setStandardBack(e.target.value)}
                  placeholder="e.g. Supervised learning utilizes labeled ground-truth pairs (X, Y) to optimize loss, whereas unsupervised learning discovers intrinsic patterns without labels."
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Tags Field */}
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Topic Tags (Comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Biology, Genetics, Exam-Q1"
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            {createdCount > 0 && <span>Created this session: <strong className="text-emerald-400 font-mono-code">{createdCount}</strong></span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            {!isBulkMode && (
              <button
                type="button"
                onClick={() => handleSaveCard(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer border border-slate-700"
              >
                Add & Create Another
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSaveCard(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              {isBulkMode ? 'Import All Cards' : 'Save & Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
