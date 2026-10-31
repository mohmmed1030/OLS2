export type MasteryStatus = 'new' | 'learning' | 'mastered';

export type QuestionType = 'standard';

export type SpacedRating = 'very_easy' | 'easy' | 'medium' | 'hard';

export interface Flashcard {
  id: string;
  front: string; // Question or concept
  back: string;  // Answer or explanation
  tags: string[];
  mastery: MasteryStatus;
  incorrectCount?: number;
  correctCount?: number;
  lastReviewResult?: 'correct' | 'incorrect';
  weakPoint?: boolean;

  // Spaced Repetition System (Anki / SM-2)
  interval?: number; // review interval in days (0.5, 1, 3, 6, 12, etc.)
  easeFactor?: number; // default 2.5
  repetitions?: number; // consecutive correct reviews count
  nextReviewDate?: number; // timestamp in ms when card is due for review
  lastRating?: SpacedRating;
  lastReviewedAt?: number;

  createdAt: number;
  updatedAt: number;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  folderId: string | null; // null represents root/unorganized
  color: string;
  icon?: string;
  cards: Flashcard[];
  source?: 'import' | 'manual'; // Track file creation source
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null; // null represents top-level folder
  color: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

export type TrashItemType = 'folder' | 'deck' | 'card';

export interface TrashItem {
  id: string;
  title: string;
  type: TrashItemType;
  deletedAt: number;
  data: Folder | Deck | { card: Flashcard; deckId: string };
}

export interface TestScoreRecord {
  id: string;
  deckId: string;
  deckName: string;
  scoreOutOfTen: number; // e.g. 9.0 out of 10
  correctCount: number;
  incorrectCount: number;
  totalCards: number;
  timestamp: number;
  mode: 'standard' | 'weak_points' | 'spaced_repetition' | 'quick_test' | 'multi_source_test';
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface AnalyticsSummary {
  totalErrors: number;
  totalCorrect: number;
  totalCardsAnswered: number;
  improvementRate: number; // percentage, e.g. +28.4%
  manualCreatedFilesCount: number;
  totalCardsProduced: number;
  cardsDueForReviewCount: number;
}
