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

export function parseVnExpress(html?: string | null): ParsedVnExpressArticle {
  const doc = parseDocument(html || '');

  const title =
    getAttr('meta[property="og:title"]', doc, 'content') ||
    getTextContent('title', doc) ||
    getTextContent('h1.title-detail', doc) ||
    '';

  const description =
    getAttr('meta[property="og:description"]', doc, 'content') ||
    getAttr('meta[name="description"]', doc, 'content') ||
    getTextContent('p.description', doc) ||
    '';

  const breadcrumbs = selectAllText('ul.breadcrumb li', doc);
  const category = breadcrumbs.at(-1);

  const publishDate =
    getAttr('meta[itemprop="datePublished"]', doc, 'content') ||
    getAttr('meta[name="pubdate"]', doc, 'content') ||
    getTextContent('.date', doc);

  let author =
    getTextContent(
      ".fck_detail p[style*='text-align:right'], .fck_detail p[align='right']",
      doc,
    )
      .replace(/^by\s+/i, '')
      .trim() ||
    getAttr('meta[name="author"]', doc, 'content') ||
    '';

  const url = getAttr('link[rel="canonical"]', doc, 'href') || '';

  const article = selectOne('article.fck_detail', doc) as Element | null;
  const contentHtml = article ? render(article).trim() : '';

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
    const block = render(figure);
    const image = pickImageUrlFromBlock(block);
    const caption =
      getText(selectOne('figcaption', figure) as Element)?.trim() || '';
    if (image) {
      figures.push({image, caption});
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
