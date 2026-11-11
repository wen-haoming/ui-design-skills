import type { ArticleBlock, ArticleBenchmark } from './types';

/** 与 benchmarks/article-sample.md 一致的纯文本（供复制对照） */
export function articleToPlainText(bench: ArticleBenchmark): string {
  const lines: string[] = [];
  for (const block of bench.article.blocks) {
    if (block.type === 'title') {
      lines.push(`# ${block.text}`, '');
    } else if (block.type === 'heading' && block.headingLevel === 2) {
      lines.push(`## ${block.text}`, '');
    } else if (block.type === 'paragraph') {
      lines.push(block.text, '');
    } else if (block.type === 'list' && !block.ordered) {
      for (const item of block.items) lines.push(`- ${item}`);
      lines.push('');
    } else if (block.type === 'quote') {
      lines.push(`> ${block.text}`, '');
    }
  }
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n') + '\n';
}

export function articleClipboardText(bench: ArticleBenchmark): string {
  const lines: string[] = [];
  lines.push(bench.article.title, '');
  for (const block of bench.article.blocks) {
    if (block.id === 'title') continue;
    if (block.type === 'heading') {
      lines.push(block.text, '');
    } else if (block.type === 'paragraph') {
      lines.push(block.text, '');
    } else if (block.type === 'list') {
      for (const item of block.items) lines.push(`• ${item}`);
      lines.push('');
    } else if (block.type === 'quote') {
      lines.push(`「${block.text}」`, '');
    }
  }
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n');
}
