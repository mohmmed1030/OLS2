import React, { useState, useMemo } from 'react';
import { useDecks } from '../context/DeckContext';
import { Flashcard, Deck } from '../types/decks';
import { sound } from '../utils/sound';
import { 
  X, 
  Sparkles, 
  Shuffle, 
  Layers, 
  Folder as FolderIcon, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  Trophy, 
  Sliders, 
  Check, 
  Play, 
  Save, 
  HelpCircle,
  FileText,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';

interface CustomTestGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestQuestionItem extends Flashcard {
  sourceOrigin: string;
}

export const CustomTestGeneratorModal: React.FC<CustomTestGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { decks, folders, testScores, recordTestScore, createDeck, addCard } = useDecks();

  // Selected Sources State
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [selectedTestScoreIds, setSelectedTestScoreIds] = useState<string[]>([]);

  // Active Tab in source selector: 'decks' | 'files' | 'tests'
  const [activeSourceTab, setActiveSourceTab] = useState<'decks' | 'files' | 'tests'>('decks');

  // Sampling configuration (Capped at 300 as strictly required)
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(25);
  const [distributionMode, setDistributionMode] = useState<'balanced' | 'random'>('balanced');

  // Interactive Test Session Running State
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testQuestions, setTestQuestions] = useState<TestQuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  // Score tracking
  const [testCorrectCount, setTestCorrectCount] = useState(0);
  const [testIncorrectCount, setTestIncorrectCount] = useState(0);
  const [answeredResults, setAnsweredResults] = useState<{ questionId: string; wasCorrect: boolean }[]>([]);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [savedToDeckSuccess, setSavedToDeckSuccess] = useState(false);

  // Auto-reveal timer inside custom test
  const [autoTimerEnabled, setAutoTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(10);

  // Collect pool of available cards across selected sources
  const sourcePoolData = useMemo(() => {
    const pool: { sourceLabel: string; cards: Flashcard[] }[] = [];

    // 1. Selected Flashcard Decks
    selectedDeckIds.forEach((deckId) => {
      const d = decks.find((item) => item.id === deckId);
      if (d && d.cards.length > 0) {
        pool.push({
          sourceLabel: `Deck: ${d.name}`,
          cards: d.cards,
        });
      }
    });

    // 2. Selected Files / Folders (pulls all decks inside that folder)
    selectedFolderIds.forEach((folderId) => {
      const f = folders.find((item) => item.id === folderId);
      if (f) {
        const folderDecks = decks.filter((d) => d.folderId === folderId);
        folderDecks.forEach((d) => {
          if (d.cards.length > 0) {
            pool.push({
              sourceLabel: `Folder: ${f.name} / ${d.name}`,
              cards: d.cards,
            });
          }
        });
      }
    });

    // 3. Selected Previous Tests (pulls from tested deck)
    selectedTestScoreIds.forEach((testId) => {
      const t = testScores.find((item) => item.id === testId);
      if (t) {
        const d = decks.find((deck) => deck.id === t.deckId);
        if (d && d.cards.length > 0) {
          pool.push({
            sourceLabel: `Test (${new Date(t.timestamp).toLocaleDateString()} · ${t.scoreOutOfTen}/10): ${t.deckName}`,
            cards: d.cards,
          });
        }
      }
    });

    const totalAvailableQuestions = pool.reduce((acc, curr) => acc + curr.cards.length, 0);

    return {
      sources: pool,
      totalAvailable: totalAvailableQuestions,
    };
  }, [selectedDeckIds, selectedFolderIds, selectedTestScoreIds, decks, folders, testScores]);

  if (!isOpen) return null;

  // Toggle helpers
  const toggleDeck = (id: string) => {
    sound.playClick(500);
    setSelectedDeckIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleFolder = (id: string) => {
    sound.playClick(500);
    setSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleTestScore = (id: string) => {
    sound.playClick(500);
    setSelectedTestScoreIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const selectAllDecks = () => {
    sound.playClick(550);
    setSelectedDeckIds(decks.map((d) => d.id));
  };

  const clearAllSelections = () => {
    sound.playDelete();
    setSelectedDeckIds([]);
    setSelectedFolderIds([]);
    setSelectedTestScoreIds([]);
  };

  // Purely client-side random sampling algorithm (No AI required)
  const handleGenerateTest = () => {
    if (sourcePoolData.sources.length === 0 || sourcePoolData.totalAvailable === 0) {
      sound.playDelete();
      return;
    }

    sound.playRestore();

    // Cap question count strictly at 300 maximum
    const maxAllowed = Math.min(300, Math.max(1, targetQuestionCount));
    const finalLimit = Math.min(maxAllowed, sourcePoolData.totalAvailable);

    let sampled: TestQuestionItem[] = [];

    if (distributionMode === 'balanced' && sourcePoolData.sources.length > 0) {
      const perSourceQuota = Math.max(1, Math.floor(finalLimit / sourcePoolData.sources.length));
      const leftovers: TestQuestionItem[] = [];

      sourcePoolData.sources.forEach((src) => {
        // Shuffle source cards
        const shuffled = [...src.cards].sort(() => Math.random() - 0.5);
        const taken = shuffled.slice(0, perSourceQuota).map((c) => ({
          ...c,
          sourceOrigin: src.sourceLabel,
        }));
        sampled.push(...taken);

        // Store remainder in case quota wasn't met
        const rest = shuffled.slice(perSourceQuota).map((c) => ({
          ...c,
          sourceOrigin: src.sourceLabel,
        }));
        leftovers.push(...rest);
      });

      // If we need more to reach finalLimit, pull from leftovers
      if (sampled.length < finalLimit && leftovers.length > 0) {
        const remainingNeeded = finalLimit - sampled.length;
        const extra = leftovers.sort(() => Math.random() - 0.5).slice(0, remainingNeeded);
        sampled.push(...extra);
      }
    } else {
      // Complete random draw
      const allItems: TestQuestionItem[] = [];
      sourcePoolData.sources.forEach((src) => {
        src.cards.forEach((c) => {
          allItems.push({
            ...c,
            sourceOrigin: src.sourceLabel,
          });
        });
      });
      sampled = allItems.sort(() => Math.random() - 0.5);
    }

    // Deduplicate by card front text so questions aren't duplicated
    const seen = new Set<string>();
    const deduplicated: TestQuestionItem[] = [];
    for (const card of sampled) {
      const key = card.front.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(card);
      }
      if (deduplicated.length >= finalLimit) break;
    }

    // Final shuffle
    const randomized = deduplicated.sort(() => Math.random() - 0.5).slice(0, finalLimit);

    setTestQuestions(randomized);
    setCurrentQuestionIndex(0);
    setIsAnswerRevealed(false);
    setSelectedOptionIndex(null);
    setTestCorrectCount(0);
    setTestIncorrectCount(0);
    setAnsweredResults([]);
    setIsTestFinished(false);
    setSavedToDeckSuccess(false);
    setIsTestRunning(true);
  };

  // Answering inside Test
  const currentQ = testQuestions[currentQuestionIndex];

  const handleScoreQuestion = (knewIt: boolean) => {
    if (!currentQ) return;
    sound.playClick(knewIt ? 840 : 380);

    const updatedCorrect = testCorrectCount + (knewIt ? 1 : 0);
    const updatedIncorrect = testIncorrectCount + (knewIt ? 0 : 1);
    if (knewIt) setTestCorrectCount(updatedCorrect);
    else setTestIncorrectCount(updatedIncorrect);

    setAnsweredResults((prev) => [
      ...prev,
      { questionId: currentQ.id, wasCorrect: knewIt },
    ]);

    setIsAnswerRevealed(false);
    setSelectedOptionIndex(null);

    if (currentQuestionIndex + 1 < testQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Test finished! Record score into history
      sound.playRestore();
      setIsTestFinished(true);

      const totalQ = testQuestions.length;
      recordTestScore(
        'multi-source-test',
        `Multi-Source Exam (${totalQ} Qs)`,
        updatedCorrect,
        totalQ,
        'multi_source_test'
      );
    }
  };



  // Save Test as new permanent Deck
  const handleSaveAsDeck = () => {
    sound.playClick(700);
    const newDeck = createDeck(
      `Custom Assembled Exam (${testQuestions.length} Qs)`,
      `Multi-source exam randomly drawn from ${sourcePoolData.sources.length} sources on ${new Date().toLocaleDateString()}.`,
      null,
      '#ec4899',
      'manual'
    );

    testQuestions.forEach((q) => {
      addCard(
        newDeck.id,
        q.front,
        q.back,
        [...q.tags, 'CustomExam']
      );
    });

    setSavedToDeckSuccess(true);
    sound.playRestore();
  };

  const currentScoreRatio = testQuestions.length > 0 
    ? (testCorrectCount / Math.max(1, testCorrectCount + testIncorrectCount)) * 10
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.15)',
        }}
      >
        {/* Modal Top Bar */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-xs">
              <Shuffle className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  Algorithmic Test Assembly Engine
                </span>
                <span className="text-[10px] font-mono-code px-2 py-0.2 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  Max 300 Qs · No AI Needed
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                {isTestRunning ? 'Multi-Source Custom Exam Runner' : 'Multi-Source Test Generator'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 flex-1 overflow-y-auto space-y-6">
          {!isTestRunning ? (
            /* CONFIGURATION & SOURCE SELECTION VIEW */
            <div className="space-y-6">
              {/* Introduction banner */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white">
                    Simultaneous Multi-Source Pulling:
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    Select any combination of previous test logs, flashcard sets, and files/folders. 
                    The system will randomly sample questions across all chosen sources up to your custom limit (max 300 questions).
                  </p>
                </div>
              </div>

              {/* Source Category Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveSourceTab('decks')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeSourceTab === 'decks'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Flashcard Sets ({decks.length})</span>
                    {selectedDeckIds.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                        {selectedDeckIds.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSourceTab('files')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeSourceTab === 'files'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FolderIcon className="w-3.5 h-3.5" />
                    <span>Files & Folders ({folders.length})</span>
                    {selectedFolderIds.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                        {selectedFolderIds.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSourceTab('tests')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeSourceTab === 'tests'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Previous Tests ({testScores.length})</span>
                    {selectedTestScoreIds.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                        {selectedTestScoreIds.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllDecks}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded hover:bg-slate-800"
                  >
                    Select All Decks
                  </button>
                  <button
                    type="button"
                    onClick={clearAllSelections}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-slate-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Source Items Selector Body */}
              <div className="min-h-[220px] max-h-[300px] overflow-y-auto pr-1">
                {/* 1. Decks Tab */}
                {activeSourceTab === 'decks' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {decks.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-xs text-slate-500">
                        No flashcard sets found. Create or generate some decks first!
                      </div>
                    ) : (
                      decks.map((deck) => {
                        const isChecked = selectedDeckIds.includes(deck.id);
                        return (
                          <div
                            key={deck.id}
                            onClick={() => toggleDeck(deck.id)}
                            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              isChecked
                                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-xs'
                                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                  isChecked
                                    ? 'bg-indigo-600 border-indigo-400 text-white'
                                    : 'border-slate-700 bg-slate-900'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                              <div className="truncate">
                                <div className="font-semibold text-white truncate">{deck.name}</div>
                                <div className="text-[11px] text-slate-500">
                                  {deck.cards.length} cards · {deck.source === 'import' ? 'Imported' : 'Manual'}
                                </div>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono-code text-indigo-400 shrink-0 ml-2">
                              {deck.cards.length} Qs
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* 2. Files & Folders Tab */}
                {activeSourceTab === 'files' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {folders.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-xs text-slate-500">
                        No folders found in your library.
                      </div>
                    ) : (
                      folders.map((folder) => {
                        const isChecked = selectedFolderIds.includes(folder.id);
                        const folderDecks = decks.filter((d) => d.folderId === folder.id);
                        const cardCountInFolder = folderDecks.reduce((sum, d) => sum + d.cards.length, 0);

                        return (
                          <div
                            key={folder.id}
                            onClick={() => toggleFolder(folder.id)}
                            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              isChecked
                                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-xs'
                                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                  isChecked
                                    ? 'bg-indigo-600 border-indigo-400 text-white'
                                    : 'border-slate-700 bg-slate-900'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                              <div className="truncate">
                                <div className="font-semibold text-white truncate">{folder.name}</div>
                                <div className="text-[11px] text-slate-500">
                                  Folder bundle · {folderDecks.length} deck(s)
                                </div>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono-code text-indigo-400 shrink-0 ml-2">
                              {cardCountInFolder} Qs
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* 3. Previous Tests Tab */}
                {activeSourceTab === 'tests' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {testScores.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-xs text-slate-500">
                        No previous test score logs found yet. Complete a quiz to see prior tests!
                      </div>
                    ) : (
                      testScores.map((score) => {
                        const isChecked = selectedTestScoreIds.includes(score.id);
                        return (
                          <div
                            key={score.id}
                            onClick={() => toggleTestScore(score.id)}
                            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              isChecked
                                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-xs'
                                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                  isChecked
                                    ? 'bg-indigo-600 border-indigo-400 text-white'
                                    : 'border-slate-700 bg-slate-900'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                              <div className="truncate">
                                <div className="font-semibold text-white truncate">{score.deckName}</div>
                                <div className="text-[11px] text-slate-500">
                                  Score: {score.scoreOutOfTen}/10 ({score.grade}) · {new Date(score.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono-code text-indigo-400 shrink-0 ml-2">
                              {score.totalCards} Qs
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Selection Summary Pill */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Total Selected Sources:</span>
                  <span className="font-bold text-white font-mono-code">
                    {selectedDeckIds.length + selectedFolderIds.length + selectedTestScoreIds.length} Sources
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Total Available Question Pool:</span>
                  <span className="font-bold text-indigo-400 font-mono-code">
                    {sourcePoolData.totalAvailable} Questions
                  </span>
                </div>
              </div>

              {/* Question Count Limit (Strictly Capped at 300) */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-white">
                      Target Test Questions Limit (Capped at 300 max)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={targetQuestionCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setTargetQuestionCount(Math.min(300, Math.max(1, val)));
                      }}
                      className="w-20 p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono-code font-bold text-center text-indigo-400"
                    />
                    <span className="text-xs text-slate-400">/ 300 Max</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={Math.min(300, Math.max(10, sourcePoolData.totalAvailable || 300))}
                  value={targetQuestionCount}
                  onChange={(e) => setTargetQuestionCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">Presets:</span>
                  {[10, 25, 50, 100, 200, 300].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        sound.playClick(500);
                        setTargetQuestionCount(Math.min(300, num));
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono-code transition-colors ${
                        targetQuestionCount === num
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>

                {/* Sampling Distribution Strategy */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick(500);
                      setDistributionMode('balanced');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                      distributionMode === 'balanced'
                        ? 'bg-indigo-600/25 border-indigo-500 text-white font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>⚖️ Balanced Sampling</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      Pulls an equal quota of random questions from each selected source
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick(500);
                      setDistributionMode('random');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                      distributionMode === 'random'
                        ? 'bg-indigo-600/25 border-indigo-500 text-white font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>🎲 Uniform Random Draw</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      Merges all available questions and pulls randomly across the pool
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                type="button"
                disabled={sourcePoolData.totalAvailable === 0}
                onClick={handleGenerateTest}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-40 cursor-pointer"
              >
                <Shuffle className="w-4 h-4 text-amber-300" />
                <span>
                  Synthesize Custom Test ({Math.min(targetQuestionCount, sourcePoolData.totalAvailable || 0)} Questions)
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ) : isTestFinished ? (
            /* TEST FINISHED SCREEN */
            <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-200 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                  Custom Exam Completed!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sampled across {sourcePoolData.sources.length} distinct sources with random draw.
                </p>
              </div>

              {/* Score Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Score (out of 10)</div>
                  <div className="text-2xl font-bold font-mono-code text-amber-400 mt-1">
                    {currentScoreRatio.toFixed(1)} / 10
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Correct</div>
                  <div className="text-2xl font-bold font-mono-code text-emerald-400 mt-1">
                    {testCorrectCount}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Errors</div>
                  <div className="text-2xl font-bold font-mono-code text-rose-400 mt-1">
                    {testIncorrectCount}
                  </div>
                </div>
              </div>

              {/* Save As New Permanent Deck */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {!savedToDeckSuccess ? (
                  <button
                    type="button"
                    onClick={handleSaveAsDeck}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4 text-indigo-400" />
                    <span>Save Exam as Permanent Deck</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved to your library!</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsTestRunning(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Configure Another Test</span>
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* ACTIVE TEST RUNNING VIEW */
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Progress & Origin Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2 font-mono-code">
                  <span className="font-bold text-white text-sm">
                    Question {currentQuestionIndex + 1} of {testQuestions.length}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 truncate max-w-[260px]">
                    {currentQ.sourceOrigin}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono-code text-[11px]">
                  <span className="text-emerald-400">✓ {testCorrectCount}</span>
                  <span className="text-rose-400">✗ {testIncorrectCount}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200"
                  style={{
                    width: `${((currentQuestionIndex + 1) / testQuestions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Interactive Question Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 space-y-5 shadow-xl">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-indigo-400">
                    Flashcard Question
                  </span>
                  <span className="text-slate-500 font-mono-code">
                    {currentQ.tags.join(', ')}
                  </span>
                </div>

                {/* Question Prompt */}
                <h3 className="text-base sm:text-lg font-display font-semibold text-white leading-relaxed text-center sm:text-left">
                  {currentQ.front}
                </h3>

                {/* Toggle Reveal Answer Button */}
                {!isAnswerRevealed && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playFlip();
                        setIsAnswerRevealed(true);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Reveal Answer & Explanation</span>
                    </button>
                  </div>
                )}

                {/* Answer & Explanation Box */}
                {isAnswerRevealed && (
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 animate-in fade-in duration-200">
                    <div className="font-semibold text-emerald-400 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Correct Answer & Synaptic Explanation</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {currentQ.back}
                    </p>
                  </div>
                )}
              </div>

              {/* Scoring Controls: Incorrect / Correct */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleScoreQuestion(false)}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500 active:scale-95 text-slate-200 hover:text-rose-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span>I Got It Wrong (Incorrect)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleScoreQuestion(true)}
                  className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-emerald-600 border border-indigo-500 hover:border-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 group shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                  <span>I Knew It (Correct)</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
