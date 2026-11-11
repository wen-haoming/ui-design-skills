export type TypographyId = 'reading-longform' | 'editorial-magazine' | 'compact-notes';

export type ArticleBlock =
  | { id: string; type: 'title'; headingLevel: 1; text: string }
  | { id: string; type: 'heading'; headingLevel: 2; text: string }
  | { id: string; type: 'paragraph'; text: string; inlines?: { text: string }[] }
  | { id: string; type: 'list'; ordered: boolean; items: string[] }
  | { id: string; type: 'quote'; text: string };

export interface ArticleBenchmark {
  id: string;
  title: string;
  disclaimer: string;
  article: { title: string; blocks: ArticleBlock[] };
}
