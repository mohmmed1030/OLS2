import React, { useState } from 'react';
import { useDecks } from '../context/DeckContext';
import { Folder, Deck } from '../types/decks';
import { FlashcardStudyModal } from './FlashcardStudyModal';
import { TrashModal } from './TrashModal';
import { sound } from '../utils/sound';
import { 
  FolderPlus, 
  Plus, 
  Folder as FolderIcon, 
  FolderOpen, 
  Layers, 
  ChevronRight, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft,
  MoveRight, 
  BookOpen, 
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Home,
  Download,
  Upload,
  Shuffle,
  Palette,
  LayoutGrid,
  List
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { TWELVE_STANDARD_COLORS } from '../data/standardColors';
import { CustomTestGeneratorModal } from './CustomTestGeneratorModal';
import { ManualCardCreatorModal } from './ManualCardCreatorModal';
import { DelimitedCardImportModal } from './DelimitedCardImportModal';

interface DeckManagerViewProps {
  isTrashOpen?: boolean;
  setIsTrashOpen?: (open: boolean) => void;
  isCsvImportOpen?: boolean;
  setIsCsvImportOpen?: (open: boolean) => void;
}

export const DeckManagerView: React.FC<DeckManagerViewProps> = ({
  isTrashOpen: externalTrashOpen,
  setIsTrashOpen: externalSetTrashOpen,
  isCsvImportOpen: externalCsvImportOpen,
  setIsCsvImportOpen: externalSetCsvImportOpen,
}) => {
  const { username } = useTheme();
  const {
    folders,
    decks,
    trash,
    currentFolderId,
    setCurrentFolderId,
    createFolder,
    renameFolder,
    updateFolderColor,
    deleteFolder,
    createDeck,
    renameDeck,
    updateDeckColor,
    moveDeck,
    deleteDeck,
    exportBackupData,
    importBackupData,
  } = useDecks();

  const [activeStudyDeckId, setActiveStudyDeckId] = useState<string | null>(null);
  const [internalTrashOpen, setInternalTrashOpen] = useState(false);
  const [internalCsvImportOpen, setInternalCsvImportOpen] = useState(false);

  const isTrashOpen = externalTrashOpen !== undefined ? externalTrashOpen : internalTrashOpen;
  const setIsTrashOpen = externalSetTrashOpen || setInternalTrashOpen;

  const isCsvImportOpen = externalCsvImportOpen !== undefined ? externalCsvImportOpen : internalCsvImportOpen;
  const setIsCsvImportOpen = externalSetCsvImportOpen || setInternalCsvImportOpen;

  const [viewMode, setViewMode] = useState<'grid' | 'rows'>(() => {
    return (localStorage.getItem('omega_library_view_mode') as 'grid' | 'rows') || 'grid';
  });

  const [isCustomTestOpen, setIsCustomTestOpen] = useState(false);
  const [isManualCreatorOpen, setIsManualCreatorOpen] = useState(false);
  const [manualCreatorDeckId, setManualCreatorDeckId] = useState<string | null>(null);
  const [csvImportDeckId, setCsvImportDeckId] = useState<string | null>(null);
  const [activeColorPicker, setActiveColorPicker] = useState<{ id: string; type: 'folder' | 'deck' } | null>(null);

  // New Folder Modal / State
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState(TWELVE_STANDARD_COLORS[0].hex);

  // New Deck Modal / State
  const [isNewDeckOpen, setIsNewDeckOpen] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [deckColor, setDeckColor] = useState('#8b5cf6');

  // Rename state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemType, setEditingItemType] = useState<'folder' | 'deck' | null>(null);
  const [editingName, setEditingName] = useState('');

  // Move Deck state
  const [movingDeckId, setMovingDeckId] = useState<string | null>(null);
  const [targetFolderSelection, setTargetFolderSelection] = useState<string>('root');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Filter current hierarchy items
  const currentFolder = folders.find((f) => f.id === currentFolderId);
  const childFolders = folders.filter((f) => f.parentFolderId === currentFolderId);
  const childDecks = decks.filter((d) => d.folderId === currentFolderId);

  // Filtered by search if active
  const filteredFolders = searchQuery.trim()
    ? folders.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : childFolders;

  const filteredDecks = searchQuery.trim()
    ? decks.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : childDecks;

  // Build breadcrumb trail
  const getBreadcrumbs = () => {
    const trail: Folder[] = [];
    let curr = currentFolder;
    while (curr) {
      trail.unshift(curr);
      curr = folders.find((f) => f.id === curr?.parentFolderId);
    }
    return trail;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleOpenFolder = (folderId: string) => {
    sound.playClick(620);
    setCurrentFolderId(folderId);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    createFolder(folderName, currentFolderId, folderColor);
    setFolderName('');
    setIsNewFolderOpen(false);
  };

  const handleCreateDeckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) return;
    createDeck(deckName, deckDesc, currentFolderId, deckColor);
    setDeckName('');
    setDeckDesc('');
    setIsNewDeckOpen(false);
  };

  const startRename = (id: string, name: string, type: 'folder' | 'deck') => {
    sound.playClick(500);
    setEditingItemId(id);
    setEditingItemType(type);
    setEditingName(name);
  };

  const saveRename = () => {
    if (!editingItemId || !editingName.trim()) return;
    if (editingItemType === 'folder') {
      renameFolder(editingItemId, editingName);
    } else if (editingItemType === 'deck') {
      renameDeck(editingItemId, editingName);
    }
    setEditingItemId(null);
    setEditingItemType(null);
  };

  const handleMoveDeckSubmit = () => {
    if (!movingDeckId) return;
    const dest = targetFolderSelection === 'root' ? null : targetFolderSelection;
    moveDeck(movingDeckId, dest);
    setMovingDeckId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {currentFolderId !== null && (
              <button
                onClick={() => {
                  sound.playClick(450);
                  setCurrentFolderId(currentFolder ? currentFolder.parentFolderId : null);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs mr-1"
                title="Back to previous folder level"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick(500);
                setCurrentFolderId(null);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors active:scale-95 cursor-pointer ${
                currentFolderId === null
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Root Library</span>
            </button>

            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={b.id}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  onClick={() => handleOpenFolder(b.id)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors active:scale-95 truncate max-w-[160px] cursor-pointer ${
                    idx === breadcrumbs.length - 1
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {b.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <h1 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            {currentFolder ? (
              <>
                <button
                  onClick={() => {
                    sound.playClick(450);
                    setCurrentFolderId(currentFolder.parentFolderId);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                  title="Go back to previous level"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <FolderOpen className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>{currentFolder.name}</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hello, {username || 'Scholar'}!</span>
              </>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentFolder
              ? 'Organized knowledge collection'
              : 'Welcome back to your Omega Learning Workspace.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* New Folder Button */}
          <button
            onClick={() => {
              sound.playClick(600);
              setIsNewFolderOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>

          {/* Manual Create Flashcards Button */}
          <button
            onClick={() => {
              sound.playClick(650);
              setManualCreatorDeckId(null);
              setIsManualCreatorOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
            title="Create active recall flashcards manually"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create Flashcards</span>
          </button>

          {/* Import CSV / Delimited Plain Text Button (Anki-style) */}
          <button
            onClick={() => {
              sound.playClick(600);
              setCsvImportDeckId(null);
              setIsCsvImportOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
            title="Import flashcards from CSV or plain text with delimiters (Anki-style)"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import CSV / Text</span>
          </button>

          {/* New Deck Button */}
          <button
            onClick={() => {
              sound.playClick(700);
              setIsNewDeckOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Deck</span>
          </button>

          {/* Custom Test Generator Button (Multi-Source, up to 300 Qs) */}
          <button
            onClick={() => {
              sound.playClick(650);
              setIsCustomTestOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
            title="Assemble custom test from multiple sources (max 300 questions)"
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-400" />
            <span>Custom Test</span>
          </button>
        </div>
      </div>

      {/* Search Filter Strip & Layout View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter folders or flashcard decks in library..."
            className="w-full pl-10 pr-10 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Layout View Mode Option: Grid vs Rows */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0 select-none">
          <button
            onClick={() => {
              sound.playClick(500);
              setViewMode('grid');
              localStorage.setItem('omega_library_view_mode', 'grid');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="عرض الشبكة / Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>شبكة (Grid)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick(500);
              setViewMode('rows');
              localStorage.setItem('omega_library_view_mode', 'rows');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'rows'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="قائمة طويلة / Long list view"
          >
            <List className="w-3.5 h-3.5" />
            <span>قائمة طويلة (List)</span>
          </button>
        </div>
      </div>

      {/* 1. Folders Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FolderIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Folders ({filteredFolders.length})</span>
          </div>
          {currentFolder && (
            <span className="text-[11px] text-slate-500">
              Inside: {currentFolder.name}
            </span>
          )}
        </div>

        {filteredFolders.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            No folders in this directory. Click &quot;New Folder&quot; to organize decks hierarchically.
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5" : "flex flex-col space-y-2"}>
            {filteredFolders.map((folder) => {
              const subFolderCount = folders.filter((f) => f.parentFolderId === folder.id).length;
              const subDeckCount = decks.filter((d) => d.folderId === folder.id).length;
              const isRenaming = editingItemId === folder.id && editingItemType === 'folder';

              return (
                <React.Fragment key={folder.id}>
                  {/* Mobile Compact Grid View: Minimized with Name Only */}
                  {viewMode === 'grid' && (
                    <div
                      onClick={() => !isRenaming && handleOpenFolder(folder.id)}
                      className="sm:hidden p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer shadow-xs min-h-[52px]"
                      title={`Open ${folder.name}`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: `${folder.color}25`, color: folder.color }}
                      >
                        <FolderIcon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs text-slate-100 truncate flex-1 leading-tight">
                        {folder.name}
                      </span>
                    </div>
                  )}

                  {/* Standard / Rows Full Layout */}
                  <div
                    className={viewMode === 'grid' 
                      ? "hidden sm:flex p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-md flex-col justify-between group relative"
                      : "p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-md flex flex-col justify-between group relative"
                    }
                  >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      onClick={() => !isRenaming && handleOpenFolder(folder.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 truncate"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: `${folder.color}25`, color: folder.color }}
                      >
                        <FolderIcon className="w-5 h-5" />
                      </div>

                      <div className="truncate flex-1">
                        {isRenaming ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="w-full text-xs p-1 rounded bg-slate-800 border border-indigo-500 text-white focus:outline-hidden"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                            />
                            <button
                              onClick={saveRename}
                              className="px-2 py-1 rounded bg-indigo-600 text-[10px] text-white"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <h3 className="font-semibold text-sm text-slate-100 hover:text-indigo-300 transition-colors truncate">
                            {folder.name}
                          </h3>
                        )}
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {subDeckCount} {subDeckCount === 1 ? 'deck' : 'decks'} · {subFolderCount} sub-folders
                        </div>
                      </div>
                    </div>

                    {/* Manage Menu */}
                    <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity relative">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick(450);
                            setActiveColorPicker(
                              activeColorPicker?.id === folder.id ? null : { id: folder.id, type: 'folder' }
                            );
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Change folder color (12 standard colors)"
                        >
                          <Palette className="w-3.5 h-3.5" style={{ color: folder.color }} />
                        </button>
                        {activeColorPicker?.id === folder.id && activeColorPicker.type === 'folder' && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 z-30 p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl grid grid-cols-4 gap-1.5 w-36 animate-in fade-in"
                          >
                            {TWELVE_STANDARD_COLORS.map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                onClick={() => {
                                  updateFolderColor(folder.id, c.hex);
                                  setActiveColorPicker(null);
                                }}
                                title={c.name}
                                className={`w-6 h-6 rounded-full border transition-transform ${
                                  folder.color === c.hex
                                    ? 'border-white scale-110 shadow-sm'
                                    : 'border-slate-800 hover:scale-105'
                                }`}
                                style={{ backgroundColor: c.hex }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => startRename(folder.id, folder.name, 'folder')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Rename folder"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteFolder(folder.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        title="Delete folder (with Undo)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenFolder(folder.id)}
                    className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    <span>Open Folder</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </React.Fragment>
            );
            })}
          </div>
        )}
      </div>

      {/* 2. Decks Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Card Collections & Decks ({filteredDecks.length})</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Click &quot;Study Deck&quot; to test active recall
          </span>
        </div>

        {filteredDecks.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500 space-y-2">
            <div>No card decks in this location yet.</div>
            <button
              onClick={() => {
                sound.playClick();
                setIsNewDeckOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-medium inline-flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Deck</span>
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4" : "flex flex-col space-y-3"}>
            {filteredDecks.map((deck) => {
              const isRenaming = editingItemId === deck.id && editingItemType === 'deck';
              const mastered = deck.cards.filter((c) => c.mastery === 'mastered').length;
              const learning = deck.cards.filter((c) => c.mastery === 'learning').length;
              const percent = deck.cards.length > 0 ? Math.round((mastered / deck.cards.length) * 100) : 0;

              return (
                <React.Fragment key={deck.id}>
                  {/* Mobile Compact Grid View: Minimized with Name Only */}
                  {viewMode === 'grid' && (
                    <div
                      onClick={() => {
                        sound.playClick(750);
                        setActiveStudyDeckId(deck.id);
                      }}
                      className="sm:hidden p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer shadow-xs min-h-[56px]"
                      title={`Study ${deck.name}`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: deck.color || '#6366f1' }}
                      />
                      <span className="font-semibold text-xs text-white truncate flex-1 leading-tight">
                        {deck.name}
                      </span>
                    </div>
                  )}

                  {/* Standard / Rows Full Layout */}
                  <div
                    className={viewMode === 'grid' 
                      ? "hidden sm:flex p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all hover:shadow-lg flex-col justify-between group relative"
                      : "p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative"
                    }
                  >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: deck.color || '#6366f1' }}
                        />
                        {isRenaming ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="text-xs p-1 rounded bg-slate-800 border border-indigo-500 text-white focus:outline-hidden"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                            />
                            <button
                              onClick={saveRename}
                              className="px-2 py-0.5 rounded bg-indigo-600 text-[10px] text-white"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <h3 className="font-semibold text-sm text-white truncate">
                            {deck.name}
                          </h3>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity relative">
                        {/* 12 Standard Colors Picker */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playClick(450);
                              setActiveColorPicker(
                                activeColorPicker?.id === deck.id ? null : { id: deck.id, type: 'deck' }
                              );
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Change file/deck color (12 standard colors)"
                          >
                            <Palette className="w-3.5 h-3.5" style={{ color: deck.color }} />
                          </button>
                          {activeColorPicker?.id === deck.id && activeColorPicker.type === 'deck' && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 z-30 p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl grid grid-cols-4 gap-1.5 w-36 animate-in fade-in"
                            >
                              {TWELVE_STANDARD_COLORS.map((c) => (
                                <button
                                  key={c.hex}
                                  type="button"
                                  onClick={() => {
                                    updateDeckColor(deck.id, c.hex);
                                    setActiveColorPicker(null);
                                  }}
                                  title={c.name}
                                  className={`w-6 h-6 rounded-full border transition-transform ${
                                    deck.color === c.hex
                                      ? 'border-white scale-110 shadow-sm'
                                      : 'border-slate-800 hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Add Card to this deck */}
                        <button
                          onClick={() => {
                            sound.playClick(600);
                            setManualCreatorDeckId(deck.id);
                            setIsManualCreatorOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                          title="Create new question or card in this deck"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Import CSV directly into this deck */}
                        <button
                          onClick={() => {
                            sound.playClick(550);
                            setCsvImportDeckId(deck.id);
                            setIsCsvImportOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                          title="Import CSV or delimited text into this deck"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            sound.playClick(500);
                            setMovingDeckId(deck.id);
                            setTargetFolderSelection(deck.folderId || 'root');
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Move deck to another folder"
                        >
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startRename(deck.id, deck.name, 'deck')}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Rename deck"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDeck(deck.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete deck (with Undo)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {deck.description || 'No description provided.'}
                    </p>

                    {/* Mastery Stats Bar */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{deck.cards.length} Flashcards</span>
                        <span className="text-emerald-400 font-medium font-mono-code">
                          {percent}% Mastered
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                        <div
                          className="bg-amber-500 transition-all duration-300"
                          style={{
                            width: `${
                              deck.cards.length > 0 ? (learning / deck.cards.length) * 100 : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Primary Study CTA */}
                  <button
                    onClick={() => {
                      sound.playClick(750);
                      setActiveStudyDeckId(deck.id);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Study Deck ({deck.cards.length} cards)</span>
                  </button>
                </div>
              </React.Fragment>
            );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Folder */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateFolderSubmit}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-400" />
                <span>Create New Folder</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewFolderOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Folder Name</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g. Cognitive Systems & Neuroscience"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Parent Location</label>
              <div className="text-xs text-slate-400 p-2 rounded-lg bg-slate-950 border border-slate-800">
                {currentFolder ? `Inside: ${currentFolder.name}` : 'Root Library (Top-level)'}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Color Accent (12 Standard Colors)</label>
              <div className="grid grid-cols-6 gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                {TWELVE_STANDARD_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setFolderColor(c.hex)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      folderColor === c.hex
                        ? 'scale-110 border-white shadow-md ring-2 ring-indigo-500/50'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {folderColor === c.hex && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewFolderOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold active:scale-95"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New Deck */}
      {isNewDeckOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateDeckSubmit}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create New Card Deck</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewDeckOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Deck Title</label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="e.g. Asymptotic Complexity & Tree Balances"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Description</label>
              <textarea
                value={deckDesc}
                onChange={(e) => setDeckDesc(e.target.value)}
                placeholder="Brief summary of concepts in this collection..."
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Parent Folder</label>
              <div className="text-xs text-slate-400 p-2 rounded-lg bg-slate-950 border border-slate-800">
                {currentFolder ? `Inside: ${currentFolder.name}` : 'Root Library (Top-level)'}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Color Badge (12 Standard Colors)</label>
              <div className="grid grid-cols-6 gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                {TWELVE_STANDARD_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setDeckColor(c.hex)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      deckColor === c.hex
                        ? 'scale-110 border-white shadow-md ring-2 ring-indigo-500/50'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {deckColor === c.hex && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewDeckOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold active:scale-95"
              >
                Create Deck
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Move Deck */}
      {movingDeckId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
              <MoveRight className="w-4 h-4 text-indigo-400" />
              <span>Move Deck to Folder</span>
            </h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1.5 font-medium">Select Target Destination</label>
              <select
                value={targetFolderSelection}
                onChange={(e) => setTargetFolderSelection(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="root">Root Library (No parent folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setMovingDeckId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveDeckSubmit}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold active:scale-95"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Question & Flashcard Creator Modal */}
      <ManualCardCreatorModal
        isOpen={isManualCreatorOpen}
        onClose={() => {
          setIsManualCreatorOpen(false);
          setManualCreatorDeckId(null);
        }}
        initialDeckId={manualCreatorDeckId}
      />

      {/* Interactive Flashcard Study Session Modal */}
      {activeStudyDeckId && (
        <FlashcardStudyModal
          deckId={activeStudyDeckId}
          onClose={() => setActiveStudyDeckId(null)}
        />
      )}

      {/* Trash Recovery Archive Modal */}
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
      />

      {/* Multi-Source Custom Test Assembly Modal (Max 300 Qs) */}
      <CustomTestGeneratorModal
        isOpen={isCustomTestOpen}
        onClose={() => setIsCustomTestOpen(false)}
      />

      {/* Anki-style CSV & Delimited Plain Text Card Import Modal */}
      <DelimitedCardImportModal
        isOpen={isCsvImportOpen}
        onClose={() => {
          setIsCsvImportOpen(false);
          setCsvImportDeckId(null);
        }}
        preselectedDeckId={csvImportDeckId}
      />
    </div>
  );
};
