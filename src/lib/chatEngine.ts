import { CATEGORIES, getCategory } from '@/constants';
import type { CampusRecord, CategoryId } from '@/types';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'am', 'was', 'were', 'be', 'do', 'does', 'i', 'my', 'me', 'we', 'our',
  'you', 'your', 'to', 'of', 'in', 'on', 'at', 'for', 'and', 'or', 'what', 'when', 'where', 'how', 'can',
  'should', 'would', 'could', 'will', 'there', 'this', 'that', 'it', 'its', 'about', 'please', 'tell',
  'with', 'from', 'if', 'any', 'some', 'want', 'know', 'need', 'get', 'by', 'so', 'than', 'then', 'why',
]);

const FOLLOW_UP_WORDS = new Set([
  'more', 'details', 'detail', 'explain', 'also', 'else', 'another', 'other', 'exception', 'exceptions',
  'after', 'before', 'again', 'elaborate', 'further', 'continue', 'and', 'it', 'that', 'this', 'they', 'them',
]);

export interface ChatContext {
  lastCategory?: CategoryId;
}

export interface ChatReply {
  text: string;
  category?: CategoryId;
  sourceTitles: string[];
  office?: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function detectCategory(tokens: string[]): CategoryId | undefined {
  let best: { id: CategoryId; hits: number } | undefined;
  for (const category of CATEGORIES) {
    const hits = tokens.filter((t) => category.keywords.includes(t)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { id: category.id, hits };
  }
  return best?.id;
}

function scoreRecord(record: CampusRecord, tokens: string[]): number {
  const titleTokens = tokenize(record.title);
  const bodyTokens = tokenize(record.description);
  let score = 0;
  for (const token of tokens) {
    if (titleTokens.includes(token)) score += 3;
    if (bodyTokens.includes(token)) score += 1;
    if (getCategory(record.category).keywords.includes(token)) score += 2;
  }
  return score;
}

function fallbackReply(category?: CategoryId): ChatReply {
  const office = getCategory(category ?? 'general').office;
  return {
    text: `I don't have reliable information on that yet, so I won't guess. Please contact the ${office} for an accurate answer.`,
    category,
    sourceTitles: [],
    office,
  };
}

export function answerQuestion(question: string, records: CampusRecord[], context: ChatContext): ChatReply {
  const tokens = tokenize(question);
  if (tokens.length === 0) {
    return {
      text: 'Could you tell me a little more? Try asking about attendance, leave, hostel rules, the library, ID cards, examinations, discipline or scholarships.',
      sourceTitles: [],
    };
  }

  const ranked = records
    .map((record) => ({ record, score: scoreRecord(record, tokens) }))
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (ranked.length > 0) {
    const top = ranked[0].record;
    const category = top.category;
    const text =
      ranked.length === 1
        ? `${top.title}: ${top.description}`
        : `Here is what I found:\n${ranked.map((r) => `• ${r.record.title}: ${r.record.description}`).join('\n')}`;
    return { text, category, sourceTitles: ranked.map((r) => r.record.title) };
  }

  const detected = detectCategory(tokens);
  const isFollowUp = tokens.some((t) => FOLLOW_UP_WORDS.has(t)) || tokens.length <= 2;
  const category = detected ?? (isFollowUp ? context.lastCategory : undefined);

  if (!category) return fallbackReply();

  const inCategory = records.filter((r) => r.category === category);
  if (inCategory.length === 0) return fallbackReply(category);

  const text = inCategory.map((r) => `• ${r.title}: ${r.description}`).join('\n');
  return { text: `Here is what we have on ${getCategory(category).label}:\n${text}`, category, sourceTitles: inCategory.map((r) => r.title) };
}

export const SUGGESTED_QUESTIONS = [
  'What is the minimum attendance?',
  'How do I apply for leave?',
  'What are the hostel entry timings?',
  'What are the library rules?',
  'How do I replace a lost ID card?',
  'What are the examination guidelines?',
];
