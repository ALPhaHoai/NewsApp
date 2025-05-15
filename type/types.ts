import React from 'react';

export type NewsItemType = {
  id: number;
  title: string;
  image?: string;
  images?: string[];
  source: string;
  time: string;
  link?: string;
  description?: string;
};

export type ArticleBodyProps = {
  article: NewsItemType;
  items: ArticleBodyItem[];
  currentSpokenId?: string | null;
  currentSpokenSubTextId?: string | null;
};

export type ArticleBodyRef = {
  scrollToSubText: (itemId: string, subTextId: string) => void;
};

export type ParagraphItem = {
  type: 'paragraph';
  text: string;
  id: string;
  subTexts?: ParagraphSubText[];
};

export type ImageItem = {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
  id?: string;
};

export type ParagraphSubText = {
  text: string;
  id: string; // uuid
};

export type ArticleBodyItem = ParagraphItem | ImageItem;

export type TabType = {
  label: string;
  Icon: React.ComponentType<{color: string}>;
};

export type BottomNavigationBarProps = {
  initialTabIndex?: number;
  onTabPress?: (index: number) => void;
};

export type NewsItemProps = {
  item: NewsItemType;
  onPress?: () => void;
};

export interface ParsedVnExpressFigure {
  image: string;
  caption?: string;
}

export interface ParsedVnExpressArticle {
  url?: string;
  title: string;
  description: string;
  breadcrumbs: string[];
  category?: string; // the leaf
  publishDate: string;
  author: string;
  image: string;
  contentHtml: string;
  content: ArticleBodyItem[];
  figures: ParsedVnExpressFigure[];
}
