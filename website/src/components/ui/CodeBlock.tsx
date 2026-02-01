import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang: 'typescript' | 'solidity' | 'json'
  filename?: string
}

export async function CodeBlock({ code, lang, filename }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: 'github-dark', // Dark theme matching Obsidian Precision
  })

  return (
    <div className="code-block">
      {filename && (
        <div className="text-xs text-[#A3A3A3] mb-2 font-mono">{filename}</div>
      )}
      <div
        className="[&>pre]:bg-transparent [&>pre]:p-0 [&>pre]:m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
