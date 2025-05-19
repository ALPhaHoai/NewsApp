import {selectAll, selectOne} from 'css-select';
import {getAttributeValue, textContent} from 'domutils';
import {Document, Element} from 'domhandler';
import {parseDocument} from 'htmlparser2';

/**
 * Helper: Get attribute value from first matched element, or ''.
 */
export function getAttr(
  selector: string,
  doc: Document | Element,
  attr: string,
): string {
  const elem = selectOne(selector, doc) as Element | null;
  if (!elem) {
    return '';
  }
  return getAttributeValue(elem, attr) || '';
}

/**
 * Helper: Get trimmed text content from first matched element.
 */
export function getTextContent(
  selector: string,
  doc: Document | Element,
): string {
  let elem = selectOne(selector, doc) as Element | null;
  if (!elem) {
    return '';
  }
  return textContent(elem)?.trim() || '';
}

/**
 * Helper: Get trimmed text contents from all matched elements, filter out empty.
 */
export function selectAllText(
  selector: string,
  doc: Document | Element,
): string[] {
  return selectAll(selector, doc)
    .map(el => textContent(el).trim())
    .filter(Boolean);
}

/**
 * Get the preferred image URL from a <figure> block/HTML string.
 */
export function pickImageUrlFromBlock(block: string): string | null {
  const doc = parseDocument(block);

  // 1. Look for <source data-srcset="...">
  const source = selectOne('source', doc) as Element | null;
  if (!source) {
    return null;
  }

  const srcset = source?.attribs?.['data-srcset'];
  if (srcset) {
    const best = pickBestSrcset(srcset);
    if (best && !isSvgUrl(best)) {
      return best;
    }
  }

  // 2. Fallback to <img src="...">
  const img = selectOne('img', doc) as Element | null;
  if (!img) {
    return null;
  }

  const src = img?.attribs?.['data-src'] || img?.attribs?.src;
  if (
    src &&
    !isSvgUrl(src) &&
    !src.startsWith('data:image/gif;base64,R0lGODlhAQABAAAAA')
  ) {
    return src;
  }

  return null;
}

/**
 * From a srcset string, pick the last/best candidate (usually the largest image).
 */
export function pickBestSrcset(srcset: string): string | null {
  if (!srcset) {
    return null;
  }
  const urls = srcset
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (!urls.length) {
    return null;
  }
  // Take the last entry's URL (before whitespace)
  return urls[urls.length - 1].split(' ')[0];
}

/**
 * Detect "url" is SVG (ends in .svg or is a svg data url).
 */
export function isSvgUrl(url: string): boolean {
  if (!url) {
    return false;
  }
  if (url.startsWith('data:image/svg')) {
    return true;
  }
  const cleaned = url.split('?')[0].split('#')[0];
  return cleaned.toLowerCase().endsWith('.svg');
}
