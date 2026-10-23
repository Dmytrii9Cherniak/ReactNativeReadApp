import { strFromU8, unzipSync } from 'fflate';

import type { BookContent } from '@/features/catalog';

type ParsedBook = Pick<BookContent, 'paragraphs' | 'chapters'>;

const BLOCK_TAGS = /<\/?(?:p|div|br|li|blockquote|section|tr)\b[^>]*>/gi;
const HEADING = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi;
const HEADING_MARK = '\u0000H\u0000';

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  laquo: '«',
  raquo: '»',
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      return String.fromCodePoint(parseInt(code.slice(2), 16));
    }

    if (code.startsWith('#')) {
      return String.fromCodePoint(parseInt(code.slice(1), 10));
    }

    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

const attribute = (tag: string, name: string) =>
  new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i').exec(tag)?.[1] ?? null;

/** Шлях відносно файлу OPF (`OEBPS/content.opf` + `text/ch1.xhtml`). */
function resolvePath(base: string, href: string): string {
  const parts = [...base.split('/').filter(Boolean), ...decodeURIComponent(href).split('/')];
  const resolved: string[] = [];

  parts.forEach((part) => {
    if (part === '..') {
      resolved.pop();
    } else if (part !== '.') {
      resolved.push(part);
    }
  });

  return resolved.join('/');
}

/** Абзаци з XHTML-розділу; заголовки позначені, щоб зібрати зміст. */
function htmlToBlocks(html: string): string[] {
  const body = /<body\b[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html;

  return body
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')
    .replace(HEADING, (_, inner: string) => `\n${HEADING_MARK}${inner}\n`)
    .replace(BLOCK_TAGS, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((line) => decodeEntities(line).replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0 && line !== HEADING_MARK);
}

/**
 * Розбір EPUB у текст — так, як це робитиме бекенд після завантаження.
 * EPUB — це zip: META-INF/container.xml → файл OPF → порядок розділів (spine) → XHTML.
 * Повертає null, якщо файл не схожий на EPUB.
 */
export function parseEpub(bytes: Uint8Array): ParsedBook | null {
  const files = unzipSync(bytes);
  const read = (path: string) => (files[path] ? strFromU8(files[path]) : null);

  const container = read('META-INF/container.xml');
  const opfPath = container ? attribute(container, 'full-path') : null;
  const opf = opfPath ? read(opfPath) : null;

  if (!opfPath || !opf) {
    return null;
  }

  const base = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/')) : '';
  const manifest = new Map<string, string>();

  for (const [tag] of opf.matchAll(/<item\b[^>]*>/gi)) {
    const id = attribute(tag, 'id');
    const href = attribute(tag, 'href');

    if (id && href) {
      manifest.set(id, href);
    }
  }

  const paragraphs: string[] = [];
  const chapters: BookContent['chapters'] = [];

  for (const [tag] of opf.matchAll(/<itemref\b[^>]*>/gi)) {
    const href = manifest.get(attribute(tag, 'idref') ?? '');
    const html = href ? read(resolvePath(base, href)) : null;

    htmlToBlocks(html ?? '').forEach((block) => {
      if (block.startsWith(HEADING_MARK)) {
        const title = block.slice(HEADING_MARK.length).trim();

        chapters.push({ title, paragraph: paragraphs.length });
        paragraphs.push(title);
      } else {
        paragraphs.push(block);
      }
    });
  }

  return paragraphs.length > 0 ? { paragraphs, chapters } : null;
}
