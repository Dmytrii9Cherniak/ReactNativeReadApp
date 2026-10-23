export interface SearchHit {
  paragraph: number;
  /** Уривок навколо збігу */
  before: string;
  match: string;
  after: string;
}

const CONTEXT = 40;
const MAX_HITS = 200;

/** Пошук у тексті книги без урахування регістру. */
export function searchParagraphs(paragraphs: string[], query: string): SearchHit[] {
  const needle = query.trim().toLowerCase();

  if (needle.length < 2) {
    return [];
  }

  const hits: SearchHit[] = [];

  for (let paragraph = 0; paragraph < paragraphs.length && hits.length < MAX_HITS; paragraph++) {
    const text = paragraphs[paragraph];
    const at = text.toLowerCase().indexOf(needle);

    if (at >= 0) {
      const start = Math.max(0, at - CONTEXT);
      const end = at + needle.length + CONTEXT;

      hits.push({
        paragraph,
        before: `${start > 0 ? '…' : ''}${text.slice(start, at)}`,
        match: text.slice(at, at + needle.length),
        after: `${text.slice(at + needle.length, end)}${end < text.length ? '…' : ''}`,
      });
    }
  }

  return hits;
}
