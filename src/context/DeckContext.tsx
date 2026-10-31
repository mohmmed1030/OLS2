import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Deck, 
  Flashcard, 
  Folder, 
  MasteryStatus, 
  TrashItem, 
  TestScoreRecord, 
  AnalyticsSummary,
  QuestionType,
  SpacedRating
} from '../types/decks';
import { sound } from '../utils/sound';
import { safeStorage } from '../utils/storage';

interface UndoToast {
  id: string;
  message: string;
  item: TrashItem;
}

interface DeckContextType {
  folders: Folder[];
  decks: Deck[];
  trash: TrashItem[];
  testScores: TestScoreRecord[];
  currentFolderId: string | null;
  activeDeckId: string | null;
  undoToast: UndoToast | null;
  analytics: AnalyticsSummary;

  setCurrentFolderId: (id: string | null) => void;
  setActiveDeckId: (id: string | null) => void;
  
  // Folder actions
  createFolder: (name: string, parentFolderId?: string | null, color?: string) => Folder;
  renameFolder: (id: string, newName: string) => void;
  updateFolderColor: (id: string, color: string) => void;
  deleteFolder: (id: string) => void;

  // Deck actions
  createDeck: (
    name: string, 
    description: string, 
    folderId: string | null, 
    color?: string,
    source?: 'import' | 'manual'
  ) => Deck;
  renameDeck: (id: string, newName: string, description?: string) => void;
  updateDeckColor: (id: string, color: string) => void;
  moveDeck: (deckId: string, targetFolderId: string | null) => void;
  deleteDeck: (id: string) => void;

  // Card actions
  addCard: (
    deckId: string, 
    front: string, 
    back: string, 
    tags?: string[]
  ) => Flashcard;
  updateCard: (deckId: string, cardId: string, front: string, back: string, tags?: string[]) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  setCardMastery: (deckId: string, cardId: string, status: MasteryStatus) => void;
  recordCardReview: (deckId: string, cardId: string, result: 'correct' | 'incorrect') => void;
  rateSpacedCard: (deckId: string, cardId: string, rating: SpacedRating) => void;

  // Test History & Score Log actions (Phase 5)
  recordTestScore: (
    deckId: string,
    deckName: string,
    correct: number,
    total: number,
    mode?: 'standard' | 'weak_points' | 'quick_test' | 'multi_source_test'
  ) => TestScoreRecord;
  clearTestHistory: () => void;
  resetAllAnalytics: () => void;
  exportBackupData: () => void;
  importBackupData: (jsonData: string) => { success: boolean; message: string };

  // Undo & Trash actions
  undoLastAction: () => void;
  restoreTrashItem: (trashId: string) => void;
  dismissUndoToast: () => void;
  emptyTrash: () => void;
}

const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'f-cs-ai',
    name: 'Computer Science & AI',
    parentFolderId: null,
    color: '#6366f1',
    createdAt: Date.now() - 1000000,
    updatedAt: Date.now() - 1000000,
  },
  {
    id: 'f-deep-learning',
    name: 'Neural Architectures & Transformers',
    parentFolderId: 'f-cs-ai',
    color: '#8b5cf6',
    createdAt: Date.now() - 800000,
    updatedAt: Date.now() - 800000,
  },
  {
    id: 'f-neuro',
    name: 'Cognitive Science & Memory',
    parentFolderId: null,
    color: '#06b6d4',
    createdAt: Date.now() - 600000,
    updatedAt: Date.now() - 600000,
  },
];

