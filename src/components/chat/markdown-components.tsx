import Image from 'next/image';
import type { Components } from 'react-markdown';

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl md:text-2xl font-bold text-foreground mt-6 mb-3 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg md:text-xl font-semibold text-foreground mt-5 mb-2 leading-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base md:text-lg font-semibold text-foreground mt-4 mb-2 leading-tight">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-base text-muted-foreground mb-3 leading-relaxed">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-base font-mono text-foreground">
          {children}
        </code>
      )
    }
    return (
      <code className="text-base font-mono">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-muted rounded-lg p-3 my-4 overflow-x-auto text-base font-mono leading-relaxed border border-border">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary bg-accent pl-4 py-2 my-4 text-base text-muted-foreground italic rounded-r-lg">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="space-y-1 my-3 pl-4">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-1 my-3 list-decimal list-inside pl-4">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-base text-muted-foreground leading-relaxed flex items-start gap-2">
      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  img: ({ src, alt }) => (
    <div className="my-4">
      <Image
        src={typeof src === 'string' ? src : ''}
        alt={alt || ''}
        width={400}
        height={200}
        className="rounded-lg shadow-lg max-w-full h-auto border border-border"
      />
    </div>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-border">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody>
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-border">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="border border-border px-3 py-2 text-left text-base font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 text-base text-muted-foreground">
      {children}
    </td>
  ),
};

// Components specific to UnifiedMessage that exclude certain elements
export const unifiedMessageMarkdownComponents: Components = {
  ...markdownComponents,
  // Prevent code blocks from being rendered here as they are handled separately
  pre: () => null,
};
