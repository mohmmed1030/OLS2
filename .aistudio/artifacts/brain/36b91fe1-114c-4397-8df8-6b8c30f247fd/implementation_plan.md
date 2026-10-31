# Anki-Style CSV & Delimited Text Import and Streamlined Single-Flight Gemini Engine

Deliver a fast, local Anki-style delimiter converter for CSV and plain text study notes alongside a single-flight API request engine that prevents duplicate or repeated Gemini calls.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions were confirmed through interactive clarification and will guide the implementation:

- **Confirmed Delimiter Strategy**: Auto-detect delimiter with manual override options (Comma `,`, Semicolon `;`, Colon `:`, Tab `\t`, Pipe `|`). [Completed]
- **Confirmed Destination Routing**: Allow users to either create a brand-new deck (with customized name, color, and optional folder) or append cards directly into any existing deck. [Completed]
- **Confirmed Card Structure**: Two-sided flashcards (Front and Back) with optional third column support for custom topic tags. [Completed]
- **API Request Optimization**: Hard single-flight execution lock with `AbortController` and intelligent single-dispatch routing to eliminate any duplicate, retried, or redundant calls to Gemini. [Completed]

---

### 1. Overview & Core Concept

- **What It Does**: 
  1. **Anki-Style CSV & Plain Text Import**: Allows users to paste raw delimited text or upload `.csv`, `.tsv`, or `.txt` files, automatically parse and normalize rows into front/back flashcards (with optional tags), preview cards in real time with syntax error indicators, and import them directly into any chosen deck—completely locally with 0 API calls and instant execution.
  2. **Single-Flight Gemini Optimization**: Enforces a strict single-flight network policy for AI flashcard and multiple-choice generation, guaranteeing exactly one consolidated prompt request is sent per user action with zero repeated, re-triggered, or duplicate API invocations.
- **Target Audience / Persona**: Students, medical/law exam candidates, language learners, and educators transitioning from Anki or Quizlet who want rapid batch imports without consuming AI quotas.
- **Key Value**: Instant card creation for existing notes and spreadsheets, paired with protected and efficient AI generation that avoids unnecessary quota consumption.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Opening Delimited Importer*: User clicks **Import CSV / Text** in the Library toolbar or selects the **Delimited Text / CSV** tab in the Generator view.
  2. *Input & Live Detection*: User pastes lines (e.g., `Mitochondria; Powerhouse of the cell; Biology`) or uploads a `.csv` / `.txt` file. The auto-detector immediately identifies the most frequent consistent delimiter (comma, semicolon, colon, or tab) and displays it with a manual override dropdown.
  3. *Real-Time Card Preview*: An interactive table displays parsed cards, line numbers, front prompt, back answer, detected tags, and row validation indicators before saving.
  4. *Target Deck Selection*: User selects **✨ Create New Deck** (specifying title, folder, and 12-color palette) or chooses an **Existing Deck** from their library.
  5. *Instant Import*: User clicks **Import Cards**, receiving audio and visual confirmation with an immediate link to start studying.
  6. *Optimized AI Generation*: When generating via Gemini, a single-flight debounce lock disables the trigger button, cancels any stale in-flight requests, and dispatches a single consolidated request that creates all requested cards or questions in one shot.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian, focused educational instrument with clean dark-mode slate surfaces and crisp indigo accents adhering to the Universal Frontend Design Constitution.
  - *Color Palette & Tokens*: Dominant dark canvas (`#090d16`), structural surface cards (`#0f172a` / `#1e293b`), hairline borders (`#334155`), and semantic accents (Indigo `#6366f1` for standard cards, Emerald `#10b981` for successful validation, Amber `#f59e0b` for AI synthesis).
  - *Typography*: Display headings in `Plus Jakarta Sans` / `Outfit`, body copy in `DM Sans`, and tabular row counters in `font-mono tabular-nums`.
  - *Anti-Slop Discipline*: Zero static pill tags on metadata; clean unboxed text with `·` separators; natural title-case labels; zero fake telemetry or pulsing status dots.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Local Client-Side Delimited Parser vs. Server/AI Parsing**
  - *Chosen Approach*: Pure client-side regex and RFC 4180-compliant CSV parser with auto-delimiter detection and live preview.
  - *Why*: Instantaneous sub-10ms response time, complete offline privacy, zero API quota consumption, and full compatibility with static GitHub Pages deployments.
  - *Alternatives Considered*: Sending text to Gemini to parse into cards. Passed over because it wastes API quota and adds unnecessary network latency when structured delimiters are already present.

