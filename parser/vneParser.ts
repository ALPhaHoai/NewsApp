import {parseDocument} from 'htmlparser2';
import {Element} from 'domhandler';
import {selectAll, selectOne} from 'css-select';
import render from 'dom-serializer';
import {getAttributeValue, textContent} from 'domutils';
import {
  ArticleBodyItem,
  ParsedVnExpressArticle,
  ParsedVnExpressFigure,
} from '@type/types.ts';
import {
  getAttr,
  getTextContent,
  pickImageUrlFromBlock,
  selectAllText,
} from '@utils/parser';

const logger = false;
const log = (...args: any[]) => {
  if (logger) {
    console.log(...args);
  }
};
const warn = (...args: any[]) => {
  if (logger) {
    console.warn(...args);
  }
};

export function parseVnExpress(html?: string | null): ParsedVnExpressArticle {
  log('[parseVnExpress] Parsing HTML. Length:', html?.length);
  const doc = parseDocument(html || '');
  log('[parseVnExpress] Document parsed:', !!doc);

  const title =
    getAttr('meta[property="og:title"]', doc, 'content') ||
    getTextContent('title', doc) ||
    getTextContent('h1.title-detail', doc) ||
    '';
  log('[parseVnExpress] Title:', title);

  const description =
    getAttr('meta[property="og:description"]', doc, 'content') ||
    getAttr('meta[name="description"]', doc, 'content') ||
    getTextContent('p.description', doc) ||
    '';
  log('[parseVnExpress] Description:', description);

  const breadcrumbs = selectAllText('ul.breadcrumb li', doc);
  log('[parseVnExpress] Breadcrumbs:', breadcrumbs);

  const category = breadcrumbs.at(-1);
  log('[parseVnExpress] Category:', category);

  const publishDate =
    getAttr('meta[itemprop="datePublished"]', doc, 'content') ||
    getAttr('meta[name="pubdate"]', doc, 'content') ||
    getTextContent('.date', doc);
  log('[parseVnExpress] Publish date:', publishDate);

  let author =
    getTextContent(
      ".fck_detail p[style*='text-align:right'], .fck_detail p[align='right']",
      doc,
    )
      .replace(/^by\s+/i, '')
      .trim() ||
    getAttr('meta[name="author"]', doc, 'content') ||
    '';
  log('[parseVnExpress] Author:', author);

  const url = getAttr('link[rel="canonical"]', doc, 'href') || '';
  log('[parseVnExpress] Canonical URL:', url);

  const article = selectOne('article.fck_detail', doc) as Element | null;
  if (!article) {
    warn('[parseVnExpress] Cannot find article.fck_detail node.');
  } else {
    log('[parseVnExpress] Found article.fck_detail node.');
  }

  const contentHtml = article ? render(article).trim() : '';
  log('[parseVnExpress] contentHtml length:', contentHtml.length);

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
        const text = textContent(node).trim();
        if (text) {
          content.push({
            type: 'paragraph',
            text,
            id: `paragraph_${paraCount++}`,
          });
          log(
            `[parseVnExpress] Added paragraph_${paraCount - 1}:`,
            text.slice(0, 80),
          );
        }
      }
      if (node.name === 'figure') {
        const block = render(node);
        const image = pickImageUrlFromBlock(block);
        const caption =
          textContent(selectOne('figcaption', node) as Element)?.trim() || '';
        if (image) {
          content.push({
            type: 'image',
            src: image,
            caption,
            id: `image_${imgCount++}`,
          });
          log(
            `[parseVnExpress] Added image_${imgCount - 1}:`,
            image,
            '; caption:',
            caption,
          );
        } else {
          log('[parseVnExpress] figure detected but image not found.');
        }
      }
      if (node.attribs?.class?.includes('item_slide_show')) {
        log('[parseVnExpress] Found item_slide_show block.');
        for (const child of node.children ?? []) {
          if (
            child &&
            child.attribs?.class?.includes('block_thumb_slide_show')
          ) {
            const src = child.attribs['data-src'];
            const captionNode = selectOne('.desc_cation', child);
            const caption = captionNode
              ? getTextContent(captionNode).trim()
              : '';
            if (src) {
              content.push({
                type: 'image',
                id: `image_${imgCount++}`,
                src,
                caption,
              });
              log(
                `[parseVnExpress] Added slideshow image_${imgCount - 1}:`,
                src,
                '; caption:',
                caption,
              );
            } else {
              log(
                '[parseVnExpress] block_thumb_slide_show found but data-src is empty.',
              );
            }
          }
        }
      }
    }
    log('[parseVnExpress] Total content items:', content.length);
  } else {
    warn('[parseVnExpress] Article node missing. No content parsed.');
  }

  const figures: ParsedVnExpressFigure[] = [];
  const figureEls = selectAll('figure', article);
  log('[parseVnExpress] Found', figureEls.length, 'figures in article.');
  for (const figure of figureEls) {
    if (!figure) {
      continue;
    }
    const block = render(figure);
    const image = pickImageUrlFromBlock(block);
    const caption = getTextContent('figcaption', figure);
    if (image) {
      figures.push({image, caption});
      log('[parseVnExpress] Figure image:', image, '; caption:', caption);
    } else {
      log('[parseVnExpress] Figure found but image missing.');
    }
  }

  let image =
    getAttr('meta[property="og:image"]', doc, 'content') ||
    (figures[0]?.image ?? '');
  if (!image && article) {
    const firstImg = selectOne('img', article);
    image =
      getAttributeValue(firstImg, 'data-src') ||
      getAttributeValue(firstImg, 'src') ||
      '';
    if (image) {
      log('[parseVnExpress] Found fallback main image:', image);
    }
  }

  if (!image) {
    log('[parseVnExpress] Main image not found.');
  } else {
    log('[parseVnExpress] Main image:', image);
  }

  const result: ParsedVnExpressArticle = {
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
  log('[parseVnExpress] Final parsed article:', {
    ...result,
    content: `(${content.length} items)`,
    figures: `(${figures.length} figures)`,
  });
  return result;
}
