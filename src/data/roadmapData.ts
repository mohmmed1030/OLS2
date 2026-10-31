import { PhaseMilestone } from '../types/system';

export const SYSTEM_PHASES: PhaseMilestone[] = [
  {
    id: 1,
    version: 'v0.3',
    name: 'Phase 1: Foundation, Brand Identity & Environment Engine',
    status: 'completed',
    description: 'Notion/Quizlet tech UI, signature Atom Nucleus logo with 4 orbiting electrons, 6 dual-mode palettes (Dark & Light), and 3 animated canvas backgrounds (Bubbles, Stars, Waves) with instant toggle.',
    keyPillars: [
      'Atom Nucleus Brand Mark',
      '6 Color Palettes (Dark/Light)',
      '3 Animated Background Patterns',
      'Master Animation OFF Toggle',
      'Top Bar Quick Controls'
    ]
  },
  {
    id: 2,
    version: 'v0.5',
    name: 'Phase 2: Hierarchical Folders, Decks & Undo Recovery',
    status: 'completed',
    description: 'Nested hierarchical folder trees, curated card collections/decks, instant Undo deletion recovery with Trash Archive, and tactile micro-interactions.',
    keyPillars: [
      'Hierarchical Folders & Sub-Folders',
      'Flashcard Collections & Decks',
      'Instant Undo Recovery & Trash Archive',
      'Tactile Micro-interactions & Sound FX'
    ]
  },
  {
    id: 3,
    version: 'v0.7',
    name: 'Phase 3: Autonomous AI Generation Engine',
    status: 'completed',
    description: 'Google Gemini integration for parsing text notes and PDF documents, document format validator, and configurable batch generation up to 100 cards.',
    keyPillars: [
      'Gemini Flash Integration',
      'PDF & Text Document Parser',
      'Document Format Validator',
      'Batch Card Count (Max 100)'
    ]
  },
  {
    id: 4,
    version: 'v0.8.2',
    name: 'Phase 4: Adaptive Study Session & Auto-Reveal Engine',
    status: 'completed',
    description: 'Targeted study session with Correct ("I knew it") and Incorrect ("I got it wrong") buttons, weak-point repetition queue, configurable auto-reveal timer (up to 20s), universal palette cascading, and responsive mobile offline study.',
    keyPillars: [
      'Correct & Incorrect Adaptive Loop',
      'Weak-Points Repetition Priority',
      'Auto-Reveal Timer (Up to 20s)',
      'Universal Full-Interface Color Cascade',
      'Mobile Touch Swipes & Offline Ready'
    ]
  },
  {
    id: 5,
    version: 'v0.9',
    name: 'Phase 5: Analytics Dashboard & Test History Score Log',
    status: 'completed',
    description: 'Comprehensive analytics dashboard tracking errors, correct answers, cognitive improvement rate, AI-generated vs manual files count, total cards produced, total cards answered, and a dedicated test history log recording scores out of 10 with precise timestamps.',
    keyPillars: [
      'Comprehensive Analytics Dashboard',
      'Error & Correct Answers Tracking',
      'Improvement Rate & Total Cards Counts',
      'AI vs Manual Files Generation Split',
      'Test History & Score Log (Out of 10)'
    ]
  },
  {
    id: 6,
    version: 'v0.9.5',
    name: 'Phase 6: Collaborative & Deep Dive Workspaces',
    status: 'upcoming',
    description: 'Study sessions, peer exchange boards, exportable cheat sheets, and integrated notes journal.',
    keyPillars: ['Knowledge Journal', 'Export Engine', 'Annotation Canvas', 'Revision Planner']
  },
  {
    id: 7,
    version: 'v1.0',
    name: 'Phase 7: Full System Polishing & Autonomous Engine',
    status: 'upcoming',
    description: 'Complete synthesis, keyboard shortcuts, high-performance offline caching, soundscapes, and final release suite.',
    keyPillars: ['System Synthesis', 'Keyboard Command Bar', 'Performance Audits', 'Full 1.0 Release']
  }
];
