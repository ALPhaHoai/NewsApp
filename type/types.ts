import React from 'react';

export type NewsItemType = {
  id: number;
  title: string;
  image?: string;
  images?: string[];
  source: string;
  time: string;
  link?: string;
};

export type ArticleBodyProps = {
  items: ArticleItem[];
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

export type ArticleItem = ParagraphItem | ImageItem;

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
