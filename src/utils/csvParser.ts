/**
 * Delimited Text & CSV Parser for OMEGA LEARNING SYSTEM
 * Converts CSV and plain text study notes into flashcards with automatic or custom text box separator options.
 * 100% Local & Offline Processing.
 */

export type DelimiterType = string;

export interface ParsedCardItem {
  lineNumber: number;
  front: string;
  back: string;
  tags: string[];
  rawLine: string;
  isValid: boolean;
  error?: string;
}

export interface ParseResult {
  cards: ParsedCardItem[];
  validCount: number;
  invalidCount: number;
  detectedDelimiter: string;
}

/**
 * Automatically inspects sample lines to detect the most probable separator.
 */
export function autoDetectDelimiter(text: string): string {
  const candidateDelimiters = [';', ':', ',', '\t', '|', '.', '-', '=>', '='];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'))
    .slice(0, 20);

  if (lines.length === 0) return ';';

  const counts: Record<string, number> = {};
  candidateDelimiters.forEach((d) => (counts[d] = 0));

  for (const line of lines) {
    for (const delim of candidateDelimiters) {
      if (line.includes(delim)) {
        counts[delim] += 1;
      }
    }
  }

  let bestDelim = ';';
  let maxCount = -1;

  for (const delim of candidateDelimiters) {
    if (counts[delim] > maxCount) {
      maxCount = counts[delim];
      bestDelim = delim;
    }
  }

  return maxCount > 0 ? bestDelim : ';';
}

/**
 * Splits a single CSV / delimited line respecting double quotes (RFC 4180 standard).
 */
export function splitDelimitedLine(line: string, delimiter: string): string[] {
  if (!delimiter) delimiter = ';';
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      } else {
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (!inQuotes && line.slice(i, i + delimiter.length) === delimiter) {
      fields.push(current.trim());
      current = '';
      i += delimiter.length;
      continue;
    }

    current += char;
    i++;
  }

  fields.push(current.trim());
  return fields;
}

/**
 * Parses raw text or CSV content into flashcards according to custom text box separator or auto-detected delimiter.
 */
export function parseDelimitedFlashcards(
  rawText: string,
  delimiterPreference: string = 'auto'
): ParseResult {
  const effectiveDelimiter =
    !delimiterPreference || delimiterPreference === 'auto'
      ? autoDetectDelimiter(rawText)
      : delimiterPreference;

  const rawLines = rawText.split(/\r?\n/);
  const cards: ParsedCardItem[] = [];

  rawLines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      return;
    }

    const fields = splitDelimitedLine(trimmed, effectiveDelimiter);

    if (fields.length >= 2) {
      const front = fields[0]?.trim();
      const back = fields[1]?.trim();
      const rawTags = fields.slice(2).join(' ').trim();

      const tags = rawTags
        ? rawTags
            .split(/[,;\s]+/)
            .map((t) => t.trim().replace(/^#/, ''))
            .filter((t) => t.length > 0)
        : [];

      if (!front && !back) return;

      if (!front) {
        cards.push({
          lineNumber,
          front: '',
          back,
          tags,
          rawLine,
          isValid: false,
          error: 'Missing Front (Side 1) of card',
        });
      } else if (!back) {
        cards.push({
          lineNumber,
          front,
          back: '',
          tags,
          rawLine,
          isValid: false,
          error: 'Missing Back (Side 2) of card',
        });
      } else {
        cards.push({
          lineNumber,
          front,
          back,
          tags,
          rawLine,
          isValid: true,
        });
      }
    } else {
      cards.push({
        lineNumber,
        front: trimmed,
        back: '',
        tags: [],
        rawLine,
        isValid: false,
        error: `Separator '${effectiveDelimiter}' not found on line`,
      });
    }
  });

  const validCount = cards.filter((c) => c.isValid).length;
  const invalidCount = cards.length - validCount;

  return {
    cards,
    validCount,
    invalidCount,
    detectedDelimiter: effectiveDelimiter,
  };
}
