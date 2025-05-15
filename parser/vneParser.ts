import {parseDocument} from 'htmlparser2';
import {Element, Document} from 'domhandler';
import {selectAll, selectOne} from 'css-select';
import {getAttributeValue, getText, getOuterHTML} from 'domutils';
import {
  ArticleBodyItem,
  ParsedVnExpressArticle,
  ParsedVnExpressFigure,
} from '@type/types.ts';

export function parseVnExpress(html?: string | null): ParsedVnExpressArticle {
  const doc = parseDocument(html || '');

  const getAttr = (selector: string, attr: string) =>
    getAttributeValue(selectOne(selector, doc), attr) || '';

  const getTextContent = (selector: string) =>
    getText(selectOne(selector, doc) as Element)?.trim() || '';

  const selectAllText = (selector: string) =>
    selectAll(selector, doc)
      .map(el => getText(el).trim())
      .filter(Boolean);

  const title =
    getAttr('meta[property="og:title"]', 'content') ||
    getTextContent('title') ||
    getTextContent('h1.title-detail') ||
    '';

  const description =
    getAttr('meta[property="og:description"]', 'content') ||
    getAttr('meta[name="description"]', 'content') ||
    getTextContent('p.description') ||
    '';

  const breadcrumbs = selectAllText('ul.breadcrumb li');
  const category = breadcrumbs.at(-1);

  const publishDate =
    getAttr('meta[itemprop="datePublished"]', 'content') ||
    getAttr('meta[name="pubdate"]', 'content') ||
    getTextContent('.date');

  let author =
    getTextContent(
      ".fck_detail p[style*='text-align:right'], .fck_detail p[align='right']",
    )
      .replace(/^by\s+/i, '')
      .trim() ||
    getAttr('meta[name="author"]', 'content') ||
    '';

  const url = getAttr('link[rel="canonical"]', 'href') || '';

  const article = selectOne('article.fck_detail', doc) as Element;
  const contentHtml = article ? getOuterHTML(article).trim() : '';

  const content: ArticleBodyItem[] = [];

  if (article) {
    const children = article.children ?? [];

    let paraCount = 1;
    let imgCount = 1;

    for (const node of children) {
      if (node.type !== 'tag') {
        continue;
      }

      if (
        node.name === 'p' &&
        !node.attribs?.class?.includes('Image') &&
        !node.attribs?.class?.includes('description')
      ) {
        const text = getText(node).trim();
        if (text) {
          content.push({
            type: 'paragraph',
            text,
            id: `paragraph_${paraCount++}`,
          });
        }
      }

      if (node.name === 'figure') {
        const block = getOuterHTML(node);
        const image = pickImageUrlFromBlock(block);
        const caption =
          getText(selectOne('figcaption', node) as Element)?.trim() || '';
        if (image) {
          content.push({
            type: 'image',
            src: image,
            caption,
            id: `image_${imgCount++}`,
          });
        }
      }

      if (node.attribs?.class?.includes('item_slide_show')) {
        for (const child of node.children ?? []) {
          if (
            child &&
            child.attribs?.class?.includes('block_thumb_slide_show')
          ) {
            const src = child.attribs['data-src'];
            const captionNode = selectOne('.desc_cation', child);
            const caption = captionNode ? getText(captionNode).trim() : '';

            if (src) {
              content.push({
                type: 'image',
                id: `image_${imgCount++}`,
                src,
                caption,
              });
            }
          }
        }
      }
    }
  }

  const figures: ParsedVnExpressFigure[] = [];
  const figureEls = selectAll('figure', article);
  for (const figure of figureEls) {
    const block = getOuterHTML(figure);
    const image = pickImageUrlFromBlock(block);
    const caption =
      getText(selectOne('figcaption', figure) as Element)?.trim() || '';
    if (image) {
      figures.push({image, caption});
    }
  }

  let image =
    getAttr('meta[property="og:image"]', 'content') ||
    (figures[0]?.image ?? '');

  if (!image && article) {
    const firstImg = selectOne('img', article);
    image =
      getAttributeValue(firstImg, 'data-src') ||
      getAttributeValue(firstImg, 'src') ||
      '';
  }

  return {
    url,
    title,
    description,
    breadcrumbs,
    category,
    publishDate,
    author,
    image,
    contentHtml,
    content,
    figures,
  };
}

// Helpers (same as before)
function pickImageUrlFromBlock(block: string): string | null {
  const doc = parseDocument(block);

  // 1. Look for <source data-srcset="...">
  const source = selectOne('source', doc) as Element;
  const srcset = source?.attribs?.['data-srcset'];
  if (srcset) {
    const best = pickBestSrcset(srcset);
    if (best && !isSvgUrl(best)) {
      return best;
    }
  }

  // 2. Fallback to <img src="...">
  const img = selectOne('img', doc) as Element;
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

function pickBestSrcset(srcset: string): string | null {
  if (!srcset) {
    return null;
  }
  const urls = srcset
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (urls.length === 0) {
    return null;
  }
  return urls[urls.length - 1].split(' ')[0];
}

function isSvgUrl(url: string): boolean {
  if (!url) {
    return false;
  }
  if (url.startsWith('data:image/svg')) {
    return true;
  }
  const cleaned = url.split('?')[0].split('#')[0];
  return cleaned.toLowerCase().endsWith('.svg');
}
