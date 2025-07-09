import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeHighlight,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ]}
        components={{
          // Style code blocks
          code: ({
            className,
            children,
            ...props
          }: React.HTMLAttributes<HTMLElement> & {
            children?: React.ReactNode;
          }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !className?.includes("language-");
            return !isInline && match ? (
              <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Style headings
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-4 mt-8 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mb-3 mt-6 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mb-2 mt-3 first:mt-0">
              {children}
            </h4>
          ),
          // Style paragraphs
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">{children}</p>
          ),
          // Style lists
          ul: ({ children }) => (
            <ul className="mb-4 space-y-1 list-disc list-inside">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-1 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          // Style links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic mb-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          // Style tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border-b border-border">{children}</td>
          ),
          // Style horizontal rules
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
