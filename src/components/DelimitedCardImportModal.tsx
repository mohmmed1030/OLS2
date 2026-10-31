import React, { useState, useMemo, useRef } from 'react';
import { useDecks } from '../context/DeckContext';
import { sound } from '../utils/sound';
import { TWELVE_STANDARD_COLORS } from '../data/standardColors';
import { 
  parseDelimitedFlashcards, 
  DelimiterType 
} from '../utils/csvParser';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  HelpCircle, 
  Palette,
  FolderOpen,
  Sparkles,
  FileCheck
} from 'lucide-react';

interface DelimitedCardImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDeckId?: string | null;
}

const SAMPLE_DATA = `# Sample Anki-style notes (Front ; Back ; Tags)
Mitochondria ; The powerhouse of the eukaryotic cell producing ATP through respiration ; biology cell
Photosynthesis ; Process converting light energy into chemical energy in chloroplasts ; biology botany
Ohm's Law ; V = I * R where V is voltage, I is current, and R is resistance ; physics electricity
CRISPR-Cas9 ; Molecular biology tool for targeted genome editing ; genetics biotechnology`;

export const DelimitedCardImportModal: React.FC<DelimitedCardImportModalProps> = ({
  isOpen,
  onClose,
  preselectedDeckId,
}) => {
  const { decks, folders, createDeck, addCard } = useDecks();

  const [rawText, setRawText] = useState<string>('');
  const [delimiterPreference, setDelimiterPreference] = useState<DelimiterType>('auto');
  const [fileName, setFileName] = useState<string | null>(null);

  // Destination options
  const [destinationType, setDestinationType] = useState<'new' | 'existing'>(
    preselectedDeckId ? 'existing' : 'new'
  );
  const [targetDeckId, setTargetDeckId] = useState<string>(
    preselectedDeckId || (decks[0]?.id ?? '')
  );
  const [newDeckTitle, setNewDeckTitle] = useState<string>('');
  const [targetFolderId, setTargetFolderId] = useState<string>('root');
  const [deckColor, setDeckColor] = useState<string>(TWELVE_STANDARD_COLORS[0].hex);

  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse cards live whenever rawText or delimiterPreference changes
  const parseResult = useMemo(() => {
    return parseDelimitedFlashcards(rawText, delimiterPreference);
  }, [rawText, delimiterPreference]);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    sound.playClick(600);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawText(content || '');

      // Suggest deck name from filename if creating a new deck
      if (!newDeckTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        setNewDeckTitle(`${capitalized} (Imported)`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    sound.playClick(500);
    setRawText(SAMPLE_DATA);
    setFileName('Sample-Biology-Notes.txt');
    if (!newDeckTitle.trim()) {
      setNewDeckTitle('Cellular Biology & Physics');
    }
  };

  const handleExecuteImport = () => {
    const validCards = parseResult.cards.filter((c) => c.isValid);
    if (validCards.length === 0) {
      sound.playDelete();
      return;
    }

    sound.playClick(750);
    let finalDeckId = targetDeckId;

    if (destinationType === 'new') {
      const title = newDeckTitle.trim() || `Imported Deck (${new Date().toLocaleDateString()})`;
      const folder = targetFolderId === 'root' ? null : targetFolderId;
      const created = createDeck(
        title,
        `Imported ${validCards.length} flashcards from delimited notes/CSV.`,
        folder,
        deckColor,
        'manual'
      );
      finalDeckId = created.id;
    }

    // Add each valid card into the target deck
    validCards.forEach((c) => {
      addCard(
        finalDeckId,
        c.front,
        c.back,
        c.tags.length > 0 ? c.tags : ['Imported']
      );
    });

    sound.playRestore();
    setImportSuccessCount(validCards.length);

    setTimeout(() => {
      setImportSuccessCount(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Import CSV / Delimited Plain Text</span>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-normal">
                  Anki-Compatible
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Convert CSV files or plain text notes with delimiters (comma, semicolon, colon, or tab) into flashcards. Zero API usage.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick(400);
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Success Banner */}
          {importSuccessCount !== null && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 flex items-center gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs sm:text-sm font-semibold">
                Successfully imported {importSuccessCount} flashcards! Opening deck...
              </div>
            </div>
          )}

          {/* Section 1: Input Area (File Drop + Raw Text Area) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <span>Source Text or File</span>
                <span className="text-slate-400 font-normal">
                  (Side 1 [delim] Side 2 [optional delim tags])
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                >
                  Insert Sample Notes
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{fileName ? 'Change File' : 'Upload CSV / TXT'}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  accept=".csv,.txt,.tsv,.text"
                  className="hidden"
                />
              </div>
            </div>

            {/* Drag & Drop Overlay or Textarea */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative"
            >
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setFileName(null);
                }}
                placeholder="Paste your flashcard notes here, or drag & drop a .csv or .txt file...&#10;&#10;Examples:&#10;Mitochondria; Powerhouse of the cell; biology&#10;DNA: Deoxyribonucleic acid: genetics&#10;E = mc^2, Energy equals mass times speed of light squared, physics"
                rows={7}
                className="w-full p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-indigo-500 transition-colors leading-relaxed"
              />

              {fileName && (
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
              <span>Lines separated by newline. Quotes (&quot;) supported for multi-line or comma-containing terms.</span>
              <span className="font-mono-code">{rawText.length} characters</span>
            </div>
          </div>

          {/* Section 2: Custom Text Box Separator Symbol & Quick Presets */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span>Front & Back Separator Symbol</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Symbol distinguishing Front from Back)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Active separator in parser:{' '}
                  <span className="font-mono-code text-indigo-400 font-bold">
                    {parseResult.detectedDelimiter === '\t' ? 'TAB (\\t)' : `"${parseResult.detectedDelimiter}"`}
                  </span>
                </p>
              </div>

              {/* Custom Text Box Input for Separator Symbol */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-300 font-medium shrink-0">Custom Symbol:</label>
                <input
                  type="text"
                  value={delimiterPreference === 'auto' ? '' : delimiterPreference}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDelimiterPreference(val ? val : 'auto');
                  }}
                  placeholder="e.g. . or : or ; or =>"
                  className="w-28 p-2 rounded-xl bg-slate-900 border border-indigo-500/60 text-xs text-white font-mono font-bold text-center focus:outline-hidden focus:border-indigo-400"
                />
                {delimiterPreference !== 'auto' && (
                  <button
                    type="button"
                    onClick={() => setDelimiterPreference('auto')}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
            </div>

            {/* Quick Separator Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 mr-1">Quick Presets:</span>
              {[
                { label: 'Auto-Detect', value: 'auto' },
                { label: 'Period (.)', value: '.' },
                { label: 'Colon (:)', value: ':' },
                { label: 'Semicolon (;)', value: ';' },
                { label: 'Comma (,)', value: ',' },
                { label: 'Dash (-)', value: '-' },
                { label: 'Tab (\\t)', value: '\t' },
                { label: 'Pipe (|)', value: '|' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    sound.playClick(500);
                    setDelimiterPreference(item.value);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    delimiterPreference === item.value
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Live Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <span>Parsed Cards Live Preview</span>
                <span className="font-mono-code text-indigo-400 font-bold">
                  ({parseResult.validCount} Valid)
                </span>
              </span>

              {parseResult.invalidCount > 0 && (
                <span className="text-[11px] text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{parseResult.invalidCount} rows require a delimiter</span>
                </span>
              )}
            </div>

            {parseResult.cards.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Paste notes or upload a file above to preview parsed flashcards here.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3 w-12 text-center">#</th>
                      <th className="py-2 px-3 w-5/12">Side 1 (Front)</th>
                      <th className="py-2 px-3 w-5/12">Side 2 (Back)</th>
                      <th className="py-2 px-3 w-2/12">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {parseResult.cards.map((c, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-slate-800/30 transition-colors ${
                          !c.isValid ? 'bg-amber-950/20 text-amber-200' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center font-mono-code text-slate-500 text-[10px]">
                          {c.lineNumber}
                        </td>
                        <td className="py-2 px-3 font-medium text-white break-words">
                          {c.front || (
                            <span className="text-rose-400 italic font-mono text-[11px]">
                              [Missing Front]
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-300 break-words">
                          {c.back || (
                            <span className="text-amber-400 italic font-mono text-[11px]">
                              {c.error || '[Missing Back]'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {c.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {c.tags.map((t, idx) => (
                                <span key={idx} className="text-indigo-400">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Target Deck Selection */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Destination Deck Placement</span>
              </span>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick(500);
                    setDestinationType('new');
                  }}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    destinationType === 'new'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✨ Create New Deck
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick(500);
                    setDestinationType('existing');
                  }}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    destinationType === 'existing'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📚 Existing Deck
                </button>
              </div>
            </div>

            {destinationType === 'new' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">New Deck Name</label>
                  <input
                    type="text"
                    value={newDeckTitle}
                    onChange={(e) => setNewDeckTitle(e.target.value)}
                    placeholder="e.g. Molecular Biology (Anki Import)"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Folder Location</label>
                  <select
                    value={targetFolderId}
                    onChange={(e) => setTargetFolderId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="root">Root Library (Top Level)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 12-Color Palette Selector */}
                <div className="sm:col-span-2 space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Deck Color Tag (12 Standard Colors)</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {TWELVE_STANDARD_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          sound.playClick(450);
                          setDeckColor(c.hex);
                        }}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        className={`w-6 h-6 rounded-lg transition-transform cursor-pointer ${
                          deckColor === c.hex
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="text-xs font-medium text-slate-300">Select Existing Deck</label>
                <select
                  value={targetDeckId}
                  onChange={(e) => setTargetDeckId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      📚 {d.name} ({d.cards.length} cards)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            {parseResult.validCount > 0 ? (
              <span className="text-emerald-400 font-medium">
                {parseResult.validCount} flashcards ready for import
              </span>
            ) : (
              <span>Add notes above with a delimiter to import</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick(400);
                onClose();
              }}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={parseResult.validCount === 0 || importSuccessCount !== null}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {parseResult.validCount} Flashcards</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