const INITIAL_DECKS: Deck[] = [
  {
    id: 'd-transformers',
    name: 'Attention Mechanism & Transformers',
    description: 'Self-attention mathematics, Multi-head projections, and QKV tensor operations.',
    folderId: 'f-deep-learning',
    color: '#8b5cf6',
    source: 'import', // Imported file
    createdAt: Date.now() - 700000,
    updatedAt: Date.now() - 700000,
    cards: [
      {
        id: 'c1',
        front: 'What is the mathematical formulation of Scaled Dot-Product Attention?',
        back: 'Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) V\n\nThe scaling factor 1/sqrt(d_k) prevents dot products from growing excessively large for high dimensions, avoiding gradient vanishing.',
        tags: ['Math', 'Attention', 'Transformers'],
        mastery: 'learning',
        correctCount: 4,
        incorrectCount: 1,
        lastReviewResult: 'correct',
        createdAt: Date.now() - 600000,
        updatedAt: Date.now() - 600000,
      },
      {
        id: 'c2',
        front: 'Why does Multi-Head Attention outperform Single-Head Attention?',
        back: 'Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions, whereas a single head averages them out.',
        tags: ['Architecture', 'Subspaces'],
        mastery: 'mastered',
        correctCount: 6,
        incorrectCount: 0,
        lastReviewResult: 'correct',
        createdAt: Date.now() - 550000,
        updatedAt: Date.now() - 550000,
      },
      {
        id: 'c3',
        front: 'What is the purpose of Positional Encodings in Transformers?',
        back: 'Because standard self-attention has permutation invariance (it contains no recurrence or convolution), positional encodings inject token order/sequence information into the input embeddings.',
        tags: ['Embeddings', 'Sequences'],
        mastery: 'new',
        correctCount: 2,
        incorrectCount: 1,
        lastReviewResult: 'incorrect',
        weakPoint: true,
        createdAt: Date.now() - 500000,
        updatedAt: Date.now() - 500000,
      },
    ],
  },
  {
    id: 'd-retention',
    name: 'Spaced Repetition & Forgetting Curve',
    description: 'Ebbinghaus decay curve, Leitner systems, and optimal recall intervals.',
    folderId: 'f-neuro',
    color: '#06b6d4',
    source: 'manual', // Manually created file
    createdAt: Date.now() - 500000,
    updatedAt: Date.now() - 500000,
    cards: [
      {
        id: 'c4',
        front: 'What is the Ebbinghaus Forgetting Curve formula?',
        back: 'R = e^(-t / S)\n\nWhere R is Memory Retention, S is relative Strength of memory, and t is time elapsed. Active retrieval resets the decay slope with increased stability.',
        tags: ['Cognition', 'Memory'],
        mastery: 'learning',
        correctCount: 5,
        incorrectCount: 2,
        lastReviewResult: 'correct',
        createdAt: Date.now() - 400000,
        updatedAt: Date.now() - 400000,
      },
      {
        id: 'c5',
        front: 'How does the Testing Effect (Retrieval Practice) consolidate neural pathways?',
        back: 'Active recall forces the brain to reconstruct knowledge traces, inducing synaptic plasticity and long-term potentiation (LTP) far superior to passive review.',
        tags: ['Plasticity', 'Recall'],
        mastery: 'mastered',
        correctCount: 7,
        incorrectCount: 1,
        lastReviewResult: 'correct',
        createdAt: Date.now() - 350000,
        updatedAt: Date.now() - 350000,
      },
    ],
  },
  {
    id: 'd-algorithms',
    name: 'Asymptotic Complexity & Data Structures',
    description: 'Master theorem, tree balances, and cache-conscious computational geometry.',
    folderId: 'f-cs-ai',
    color: '#6366f1',
    source: 'manual', // Manually created file
    createdAt: Date.now() - 450000,
    updatedAt: Date.now() - 450000,
    cards: [
      {
        id: 'c6',
        front: 'What is the time complexity of QuickSelect average vs worst case?',
        back: 'Average case: O(N) using randomized partitioning.\nWorst case: O(N^2) if pivot selection degenerates to extremum (fixed by median-of-medians to guaranteed O(N)).',
        tags: ['Algorithms', 'Complexity'],
        mastery: 'new',
        correctCount: 3,
        incorrectCount: 1,
        lastReviewResult: 'correct',
        createdAt: Date.now() - 300000,
        updatedAt: Date.now() - 300000,
      },
    ],
  },
];

