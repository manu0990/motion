export interface ContentBlock {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

export function parseStringIntoBlocks(markdownString: string): ContentBlock[] {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const parts = markdownString.split(codeBlockRegex);

  const blocks: ContentBlock[] = [];

  let i = 0;
  while (i < parts.length) {
    const textPart = parts[i];

    if (textPart && textPart.trim() !== '') {
      blocks.push({
        type: 'text',
        content: textPart.trim(),
      });
    }

    i++;
    if (i < parts.length) {
      const language = parts[i];
      const codeContent = parts[i + 1];

      if (codeContent !== undefined) {
        blocks.push({
          type: 'code',
          content: codeContent,
          language: language || 'plaintext',
        });
      }

      i += 2;
    }
  }

  return blocks;
}