- **Decision 2: Single-Flight In-Flight Request Locking & AbortController**
  - *Chosen Approach*: Implement a shared mutex/lock state with an active `AbortController` in `geminiService.ts` and UI components. Disable retry cascades that double-hit endpoints on failure.
  - *Why*: Guarantees that even with fast double-clicks or slow network connections, only a single API request is dispatched to Google Gemini, strictly preserving daily quotas.
  - *Alternatives Considered*: Blind fallback from `/api/generate-cards` to client-side direct API. Passed over because API failures (like rate limits or bad keys) would result in doubled request attempts.

- **Decision 3: Flexible 3-Column Support (Front / Back / Tags)**
  - *Chosen Approach*: First column maps to Front, second column to Back, and optional third column (or remaining columns) parse into topic tags. Lines with only one side trigger a warning in the live preview.
  - *Why*: Matches Anki's standard 2-field and 3-field export convention while accommodating simple `term: definition` text lists.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OMEGA LEARNING SYSTEM                           │
├──────────────────────────────────┬─────────────────────────────────────┤
│      DELIMITED IMPORT FLOW       │       SINGLE-FLIGHT AI ENGINE       │
│                                  │                                     │
│  ┌────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ CSV / Plain Text Input     │  │  │ User Prompt / PDF Document    │  │
│  │ (File Drop or Paste Area)  │  │  │ (Consolidated Card Count)     │  │
│  └─────────────┬──────────────┘  │  └───────────────┬───────────────┘  │
│                │                 │                  │                  │
│                ▼                 │                  ▼                  │
│  ┌────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ Delimiter Auto-Detection   │  │  │ Single-Flight Lock & Debounce │  │
│  │ (, ; : \t |) + Override    │  │  │ (Active AbortController)      │  │
│  └─────────────┬──────────────┘  │  └───────────────┬───────────────┘  │
│                │                 │                  │                  │
│                ▼                 │                  ▼ (Strictly 1 call)│
│  ┌────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ RFC 4180 Parsing & Preview │  │  │ Gemini 3.8 Flash API Dispatch │  │
│  │ (Front, Back, Tags)        │  │  │ (Server or Client Direct)     │  │
│  └─────────────┬──────────────┘  │  └───────────────┬───────────────┘  │
│                │                 │                  │                  │
│                ▼                 │                  ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ DeckContext State Storage (Local SafeStorage / Indexed Decks)    │  │
│  │ · Append to Existing Deck OR Create New Deck with 12 Colors     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Components & Implementation Details

1. **`DelimitedCardImportModal.tsx`**:
   - Complete modal supporting drag-and-drop of `.csv`, `.tsv`, and `.txt` files or raw text paste.
   - Live auto-detection of delimiters with a manual override selector (`Comma`, `Semicolon`, `Colon`, `Tab`, `Pipe`).
   - Interactive preview table with valid card counter, invalid line detection, and tag extraction.
   - Destination options: Add to existing deck or create a new deck with folder placement and 12-palette color selection.

2. **Integration into `DeckManagerView.tsx` and `AiGeneratorView.tsx`**:
   - Add clear **Import CSV / Text** action button in `DeckManagerView` header.
   - Add a quick switch or shortcut in `AiGeneratorView` so users with pre-existing notes can import immediately without using AI.

3. **Streamlined Single-Flight Gemini Engine (`geminiService.ts` & `server.ts`)**:
   - Add module-level `isRequestInProgress` lock flag and `AbortController` cancellation for in-flight requests.
   - Determine environment target cleanly: call the local Express proxy `/api/generate-cards` if available, or call the direct `gemini-3.8-flash` endpoint directly once on static deployments.
   - Never perform chained fallback retries on quota exhaustion (429) or client error (400) to prevent redundant billing and quota hits.
   - Retain consolidated single prompt formatting for both multiple-choice and standard flashcards.
