import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type GameRulesMarkdownProps = {
    content: string
}

export const GameRulesMarkdown = ({ content }: GameRulesMarkdownProps) => {
    return (
        <div className="game-rules-markdown text-stone-300 text-sm leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-amber-100/95 mb-6 mt-2">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-bold text-stone-100 mb-4 mt-10 flex items-baseline gap-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-semibold text-amber-200/90 mb-3 mt-6">{children}</h3>
                    ),
                    p: ({ children }) => <p className="mb-4 text-stone-400">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 ml-5 list-disc space-y-2 text-stone-400">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 ml-5 list-decimal space-y-2 text-stone-400">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-stone-200">{children}</strong>,
                    em: ({ children }) => <em className="text-stone-300">{children}</em>,
                    hr: () => <hr className="my-8 border-stone-700/60" />,
                    blockquote: ({ children }) => (
                        <blockquote className="mb-4 border-l-4 border-amber-500/40 pl-4 text-stone-400 italic">
                            {children}
                        </blockquote>
                    ),
                    code: ({ className, children }) => {
                        const isBlock = Boolean(className)
                        if (isBlock) {
                            return (
                                <code className="block overflow-x-auto rounded-lg border border-stone-700/60 bg-stone-900/80 p-4 font-mono text-xs text-amber-100/90">
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-xs text-amber-200/90">
                                {children}
                            </code>
                        )
                    },
                    pre: ({ children }) => (
                        <pre className="mb-4 overflow-x-auto rounded-xl border border-stone-700/60 bg-stone-900/50 p-4">
                            {children}
                        </pre>
                    ),
                    table: ({ children }) => (
                        <div className="mb-6 overflow-x-auto rounded-xl border border-stone-700/60 bg-stone-900/50">
                            <table className="w-full min-w-[480px] border-collapse">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="border-b border-stone-700/60 bg-stone-800/60">{children}</thead>
                    ),
                    tbody: ({ children }) => <tbody className="text-stone-300">{children}</tbody>,
                    tr: ({ children }) => (
                        <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">{children}</tr>
                    ),
                    th: ({ children }) => (
                        <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90">{children}</th>
                    ),
                    td: ({ children }) => <td className="py-3.5 px-4 text-sm">{children}</td>,
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