// Seed zero-state initial test history logs (empty by default)
const INITIAL_TEST_SCORES: TestScoreRecord[] = [];

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = safeStorage.getItem('omega_folders');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : INITIAL_FOLDERS;
    } catch {
      return INITIAL_FOLDERS;
    }
  });

  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const saved = safeStorage.getItem('omega_decks');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed)
        ? parsed.map((d: any) => ({
            ...d,
            cards: Array.isArray(d?.cards) ? d.cards : [],
          }))
        : INITIAL_DECKS;
    } catch {
      return INITIAL_DECKS;
    }
  });

  const [trash, setTrash] = useState<TrashItem[]>(() => {
    try {
      const saved = safeStorage.getItem('omega_trash');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [testScores, setTestScores] = useState<TestScoreRecord[]>(() => {
    try {
      const saved = safeStorage.getItem('omega_test_scores');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : INITIAL_TEST_SCORES;
    } catch {
      return INITIAL_TEST_SCORES;
    }
  });

  // Track if user explicitly cleared analytics
  const [analyticsCleared, setAnalyticsCleared] = useState<boolean>(() => {
    return safeStorage.getItem('omega_analytics_cleared') === 'true';
  });

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [undoToast, setUndoToast] = useState<UndoToast | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    safeStorage.setItem('omega_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    safeStorage.setItem('omega_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    safeStorage.setItem('omega_trash', JSON.stringify(trash));
  }, [trash]);

  useEffect(() => {
    safeStorage.setItem('omega_test_scores', JSON.stringify(testScores));
  }, [testScores]);

  useEffect(() => {
    safeStorage.setItem('omega_analytics_cleared', String(analyticsCleared));
  }, [analyticsCleared]);

  // Compute Comprehensive Analytics Summary:
  // Starts strictly at ZERO unless actual user actions occur (files generated, cards created, or cards answered)
  const calculateAnalytics = (): AnalyticsSummary => {
    if (analyticsCleared) {
      return {
        totalErrors: 0,
        totalCorrect: 0,
        totalCardsAnswered: 0,
        improvementRate: 0,
        manualCreatedFilesCount: 0,
        totalCardsProduced: 0,
        cardsDueForReviewCount: 0,
      };
    }

    let cardCorrect = 0;
    let cardErrors = 0;
    let totalCards = 0;
    let cardsDueForReview = 0;

    const now = Date.now();

    const safeDecks = Array.isArray(decks) ? decks : [];
    safeDecks.forEach((deck) => {
      const cards = Array.isArray(deck?.cards) ? deck.cards : [];
      totalCards += cards.length;
      cards.forEach((card) => {
        cardCorrect += card?.correctCount || 0;
        cardErrors += card?.incorrectCount || 0;
        if (!card?.nextReviewDate || card.nextReviewDate <= now) {
          cardsDueForReview += 1;
        }
      });
    });

    const safeScores = Array.isArray(testScores) ? testScores : [];
    const testCorrect = safeScores.reduce((acc, t) => acc + (t?.correctCount || 0), 0);
    const testErrors = safeScores.reduce((acc, t) => acc + (t?.incorrectCount || 0), 0);

    const totalCorrect = cardCorrect + testCorrect;
    const totalErrors = cardErrors + testErrors;
    const totalCardsAnswered = totalCorrect + totalErrors;

    const manualCreatedFilesCount = safeDecks.length;

    // Calculate improvement rate:
    let improvementRate = 0;
    if (testScores.length >= 2) {
      const sorted = [...testScores].sort((a, b) => b.timestamp - a.timestamp);
      const recent = sorted.slice(0, 2);
      const older = sorted.slice(2);
      const recentAvg = recent.reduce((sum, s) => sum + s.scoreOutOfTen, 0) / recent.length;
      const olderAvg = older.length > 0 
        ? older.reduce((sum, s) => sum + s.scoreOutOfTen, 0) / older.length
        : recentAvg;
      
      const diff = ((recentAvg - olderAvg) / Math.max(0.1, olderAvg)) * 100;
      improvementRate = Math.round(diff * 10) / 10;
    } else if (totalCardsAnswered > 0) {
      improvementRate = Math.round((totalCorrect / totalCardsAnswered) * 100 * 10) / 10;
    }

    return {
      totalErrors,
      totalCorrect,
      totalCardsAnswered,
      improvementRate,
      manualCreatedFilesCount,
      totalCardsProduced: totalCards,
      cardsDueForReviewCount: cardsDueForReview,
    };
  };

  const analytics = calculateAnalytics();

  // Record a Test Score (out of 10)
  const recordTestScore = (
    deckId: string,
    deckName: string,
    correct: number,
    total: number,
    mode: 'standard' | 'weak_points' | 'quick_test' | 'multi_source_test' = 'standard'
  ): TestScoreRecord => {
    const rawRatio = total > 0 ? correct / total : 0;
    const scoreOutOfTen = Math.round(rawRatio * 10 * 10) / 10; // e.g. 8.5
    const incorrect = Math.max(0, total - correct);

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (scoreOutOfTen >= 9.8) grade = 'A+';
    else if (scoreOutOfTen >= 8.8) grade = 'A';
    else if (scoreOutOfTen >= 7.5) grade = 'B';
    else if (scoreOutOfTen >= 6.0) grade = 'C';
    else if (scoreOutOfTen >= 5.0) grade = 'D';

    const newRecord: TestScoreRecord = {
      id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      deckId,
      deckName,
      scoreOutOfTen,
      correctCount: correct,
      incorrectCount: incorrect,
      totalCards: total,
      timestamp: Date.now(),
      mode,
      grade,
    };

    setTestScores((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const clearTestHistory = () => {
    sound.playDelete();
    setTestScores([]);
    localStorage.removeItem('omega_test_scores');
  };

  // Reset ALL statistics to zero (Errors, Correct, Improvement Rate, History)
  const resetAllAnalytics = () => {
    sound.playDelete();
    setAnalyticsCleared(true);
    setTestScores([]);
    localStorage.removeItem('omega_test_scores');
    localStorage.setItem('omega_analytics_cleared', 'true');
    // Also reset individual card answer tallies in current decks
    setDecks((prev) =>
      prev.map((deck) => ({
        ...deck,
        cards: deck.cards.map((card) => ({
          ...card,
          correctCount: 0,
          incorrectCount: 0,
          lastReviewResult: undefined,
          weakPoint: false,
        })),
      }))
    );
  };

  // Export Complete Backup JSON
  const exportBackupData = () => {
    sound.playClick(720);
    const backupPayload = {
      system: 'OMEGA LEARNING SYSTEM',
      version: '1.0',
      exportedAt: Date.now(),
      folders,
      decks,
      testScores,
      trash,
      settings: {
        palette: localStorage.getItem('omega_palette') || 'indigo',
        mode: localStorage.getItem('omega_mode') || 'dark',
        backgroundPattern: localStorage.getItem('omega_bg_pattern') || 'stars',
        animationEnabled: localStorage.getItem('omega_animation_enabled') !== 'false',
        autoRevealEnabled: localStorage.getItem('omega_auto_reveal_enabled') === 'true',
        autoRevealDuration: localStorage.getItem('omega_auto_reveal_duration') || '5',
      },
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omega-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Backup JSON (Hardened for Security)
  const importBackupData = (jsonData: string): { success: boolean; message: string } => {
    try {
      if (typeof jsonData !== 'string' || jsonData.length > 50 * 1024 * 1024) {
        throw new Error('Payload size exceeds safe operational bounds.');
      }

      const data = JSON.parse(jsonData);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid JSON structure.');
      }

      // Security: Block Prototype Pollution
      const forbiddenKeys = ['__proto__', 'constructor', 'prototype'];
      for (const key of forbiddenKeys) {
        if (key in data) {
          throw new Error('Security policy violation: Rejected malformed property.');
        }
      }

      sound.playRestore();
      if (Array.isArray(data.folders)) {
        const cleanFolders = data.folders.filter(
          (f: any) => f && typeof f.id === 'string' && typeof f.name === 'string'
        );
        setFolders(cleanFolders);
      }
      if (Array.isArray(data.decks)) {
        const cleanDecks = data.decks.filter(
          (d: any) => d && typeof d.id === 'string' && typeof d.name === 'string' && Array.isArray(d.cards)
        );
        setDecks(cleanDecks);
      }
      if (Array.isArray(data.testScores)) {
        const cleanScores = data.testScores.filter(
          (s: any) => s && typeof s.id === 'string' && typeof s.scoreOutOfTen === 'number'
        );
        setTestScores(cleanScores);
      }
      if (Array.isArray(data.trash)) {
        setTrash(data.trash.filter((t: any) => t && typeof t.id === 'string'));
      }
      if (data.settings && typeof data.settings === 'object') {
        if (typeof data.settings.palette === 'string') localStorage.setItem('omega_palette', data.settings.palette);
        if (typeof data.settings.mode === 'string') localStorage.setItem('omega_mode', data.settings.mode);
        if (typeof data.settings.backgroundPattern === 'string') localStorage.setItem('omega_bg_pattern', data.settings.backgroundPattern);
        if (data.settings.animationEnabled !== undefined) localStorage.setItem('omega_animation_enabled', String(Boolean(data.settings.animationEnabled)));
        if (typeof data.settings.username === 'string') localStorage.setItem('omega_username', data.settings.username.slice(0, 30));
      }

      setAnalyticsCleared(false);
      localStorage.removeItem('omega_analytics_cleared');

      return {
        success: true,
        message: `Restored ${data.decks?.length || 0} decks and ${data.folders?.length || 0} folders successfully.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to parse backup file.',
      };
    }
  };

  // Push to trash and trigger Undo notification
  const triggerUndo = (item: TrashItem, message: string) => {
    sound.playDelete();
    setTrash((prev) => [item, ...prev]);
    setUndoToast({
      id: Math.random().toString(),
      message,
      item,
    });
  };

  const dismissUndoToast = () => {
    setUndoToast(null);
  };

  // Create folder
  const createFolder = (name: string, parentFolderId: string | null = null, color = '#6366f1'): Folder => {
    sound.playClick();
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: name.trim() || 'Untitled Folder',
      parentFolderId: parentFolderId || null,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  // Rename folder
  const renameFolder = (id: string, newName: string) => {
    sound.playClick();
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName.trim(), updatedAt: Date.now() } : f))
    );
  };

  // Update folder color from 12-color palette
  const updateFolderColor = (id: string, color: string) => {
    sound.playClick();
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, color, updatedAt: Date.now() } : f))
    );
  };

  // Delete folder (with deep cascade & instant recovery)
  const deleteFolder = (id: string) => {
    const target = folders.find((f) => f.id === id);
    if (!target) return;

    const childFolders = folders.filter((f) => f.parentFolderId === id);
    const childDecks = decks.filter((d) => d.folderId === id);

    const trashItem: TrashItem = {
      id: `trash-folder-${Date.now()}`,
      title: `Folder "${target.name}"`,
      type: 'folder',
      deletedAt: Date.now(),
      data: {
        folder: target,
        childFolders,
        childDecks,
      } as any,
    };

    setFolders((prev) => prev.filter((f) => f.id !== id && f.parentFolderId !== id));
    setDecks((prev) => prev.filter((d) => d.folderId !== id));

    triggerUndo(
      trashItem,
      `Deleted folder "${target.name}" (${childDecks.length} decks, ${childFolders.length} subfolders)`
    );
  };

  // Create deck
  const createDeck = (
    name: string,
    description: string,
    folderId: string | null = null,
    color = '#8b5cf6',
    source: 'import' | 'manual' = 'manual'
  ): Deck => {
    sound.playClick();
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name: name.trim() || 'Untitled Deck',
      description: description.trim(),
      folderId: folderId || null,
      color,
      source,
      cards: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDecks((prev) => [newDeck, ...prev]);
    return newDeck;
  };

  // Rename deck
  const renameDeck = (id: string, newName: string, description?: string) => {
    sound.playClick();
    setDecks((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              name: newName.trim(),
              description: description !== undefined ? description.trim() : d.description,
              updatedAt: Date.now(),
            }
          : d
      )
    );
  };

  // Update deck color from 12-color palette
  const updateDeckColor = (id: string, color: string) => {
    sound.playClick();
    setDecks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, color, updatedAt: Date.now() } : d))
    );
  };

  // Move deck
  const moveDeck = (deckId: string, targetFolderId: string | null) => {
    sound.playClick();
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId ? { ...d, folderId: targetFolderId, updatedAt: Date.now() } : d
      )
    );
  };

  // Delete deck
  const deleteDeck = (id: string) => {
    const target = decks.find((d) => d.id === id);
    if (!target) return;

    const trashItem: TrashItem = {
      id: `trash-deck-${Date.now()}`,
      title: `Deck "${target.name}"`,
      type: 'deck',
      deletedAt: Date.now(),
      data: target,
    };

    setDecks((prev) => prev.filter((d) => d.id !== id));
    triggerUndo(trashItem, `Deleted deck "${target.name}" (${target.cards.length} cards)`);
  };

  // Add Card
  const addCard = (
    deckId: string,
    front: string,
    back: string,
    tags: string[] = []
  ): Flashcard => {
    sound.playClick();
    const newCard: Flashcard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      front: front.trim(),
      back: back.trim(),
      tags,
      mastery: 'new',
      correctCount: 0,
      incorrectCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? { ...d, cards: [newCard, ...d.cards], updatedAt: Date.now() }
          : d
      )
    );
    return newCard;
  };

  // Update Card
  const updateCard = (
    deckId: string,
    cardId: string,
    front: string,
    back: string,
    tags?: string[]
  ) => {
    sound.playClick();
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  front: front.trim(),
                  back: back.trim(),
                  tags: tags !== undefined ? tags : c.tags,
                  updatedAt: Date.now(),
                }
              : c
          ),
          updatedAt: Date.now(),
        };
      })
    );
  };

  // Delete Card
  const deleteCard = (deckId: string, cardId: string) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    const card = deck.cards.find((c) => c.id === cardId);
    if (!card) return;

    const trashItem: TrashItem = {
      id: `trash-card-${Date.now()}`,
      title: `Card "${card.front.slice(0, 30)}..."`,
      type: 'card',
      deletedAt: Date.now(),
      data: { card, deckId },
    };

    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? { ...d, cards: d.cards.filter((c) => c.id !== cardId), updatedAt: Date.now() }
          : d
      )
    );

    triggerUndo(trashItem, `Deleted flashcard`);
  };

  // Set Card Mastery
  const setCardMastery = (deckId: string, cardId: string, status: MasteryStatus) => {
    sound.playClick(status === 'mastered' ? 880 : 540);
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) => (c.id === cardId ? { ...c, mastery: status } : c)),
        };
      })
    );
  };

  // Record Card Review with weak point tracking
  const recordCardReview = (deckId: string, cardId: string, result: 'correct' | 'incorrect') => {
    sound.playClick(result === 'correct' ? 880 : 380);
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) => {
            if (c.id !== cardId) return c;
            const newCorrect = (c.correctCount || 0) + (result === 'correct' ? 1 : 0);
            const newIncorrect = (c.incorrectCount || 0) + (result === 'incorrect' ? 1 : 0);
            return {
              ...c,
              mastery: result === 'correct' ? 'mastered' : 'learning',
              lastReviewResult: result,
              correctCount: newCorrect,
              incorrectCount: newIncorrect,
              weakPoint: result === 'incorrect',
              updatedAt: Date.now(),
            };
          }),
        };
      })
    );
  };

  // Spaced Repetition Rating: Very Easy, Easy, Medium, Hard (Anki SM-2 style)
  const rateSpacedCard = (deckId: string, cardId: string, rating: SpacedRating) => {
    sound.playClick(
      rating === 'very_easy'
        ? 920
        : rating === 'easy'
        ? 800
        : rating === 'medium'
        ? 650
        : 380
    );

    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) => {
            if (c.id !== cardId) return c;

            const prevInterval = c.interval || 0;
            const prevEase = c.easeFactor || 2.5;
            const prevReps = c.repetitions || 0;

            let newInterval = 1; // interval in days
            let newEase = prevEase;
            let newReps = prevReps + 1;
            let isWeak = false;
            let masteryStatus: MasteryStatus = 'learning';

            if (rating === 'hard') {
              newReps = 0;
              newInterval = 1;
              newEase = Math.max(1.3, parseFloat((prevEase - 0.2).toFixed(2)));
              isWeak = true;
              masteryStatus = 'learning';
            } else if (rating === 'medium') {
              if (prevReps === 0) newInterval = 1;
              else if (prevReps === 1) newInterval = 3;
              else newInterval = Math.max(1, Math.round(prevInterval * prevEase));
              newEase = prevEase;
              masteryStatus = 'learning';
            } else if (rating === 'easy') {
              if (prevReps === 0) newInterval = 3;
              else if (prevReps === 1) newInterval = 6;
              else newInterval = Math.max(1, Math.round(prevInterval * prevEase * 1.3));
              newEase = Math.min(3.2, parseFloat((prevEase + 0.15).toFixed(2)));
              masteryStatus = 'mastered';
            } else if (rating === 'very_easy') {
              if (prevReps === 0) newInterval = 7;
              else if (prevReps === 1) newInterval = 14;
              else newInterval = Math.max(1, Math.round(prevInterval * prevEase * 1.8));
              newEase = Math.min(3.5, parseFloat((prevEase + 0.3).toFixed(2)));
              masteryStatus = 'mastered';
            }

            const isCorrect = rating !== 'hard';
            const nextReviewDate = Date.now() + newInterval * 24 * 60 * 60 * 1000;

            return {
              ...c,
              interval: newInterval,
              easeFactor: newEase,
              repetitions: newReps,
              nextReviewDate,
              lastRating: rating,
              lastReviewedAt: Date.now(),
              mastery: masteryStatus,
              lastReviewResult: isCorrect ? 'correct' : 'incorrect',
              correctCount: (c.correctCount || 0) + (isCorrect ? 1 : 0),
              incorrectCount: (c.incorrectCount || 0) + (!isCorrect ? 1 : 0),
              weakPoint: isWeak,
              updatedAt: Date.now(),
            };
          }),
        };
      })
    );
  };

  // Instant Undo recovery
  const undoLastAction = () => {
    if (!undoToast) return;
    restoreTrashItem(undoToast.item.id);
    setUndoToast(null);
  };

  // Restore item from Trash
  const restoreTrashItem = (trashId: string) => {
    const item = trash.find((t) => t.id === trashId);
    if (!item) return;

    sound.playRestore();

    if (item.type === 'deck') {
      const deck = item.data as Deck;
      setDecks((prev) => [deck, ...prev]);
    } else if (item.type === 'folder') {
      const data = item.data as any;
      if (data.folder) {
        setFolders((prev) => [...prev, data.folder, ...(data.childFolders || [])]);
        if (data.childDecks && data.childDecks.length > 0) {
          setDecks((prev) => [...prev, ...data.childDecks]);
        }
      } else {
        setFolders((prev) => [data as Folder, ...prev]);
      }
    } else if (item.type === 'card') {
      const { card, deckId } = item.data as { card: Flashcard; deckId: string };
      setDecks((prev) =>
        prev.map((d) =>
          d.id === deckId ? { ...d, cards: [card, ...d.cards], updatedAt: Date.now() } : d
        )
      );
    }

    setTrash((prev) => prev.filter((t) => t.id !== trashId));
    if (undoToast?.item.id === trashId) {
      setUndoToast(null);
    }
  };

  // Empty Trash
  const emptyTrash = () => {
    sound.playDelete();
    setTrash([]);
  };

  return (
    <DeckContext.Provider
      value={{
        folders,
        decks,
        trash,
        testScores,
        currentFolderId,
        activeDeckId,
        undoToast,
        analytics,
        setCurrentFolderId,
        setActiveDeckId,
        createFolder,
        renameFolder,
        updateFolderColor,
        deleteFolder,
        createDeck,
        renameDeck,
        updateDeckColor,
        moveDeck,
        deleteDeck,
        addCard,
        updateCard,
        deleteCard,
        setCardMastery,
        recordCardReview,
        rateSpacedCard,
        recordTestScore,
        clearTestHistory,
        resetAllAnalytics,
        exportBackupData,
        importBackupData,
        undoLastAction,
        restoreTrashItem,
        dismissUndoToast,
        emptyTrash,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};

export const useDecks = (): DeckContextType => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error('useDecks must be used within a DeckProvider');
  }
  return context;
};
