import React, { useState, useEffect, useRef } from 'react';
import { Deck, Flashcard } from '../types/decks';
import { useDecks } from '../context/DeckContext';
import { sound } from '../utils/sound';
import { 
  X, 
  RotateCw, 
  Check, 
  RotateCcw, 
  Clock, 
  Timer, 
  Sparkles, 
  Shuffle, 
  Trophy, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Sliders,
  ChevronRight,
  Flame
} from 'lucide-react';

interface FlashcardStudyModalProps {
  deckId: string;
  onClose: () => void;
}

export const FlashcardStudyModal: React.FC<FlashcardStudyModalProps> = ({ deckId, onClose }) => {
  const { decks, recordCardReview, rateSpacedCard, recordTestScore } = useDecks();
  const deck = decks.find((d) => d.id === deckId);

  // Offline status detection
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Study Queue Initialization:
  // Prioritize cards that were previously marked as weak points or incorrect!
  const getPrioritizedQueue = (initialCards: Flashcard[]): Flashcard[] => {
    const weakCards = initialCards.filter((c) => c.weakPoint || c.lastReviewResult === 'incorrect');
    const normalCards = initialCards.filter((c) => !c.weakPoint && c.lastReviewResult !== 'incorrect');
    return [...weakCards, ...normalCards];
  };

  const [queue, setQueue] = useState<Flashcard[]>(() => {
    return deck ? getPrioritizedQueue(deck.cards) : [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  // Statistics for the current session
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectList, setIncorrectList] = useState<Flashcard[]>([]);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [weakPointReinforcement, setWeakPointReinforcement] = useState(false);
  const [sessionScoreOutOfTen, setSessionScoreOutOfTen] = useState<number | null>(null);

  // Auto-Reveal Timer State (Configurable up to 20 seconds)
  const [autoRevealEnabled, setAutoRevealEnabled] = useState<boolean>(() => {
    return localStorage.getItem('omega_auto_reveal') === 'true';
  });
  const [timerDuration, setTimerDuration] = useState<number>(() => {
    const saved = localStorage.getItem('omega_timer_duration');
    return saved ? Math.min(20, Math.max(2, parseInt(saved))) : 8; // Default 8s, max 20s
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(timerDuration);
  const [timerPaused, setTimerPaused] = useState(false);

  // Touch swipe handling for mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const currentCard: Flashcard | undefined = queue[currentIndex];

  // Auto-reveal timer effect
  useEffect(() => {
    if (!autoRevealEnabled || isFlipped || sessionFinished || timerPaused || !currentCard) {
      return;
    }

    setTimeRemaining(timerDuration);
    const interval = 100; // 100ms precision

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0.1) {
          clearInterval(timer);
          sound.playFlip();
          setIsFlipped(true); // Automatically flip card to reveal answer!
          return 0;
        }
        return Math.max(0, parseFloat((prev - 0.1).toFixed(1)));
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoRevealEnabled, isFlipped, currentIndex, sessionFinished, timerPaused, timerDuration, currentCard]);

  if (!deck) return null;

  const handleFlip = () => {
    sound.playFlip();
    setIsFlipped(!isFlipped);
  };

  // Spaced Repetition interval calculation helper
  const getIntervalPreview = (card: Flashcard, rating: 'very_easy' | 'easy' | 'medium' | 'hard'): string => {
    const prevInterval = card.interval || 0;
    const prevEase = card.easeFactor || 2.5;
    const prevReps = card.repetitions || 0;

    let days = 1;
    if (rating === 'hard') {
      days = 1;
    } else if (rating === 'medium') {
      days = prevReps === 0 ? 1 : prevReps === 1 ? 3 : Math.max(1, Math.round(prevInterval * prevEase));
    } else if (rating === 'easy') {
      days = prevReps === 0 ? 3 : prevReps === 1 ? 6 : Math.max(1, Math.round(prevInterval * prevEase * 1.3));
    } else if (rating === 'very_easy') {
      days = prevReps === 0 ? 7 : prevReps === 1 ? 14 : Math.max(1, Math.round(prevInterval * prevEase * 1.8));
    }

    return days === 1 ? '1d' : `${days}d`;
  };

  const handleSpacedRating = (rating: 'very_easy' | 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;
    rateSpacedCard(deck.id, currentCard.id, rating);

    if (rating === 'hard') {
      setIncorrectList((prev) => {
        if (prev.some((c) => c.id === currentCard.id)) return prev;
        return [...prev, currentCard];
      });
      setQueue((prev) => [...prev, currentCard]); // Re-queue hard cards for review!
      proceedNext(false);
    } else {
      setCorrectCount((prev) => prev + 1);
      proceedNext(true);
    }
  };

  // User knew it: Correct!
  const handleAnswerCorrect = () => {
    if (!currentCard) return;
    recordCardReview(deck.id, currentCard.id, 'correct');
    setCorrectCount((prev) => prev + 1);
    proceedNext(true);
  };

  // User got it wrong: Incorrect! System prioritizes and queues for repeat!
  const handleAnswerIncorrect = () => {
    if (!currentCard) return;
    recordCardReview(deck.id, currentCard.id, 'incorrect');
    
    // Save to incorrect list for this session
    setIncorrectList((prev) => {
      if (prev.some((c) => c.id === currentCard.id)) return prev;
      return [...prev, currentCard];
    });

    // Re-queue card to repeat later in this session so user masters their weak points!
    setQueue((prev) => [...prev, currentCard]);

    proceedNext(false);
  };

  const proceedNext = (lastWasCorrect?: boolean) => {
    setIsFlipped(false);
    setSelectedOption(null);
    setTimeRemaining(timerDuration);

    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session complete
      sound.playRestore();
      setSessionFinished(true);

      const finalCorrect = correctCount + (lastWasCorrect === true ? 1 : 0);
      const totalEvaluated = Math.max(1, finalCorrect + incorrectList.length + (lastWasCorrect === false ? 1 : 0));
      const scoreTen = Math.round((finalCorrect / totalEvaluated) * 10 * 10) / 10;
      setSessionScoreOutOfTen(scoreTen);

      recordTestScore(
        deck.id,
        deck.name,
        finalCorrect,
        totalEvaluated,
        weakPointReinforcement ? 'weak_points' : 'standard'
      );
    }
  };


  const restartFullSession = () => {
    sound.playClick(600);
    const refreshed = getPrioritizedQueue(deck.cards);
    setQueue(refreshed);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedOption(null);
    setCorrectCount(0);
    setIncorrectList([]);
    setSessionFinished(false);
    setWeakPointReinforcement(false);
  };

  const practiceWeakPointsOnly = () => {
    sound.playClick(700);
    if (incorrectList.length === 0) return;
    setQueue([...incorrectList]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedOption(null);
    setCorrectCount(0);
    setIncorrectList([]);
    setSessionFinished(false);
    setWeakPointReinforcement(true);
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    // Swipe right threshold (> 70px) = Correct
    if (diff > 70) {
      handleAnswerCorrect();
    }
    // Swipe left threshold (< -70px) = Incorrect
    else if (diff < -70) {
      handleAnswerIncorrect();
    }
    setTouchStartX(null);
  };

  const timerPercent = (timeRemaining / timerDuration) * 100;
  const initialCardsCount = deck.cards.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col h-[94vh] sm:h-auto sm:max-h-[92vh] relative select-none">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 truncate">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: deck.color || '#6366f1' }}
            />
            <div className="truncate">
              <h3 className="font-display font-semibold text-sm sm:text-base text-white truncate">
                {deck.name}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                {weakPointReinforcement ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span>Weak Points Drill</span>
                  </span>
                ) : (
                  <span>Standard Study Session</span>
                )}
                <span aria-hidden="true">·</span>
                <span>{queue.length} in Queue</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Offline indicator */}
            {!isOnline ? (
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            ) : (
              <span className="hidden sm:flex px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 items-center gap-1">
                <Wifi className="w-3 h-3" />
                <span>Local Ready</span>
              </span>
            )}

            {/* Sound toggle */}
            <button
              onClick={() => {
                sound.enabled = !soundEnabled;
                setSoundEnabled(!soundEnabled);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle audio feedback"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auto-Reveal Timer Toolbar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 ${autoRevealEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span className="font-medium">Auto-Reveal Answer:</span>
            <button
              onClick={() => {
                const next = !autoRevealEnabled;
                setAutoRevealEnabled(next);
                localStorage.setItem('omega_auto_reveal', String(next));
                setTimeRemaining(timerDuration);
              }}
              className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-colors ${
                autoRevealEnabled
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {autoRevealEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Configurable Duration Selector (up to 20 seconds maximum) */}
          {autoRevealEnabled && (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <span className="text-[11px] text-slate-400">Flip After:</span>
              <select
                value={timerDuration}
                onChange={(e) => {
                  const val = Math.min(20, Math.max(2, parseInt(e.target.value)));
                  setTimerDuration(val);
                  setTimeRemaining(val);
                  localStorage.setItem('omega_timer_duration', String(val));
                }}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-hidden"
              >
                <option value={3}>3 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={8}>8 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={20}>20 seconds (Max)</option>
              </select>
            </div>
          )}

          {/* Score Counter */}
          <div className="flex items-center gap-3 text-[11px] font-mono-code">
            <span className="text-emerald-400">✓ {correctCount} Correct</span>
            <span className="text-rose-400">✗ {incorrectList.length} To Review</span>
          </div>
        </div>

        {/* Live Auto-Reveal Progress Bar */}
        {autoRevealEnabled && !isFlipped && !sessionFinished && (
          <div className="h-1 w-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col justify-between space-y-4">
          
          {/* 1. Session Complete View */}
          {sessionFinished ? (
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>

              <div>
                <h4 className="font-display text-2xl font-bold text-white tracking-tight">
                  Study Session Completed!
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Every card in this deck was actively challenged. Incorrect items were repeated to reinforce synaptic recall.
                </p>
              </div>

              {/* Performance Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Score (out of 10)</div>
                  <div className="text-xl font-bold font-mono-code text-amber-400 mt-1">
                    {sessionScoreOutOfTen !== null ? sessionScoreOutOfTen.toFixed(1) : '10.0'} / 10
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Correct (Knew it)</div>
                  <div className="text-xl font-bold font-mono-code text-emerald-400 mt-1">
                    {correctCount}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Weak Points</div>
                  <div className="text-xl font-bold font-mono-code text-rose-400 mt-1">
                    {incorrectList.length}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Accuracy</div>
                  <div className="text-xl font-bold font-mono-code text-indigo-400 mt-1">
                    {Math.round((correctCount / Math.max(1, correctCount + incorrectList.length)) * 100)}%
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-emerald-400 font-mono-code flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Official score out of 10.0 logged to Analytics Test History</span>
              </div>


              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                {incorrectList.length > 0 && (
                  <button
                    onClick={practiceWeakPointsOnly}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-600/25"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Practice Only {incorrectList.length} Incorrect Cards</span>
                  </button>
                )}
                <button
                  onClick={restartFullSession}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Restart Full Deck</span>
                </button>
              </div>
            </div>
          ) : currentCard ? (
            <div className="space-y-4">
              {/* Header meta */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2 font-mono-code">
                  <span className="font-bold text-white">
                    Card {currentIndex + 1} of {queue.length}
                  </span>
                  {currentCard.weakPoint && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/70 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Weak Point</span>
                    </span>
                  )}
                </div>

                {autoRevealEnabled && !isFlipped && (
                  <div className="flex items-center gap-1.5 text-indigo-400 font-mono-code text-xs">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-flipping in {timeRemaining}s</span>
                  </div>
                )}
              </div>

              {/* 3D Flip Card with Touch Gestures */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={handleFlip}
                className="relative min-h-[250px] sm:min-h-[280px] cursor-pointer rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 p-6 sm:p-8 shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-indigo-500/60 active:scale-[0.99] group"
              >
                {/* State Tag */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-indigo-400">
                    {isFlipped ? 'Answer / Solution' : 'Question / Concept'}
                  </span>
                  <span className="flex items-center gap-1 group-hover:text-slate-200 transition-colors">
                    <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="hidden sm:inline">Tap card or space to flip</span>
                    <span className="sm:hidden">Tap to flip</span>
                  </span>
                </div>

                {/* Card Text Content */}
                <div className="py-4 text-center animate-in fade-in duration-200 space-y-4">
                  <p className="text-base sm:text-lg font-display font-semibold text-white leading-relaxed">
                    {currentCard.front}
                  </p>

                  {/* Explanation (when revealed) */}
                  {isFlipped && (
                    <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-left text-xs space-y-1 animate-in fade-in duration-200">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Answer & Explanation</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                        {currentCard.back}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags and mobile hint */}
                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-800/80 text-slate-400">
                  <div className="flex flex-wrap gap-1.5">
                    {currentCard.tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="hidden sm:inline text-slate-500">
                    {isFlipped ? 'Rate difficulty below' : 'Think of your answer before flipping'}
                  </span>
                </div>
              </div>

              {/* 4 Spaced Repetition Rating Buttons */}
              <div className="pt-2 space-y-2">
                {!isFlipped ? (
                  <button
                    onClick={handleFlip}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Show Answer / Flip Card</span>
                  </button>
                ) : (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <div className="text-[11px] text-slate-400 font-medium text-center">
                      Rate recall difficulty to schedule next review:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Hard */}
                      <button
                        onClick={() => handleSpacedRating('hard')}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-rose-950/70 border border-rose-500/50 active:scale-95 text-rose-200 text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 shadow-sm cursor-pointer group"
                      >
                        <span className="font-bold flex items-center gap-1 text-rose-400">
                          <span>Hard</span>
                          <span className="text-[10px] opacity-80 font-mono-code">
                            ({getIntervalPreview(currentCard, 'hard')})
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Re-queue today</span>
                      </button>

                      {/* Medium */}
                      <button
                        onClick={() => handleSpacedRating('medium')}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-amber-950/70 border border-amber-500/50 active:scale-95 text-amber-200 text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 shadow-sm cursor-pointer group"
                      >
                        <span className="font-bold flex items-center gap-1 text-amber-400">
                          <span>Medium</span>
                          <span className="text-[10px] opacity-80 font-mono-code">
                            ({getIntervalPreview(currentCard, 'medium')})
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Standard recall</span>
                      </button>

                      {/* Easy */}
                      <button
                        onClick={() => handleSpacedRating('easy')}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-indigo-950/70 border border-indigo-500/50 active:scale-95 text-indigo-200 text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 shadow-sm cursor-pointer group"
                      >
                        <span className="font-bold flex items-center gap-1 text-indigo-300">
                          <span>Easy</span>
                          <span className="text-[10px] opacity-80 font-mono-code">
                            ({getIntervalPreview(currentCard, 'easy')})
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Good recall</span>
                      </button>

                      {/* Very Easy */}
                      <button
                        onClick={() => handleSpacedRating('very_easy')}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-emerald-950/70 border border-emerald-500/50 active:scale-95 text-emerald-200 text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 shadow-sm cursor-pointer group"
                      >
                        <span className="font-bold flex items-center gap-1 text-emerald-400">
                          <span>Very Easy</span>
                          <span className="text-[10px] opacity-80 font-mono-code">
                            ({getIntervalPreview(currentCard, 'very_easy')})
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Perfect recall</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile swipe helper */}
              <div className="sm:hidden text-center text-[10px] text-slate-500 pt-1">
                Tip: Swipe Left for Hard · Swipe Right for Easy
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};
