import React, { useState } from 'react';
import { useDecks } from '../context/DeckContext';
import { TestScoreRecord } from '../types/decks';
import { sound } from '../utils/sound';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  FolderPlus,
  Layers, 
  Clock, 
  RotateCcw, 
  Trophy, 
  Flame, 
  Search, 
  Calendar, 
  Target, 
  ShieldCheck, 
  Play, 
  Trash2,
  ChevronRight,
  Filter,
  Shuffle,
  Activity
} from 'lucide-react';
import { CustomTestGeneratorModal } from './CustomTestGeneratorModal';

export const AnalyticsDashboardView: React.FC = () => {
  const { decks, analytics, testScores, recordTestScore, clearTestHistory, resetAllAnalytics } = useDecks();

  const [filterType, setFilterType] = useState<'all' | 'high' | 'review'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTestDeckId, setQuickTestDeckId] = useState<string | null>(null);

  // Reset confirmation modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isCustomTestModalOpen, setIsCustomTestModalOpen] = useState(false);

  // Quick Diagnostic Quiz Modal State
  const [quizCardIndex, setQuizCardIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFlipped, setQuizFlipped] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [latestRecordedScore, setLatestRecordedScore] = useState<number | null>(null);

  // Live Clock state for Phase 7
  const [liveClock, setLiveClock] = useState('');

  React.useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLiveClock(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter test history logs
  const filteredScores = testScores.filter((record) => {
    const matchesSearch = record.deckName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'high') {
      return record.scoreOutOfTen >= 8.0;
    }
    if (filterType === 'review') {
      return record.scoreOutOfTen < 8.0;
    }
    return true;
  });

  // Calculate overall accuracy percentage (0% if no answered cards yet)
  const overallAccuracy = analytics.totalCardsAnswered > 0
    ? Math.round((analytics.totalCorrect / analytics.totalCardsAnswered) * 100)
    : 0;

  // Week-over-Week Calculation (Current Week vs. Previous Week)
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const currentWeekStart = now - oneWeekMs;
  const previousWeekStart = now - 2 * oneWeekMs;

  const currentWeekScores = testScores.filter((s) => s.timestamp >= currentWeekStart);
  const previousWeekScores = testScores.filter(
    (s) => s.timestamp >= previousWeekStart && s.timestamp < currentWeekStart
  );

  const currentWeekTestsCount = currentWeekScores.length;
  const previousWeekTestsCount = previousWeekScores.length;

  const currentWeekQuestions = currentWeekScores.reduce(
    (acc, s) => acc + (s.totalCards || (s.correctCount + s.incorrectCount)),
    0
  );
  const previousWeekQuestions = previousWeekScores.reduce(
    (acc, s) => acc + (s.totalCards || (s.correctCount + s.incorrectCount)),
    0
  );

  const currentWeekCorrect = currentWeekScores.reduce((acc, s) => acc + s.correctCount, 0);
  const previousWeekCorrect = previousWeekScores.reduce((acc, s) => acc + s.correctCount, 0);

  const currentWeekAccuracy = currentWeekQuestions > 0
    ? Math.round((currentWeekCorrect / currentWeekQuestions) * 100)
    : (currentWeekTestsCount > 0
      ? Math.round((currentWeekScores.reduce((a, s) => a + s.scoreOutOfTen, 0) / currentWeekTestsCount) * 10)
      : (analytics.totalCardsAnswered > 0 ? overallAccuracy : 0));

  const previousWeekAccuracy = previousWeekQuestions > 0
    ? Math.round((previousWeekCorrect / previousWeekQuestions) * 100)
    : (previousWeekTestsCount > 0
      ? Math.round((previousWeekScores.reduce((a, s) => a + s.scoreOutOfTen, 0) / previousWeekTestsCount) * 10)
      : 0);

  const currentAvgScore = currentWeekTestsCount > 0
    ? (currentWeekScores.reduce((acc, s) => acc + s.scoreOutOfTen, 0) / currentWeekTestsCount).toFixed(1)
    : (analytics.totalCardsAnswered > 0 ? ((overallAccuracy / 100) * 10).toFixed(1) : '0.0');

  const previousAvgScore = previousWeekTestsCount > 0
    ? (previousWeekScores.reduce((acc, s) => acc + s.scoreOutOfTen, 0) / previousWeekTestsCount).toFixed(1)
    : '0.0';

  const accuracyDelta = currentWeekAccuracy - previousWeekAccuracy;
  const testsDelta = currentWeekTestsCount - previousWeekTestsCount;
  const questionsDelta = currentWeekQuestions - previousWeekQuestions;
  const avgScoreDelta = (parseFloat(currentAvgScore) - parseFloat(previousAvgScore)).toFixed(1);

  // Format precise timestamp (down to the second)
  const formatPreciseTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const datePart = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return `${datePart} at ${timePart}`;
  };

  // Format relative timestamp
  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Confirm Reset Execution
  const handleConfirmReset = () => {
    resetAllAnalytics();
    setIsResetModalOpen(false);
  };

  // Quick Diagnostic test launcher
  const startQuickTest = (deckId: string) => {
    sound.playClick(680);
    setQuickTestDeckId(deckId);
    setQuizCardIndex(0);
    setQuizScore(0);
    setQuizFlipped(false);
    setQuizComplete(false);
    setLatestRecordedScore(null);
  };

  const currentQuizDeck = decks.find((d) => d.id === quickTestDeckId);
  const quizCards = currentQuizDeck ? currentQuizDeck.cards.slice(0, 10) : [];
  const currentCard = quizCards[quizCardIndex];

  const handleQuizAnswer = (knewIt: boolean) => {
    sound.playClick(knewIt ? 840 : 380);
    const updatedScore = quizScore + (knewIt ? 1 : 0);
    if (knewIt) setQuizScore(updatedScore);

    setQuizFlipped(false);

    if (quizCardIndex + 1 < quizCards.length) {
      setQuizCardIndex((prev) => prev + 1);
    } else {
      // Quiz finished - record score out of 10!
      sound.playRestore();
      setQuizComplete(true);
      const totalQuestions = Math.max(1, quizCards.length);
      const scoreOutOfTen = Math.round((updatedScore / totalQuestions) * 10 * 10) / 10;
      setLatestRecordedScore(scoreOutOfTen);

      if (currentQuizDeck) {
        recordTestScore(
          currentQuizDeck.id,
          currentQuizDeck.name,
          updatedScore,
          totalQuestions,
          'quick_test'
        );
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Empirical Cognitive Analytics</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono-code font-bold">Phase 7 (v1.0)</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-mono-code text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{liveClock || 'Live'}</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Analytics & Synaptic Test Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time tracking of recall errors, correct answers, cognitive improvement rate, 
            AI vs. manual file generation, and verified test scores evaluated out of 10.0.
          </p>
        </div>

        {/* Action Controls: Reset Button & Diagnostic Test */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              sound.playClick(500);
              setIsResetModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Reset all statistics to zero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Statistics</span>
          </button>

          {decks.length > 0 && (
            <button
              onClick={() => startQuickTest(decks[0].id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Diagnostic Quiz</span>
            </button>
          )}

          {/* Multi-Source Custom Test Assembly Button (Max 300 Qs) */}
          <button
            onClick={() => {
              sound.playClick(650);
              setIsCustomTestModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 hover:text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Assemble custom test from multiple sources (max 300 questions)"
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-400" />
            <span>Assemble Multi-Source Test</span>
          </button>
        </div>
      </div>

      {/* 1. Core Analytics Dashboard Grid (All 7 Required Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Correct Answers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Correct Answers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold font-mono-code text-emerald-400">
            {analytics.totalCorrect}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
            <span className="font-semibold text-emerald-300">{overallAccuracy}%</span>
            <span>synaptic accuracy</span>
          </div>
        </div>

        {/* Metric 2: Errors Logged */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Errors Logged</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold font-mono-code text-rose-400">
            {analytics.totalErrors}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
            <span className="font-semibold text-rose-300">
              {analytics.totalCardsAnswered > 0
                ? Math.round((analytics.totalErrors / analytics.totalCardsAnswered) * 100)
                : 0}%
            </span>
            <span>weak-point queue active</span>
          </div>
        </div>

        {/* Metric 3: Improvement Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Improvement Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold font-mono-code text-indigo-400 flex items-center gap-1">
            <span>+{analytics.improvementRate}%</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
            <span className="text-indigo-300 font-semibold">Recall trajectory</span>
            <span>vs baseline</span>
          </div>
        </div>

        {/* Metric 4: Total Cards Answered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Answered</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold font-mono-code text-amber-400">
            {analytics.totalCardsAnswered}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
            <span>Study & diagnostic trials</span>
          </div>
        </div>

      </div>

      {/* File & Card Synthesis Distribution Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Metric 5: Cards Due for Spaced Repetition Review */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Due for Review
            </div>
            <div className="text-lg font-bold font-mono-code text-indigo-400">
              {analytics.cardsDueForReviewCount || 0} {analytics.cardsDueForReviewCount === 1 ? 'Card' : 'Cards'}
            </div>
            <div className="text-[10px] text-slate-500">Spaced repetition schedule</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Metric 6: Manual & Imported Files */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Imported / Created Decks
            </div>
            <div className="text-lg font-bold font-mono-code text-cyan-400">
              {analytics.manualCreatedFilesCount} {analytics.manualCreatedFilesCount === 1 ? 'Deck' : 'Decks'}
            </div>
            <div className="text-[10px] text-slate-500">Local offline deck library</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Metric 7: Total Cards Produced */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Cards Produced
            </div>
            <div className="text-lg font-bold font-mono-code text-white">
              {analytics.totalCardsProduced} Active Cards
            </div>
            <div className="text-[10px] text-slate-500">Across all folders & collections</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
            <Layers className="w-5 h-5 text-slate-300" />
          </div>
        </div>

      </div>

      {/* 2. Week-Over-Week Progress Comparison (Current Week vs Previous Week) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white tracking-tight flex items-center gap-2">
                <span>Weekly Trajectory: Current Week vs. Previous Week</span>
                {accuracyDelta > 0 ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    +{accuracyDelta}% Growth
                  </span>
                ) : accuracyDelta < 0 ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/40 flex items-center gap-0.5">
                    <ArrowDownRight className="w-3 h-3 text-rose-400" />
                    {accuracyDelta}% Trend
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-0.5">
                    <Minus className="w-3 h-3 text-slate-400" />
                    Baseline Steady
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparing synaptic retention, tests taken, and accuracy between the last 7 days and the prior 7 days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-code">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-300">Current Week</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-slate-400">Previous Week</span>
            </div>
          </div>
        </div>

        {/* Comparative Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Accuracy Tile */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="text-[11px] text-slate-400 font-medium">Synaptic Accuracy</div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-bold font-mono-code text-white">
                {currentWeekAccuracy}%
              </div>
              <div className="text-xs text-slate-500 font-mono-code">
                was {previousWeekAccuracy}%
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, currentWeekAccuracy)}%` }} />
            </div>
          </div>

          {/* Average Score / 10 Tile */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="text-[11px] text-slate-400 font-medium">Avg Score / 10.0</div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-bold font-mono-code text-amber-400">
                {currentAvgScore}
              </div>
              <div className="text-xs text-slate-500 font-mono-code">
                was {previousAvgScore}
              </div>
            </div>
            <div className="text-[11px] flex items-center gap-1">
              {parseFloat(avgScoreDelta) >= 0 ? (
                <span className="text-emerald-400 font-mono-code font-semibold">+{avgScoreDelta} pts</span>
              ) : (
                <span className="text-rose-400 font-mono-code font-semibold">{avgScoreDelta} pts</span>
              )}
              <span className="text-slate-500">score trajectory</span>
            </div>
          </div>

          {/* Evaluated Tests Count */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="text-[11px] text-slate-400 font-medium">Tests Completed</div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-bold font-mono-code text-emerald-400">
                {currentWeekTestsCount} <span className="text-xs text-slate-400 font-normal">tests</span>
              </div>
              <div className="text-xs text-slate-500 font-mono-code">
                was {previousWeekTestsCount}
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              {testsDelta >= 0 ? `+${testsDelta} tests vs prev week` : `${testsDelta} tests vs prev week`}
            </div>
          </div>

          {/* Questions Solved */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="text-[11px] text-slate-400 font-medium">Questions Solved</div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-bold font-mono-code text-cyan-400">
                {currentWeekQuestions} <span className="text-xs text-slate-400 font-normal">Qs</span>
              </div>
              <div className="text-xs text-slate-500 font-mono-code">
                was {previousWeekQuestions}
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              {questionsDelta >= 0 ? `+${questionsDelta} questions delta` : `${questionsDelta} questions delta`}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Test History & Score Log */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 shadow-xl">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="font-display font-bold text-base sm:text-lg text-white tracking-tight">
                Verified Test History & Score Log
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log recording recent quiz scores out of 10.0 with microsecond timestamps.
            </p>
          </div>

          {/* Action buttons & clear history */}
          <div className="flex items-center gap-2">
            {testScores.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear test history log? Lifetime analytics totals will remain safe.')) {
                    clearTestHistory();
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Segmented Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Segmented Filter Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => {
                sound.playClick(500);
                setFilterType('all');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Tests ({testScores.length})
            </button>

            <button
              onClick={() => {
                sound.playClick(500);
                setFilterType('high');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterType === 'high'
                  ? 'bg-slate-800 text-emerald-400 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mastery (≥ 8.0/10)
            </button>

            <button
              onClick={() => {
                sound.playClick(500);
                setFilterType('review');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterType === 'review'
                  ? 'bg-slate-800 text-amber-400 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Review Needed (&lt; 8.0/10)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests by subject..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Test Score Log Feed */}
        <div className="space-y-2.5">
          {filteredScores.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Trophy className="w-8 h-8 mx-auto text-slate-600" />
              <div className="text-sm font-medium">No quiz logs match current filter</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complete any flashcard study session or run a Quick 10-Point Diagnostic to automatically log evaluated test scores.
              </p>
            </div>
          ) : (
            filteredScores.map((scoreItem) => {
              const isHigh = scoreItem.scoreOutOfTen >= 8.0;
              const isPerfect = scoreItem.scoreOutOfTen === 10.0;

              return (
                <div
                  key={scoreItem.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  {/* Left: Deck and Timestamp Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {scoreItem.deckName}
                      </span>
                      {scoreItem.mode === 'weak_points' && (
                        <span className="text-[10px] text-rose-300 font-mono-code">
                          Weak Points Drill
                        </span>
                      )}
                      {scoreItem.mode === 'quick_test' && (
                        <span className="text-[10px] text-cyan-300 font-mono-code">
                          Quick Diagnostic
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono-code">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formatPreciseTimestamp(scoreItem.timestamp)}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">
                        ({formatRelativeTime(scoreItem.timestamp)})
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400">
                        {scoreItem.correctCount} Correct
                      </span>
                      <span>/</span>
                      <span className="text-rose-400">
                        {scoreItem.incorrectCount} Errors
                      </span>
                    </div>
                  </div>

                  {/* Right: Score out of 10 & Grade */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        Score / 10.0
                      </div>
                      <div className={`text-xl font-bold font-mono-code ${
                        isPerfect
                          ? 'text-amber-400'
                          : isHigh
                          ? 'text-emerald-400'
                          : 'text-amber-300'
                      }`}>
                        {scoreItem.scoreOutOfTen.toFixed(1)} <span className="text-xs text-slate-500">/ 10</span>
                      </div>
                    </div>

                    {/* Grade indicator */}
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold font-mono-code text-sm ${
                      scoreItem.grade === 'A+' || scoreItem.grade === 'A'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : scoreItem.grade === 'B'
                        ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                        : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    }`}>
                      {scoreItem.grade}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick 10-Question Diagnostic Modal */}
      {quickTestDeckId && currentQuizDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm text-white font-display">
                  10-Point Diagnostic Check
                </h3>
              </div>
              <button
                onClick={() => setQuickTestDeckId(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Quiz Content */}
            {!quizComplete && currentCard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono-code">
                  <span>Question {quizCardIndex + 1} of {quizCards.length}</span>
                  <span className="text-emerald-400">{quizScore} Correct so far</span>
                </div>

                {/* Question Flip Card */}
                <div
                  onClick={() => {
                    sound.playFlip();
                    setQuizFlipped(!quizFlipped);
                  }}
                  className="min-h-[160px] p-6 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center cursor-pointer hover:border-indigo-500/60 transition-colors select-none"
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                    {quizFlipped ? 'Answer / Verification' : 'Question (Tap to Reveal)'}
                  </div>
                  <p className={`text-sm ${quizFlipped ? 'text-emerald-300 font-medium' : 'text-white font-semibold'}`}>
                    {quizFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>

                {/* Answer Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleQuizAnswer(false)}
                    className="py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs border border-rose-500/30 transition-all cursor-pointer"
                  >
                    ✗ Incorrect (Missed It)
                  </button>
                  <button
                    onClick={() => handleQuizAnswer(true)}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    ✓ Correct (Knew It)
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-white">Diagnostic Complete!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your official evaluation score has been recorded into the Test History log.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-xs mx-auto">
                  <div className="text-xs text-slate-400 uppercase">Official Score</div>
                  <div className="text-2xl font-bold font-mono-code text-amber-400 mt-0.5">
                    {latestRecordedScore !== null ? latestRecordedScore.toFixed(1) : 10.0} / 10.0
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {quizScore} out of {quizCards.length} correct
                  </div>
                </div>

                <button
                  onClick={() => setQuickTestDeckId(null)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  View In History Log
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Reset Confirmation Modal ("Are you sure?") */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 text-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Reset Statistics</h3>
                <p className="text-xs text-slate-400">Database & History Action</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <p className="text-sm font-semibold text-rose-300">
                Are you sure?
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                This will reset all answered cards, correct tallies, errors, and test history logs back to zero.
                Your flashcards and folders will remain intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick(450);
                  setIsResetModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playDelete();
                  handleConfirmReset();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Yes, Reset All Statistics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Source Custom Test Assembly Modal (Max 300 Qs) */}
      <CustomTestGeneratorModal
        isOpen={isCustomTestModalOpen}
        onClose={() => setIsCustomTestModalOpen(false)}
      />
    </div>
  );
};
