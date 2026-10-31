import React, { useState, useEffect, useRef } from 'react';
import { AtomLogo } from './AtomLogo';
import { ThemeControls } from './ThemeControls';
import { useDecks } from '../context/DeckContext';
import { sound } from '../utils/sound';
import { 
  FolderTree, 
  BarChart3,
  Clock,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  HardDriveDownload,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenTrash: () => void;
  onOpenCsvImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  onTabChange, 
  onOpenTrash,
  onOpenCsvImport
}) => {
  const { trash, exportBackupData, importBackupData } = useDecks();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
        setIsExportImportOpen(false);
      }
    };
    if (isExportImportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as any);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [isExportImportOpen]);

  const handleNavClick = (tab: string) => {
    sound.playClick(580);
    onTabChange(tab);
  };

  const renderExportImportDropdown = (isMobile = false) => (
    <div className="relative" ref={isMobile ? mobileDropdownRef : dropdownRef}>
      <button
        onClick={() => {
          sound.playClick(500);
          setIsExportImportOpen(!isExportImportOpen);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
          isExportImportOpen
            ? 'bg-slate-800 border-cyan-500 text-cyan-300 shadow-md'
            : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
        title="Export & Import Options"
      >
        <HardDriveDownload className="w-4 h-4 text-cyan-400" />
        {!isMobile && <span>Export / Import</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${isExportImportOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'}`} />
      </button>

      {isExportImportOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl backdrop-blur-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 mb-1">
            Data Backup & Transfer
          </div>

          {/* Export JSON Backup */}
          <button
            onClick={() => {
              sound.playClick(600);
              setIsExportImportOpen(false);
              exportBackupData();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <div className="font-semibold">Export Backup (JSON)</div>
              <div className="text-[10px] text-slate-400">Download full library snapshot</div>
            </div>
          </button>

          {/* Import JSON Backup */}
          <label className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <div className="font-semibold">Import Backup (JSON)</div>
              <div className="text-[10px] text-slate-400">Restore from local JSON file</div>
            </div>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const content = ev.target?.result as string;
                  if (content) {
                    const res = importBackupData(content);
                    alert(res.message);
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
                setIsExportImportOpen(false);
              }}
            />
          </label>

          {/* Import CSV / Plain Text */}
          <button
            onClick={() => {
              sound.playClick(600);
              setIsExportImportOpen(false);
              onOpenCsvImport();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
            <div>
              <div className="font-semibold">Import CSV / Text</div>
              <div className="text-[10px] text-slate-400">Convert cards with custom delimiter</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 transition-colors w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Zone 1: Brand Wordmark with Atom Nucleus Logo & Preferences */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div
            onClick={() => handleNavClick('library')}
            className="flex items-center gap-2.5 cursor-pointer select-none active:scale-98 transition-transform"
            title="OMEGA LEARNING SYSTEM (OLS)"
          >
            <AtomLogo size={36} interactive={true} />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white whitespace-nowrap leading-none">
                  OLS
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-slate-300 whitespace-nowrap leading-none">
                  Omega Learning System
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono-code mt-0.5">
                <span className="text-emerald-400 font-semibold">v1.0</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-slate-500" />
                  <span>{currentTime || 'Syncing...'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Preferences Sub-Menu */}
          <div className="shrink-0 pl-1 sm:pl-2 border-l border-slate-800/80">
            <ThemeControls />
          </div>
        </div>

        {/* Zone 2: Desktop Navigation with Export/Import Dropdown & Trash Icon */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-slate-300">
          
          {/* Export / Import Dropdown (Positioned to the left of Library) */}
          {renderExportImportDropdown(false)}

          {/* Library Button */}
          <button
            onClick={() => handleNavClick('library')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 cursor-pointer py-1 ${
              activeTab === 'library'
                ? 'text-white border-b-2 border-indigo-500 pb-0.5 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Library & Decks</span>
          </button>

          {/* Spaced Repetition & Analytics Section */}
          <button
            onClick={() => handleNavClick('analytics')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 cursor-pointer py-1 ${
              activeTab === 'analytics'
                ? 'text-white border-b-2 border-indigo-500 pb-0.5 font-semibold'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Spaced Repetition & Analytics</span>
          </button>

          {/* Trash Can Icon (Positioned to the right of Analytics) */}
          <button
            onClick={() => {
              sound.playClick(500);
              onOpenTrash();
            }}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-rose-400 hover:text-rose-300 transition-all cursor-pointer active:scale-95 relative"
            title="Trash & Recovery Archive"
            aria-label="Trash Archive"
          >
            <Trash2 className="w-4 h-4" />
            {trash.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {trash.length}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Creation Mode Badge */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono-code text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
          <span className="text-slate-500">System Mode:</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-bold">100% Offline Local</span>
        </div>
      </div>

      {/* Mobile Top Navigation Row */}
      <nav aria-label="Mobile Navigation" className="md:hidden flex items-center justify-around py-2 px-2 border-t border-slate-800/80 bg-slate-950/60">
        
        {/* Mobile Export / Import Dropdown */}
        {renderExportImportDropdown(true)}

        {/* Mobile Library */}
        <button
          onClick={() => handleNavClick('library')}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'library'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Library</span>
        </button>

        {/* Mobile Analytics */}
        <button
          onClick={() => handleNavClick('analytics')}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Analytics</span>
        </button>

        {/* Mobile Trash Can Icon */}
        <button
          onClick={() => {
            sound.playClick(500);
            onOpenTrash();
          }}
          className="p-1.5 rounded-lg bg-slate-900 text-rose-400 border border-slate-800 text-xs font-medium cursor-pointer relative"
          title="Trash Archive"
        >
          <Trash2 className="w-4 h-4" />
          {trash.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {trash.length}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
};
