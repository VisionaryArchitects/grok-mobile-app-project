function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="rounded-sm bg-bg px-1 py-0.5 font-mono text-[0.85em] text-accent">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-medium text-fg">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

export function MarkdownLite({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2 text-[15px] leading-relaxed text-fg">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*([-*]|\d+\.)\s+/.test(l));
        if (isList) {
          return (
            <ul key={bi} className="space-y-1 pl-4">
              {lines.map((l, li) => (
                <li key={li} className="list-disc text-fg">
                  {renderInline(l.replace(/^\s*([-*]|\d+\.)\s+/, ""), `${bi}-${li}`)}
                </li>
              ))}
            </ul>
          );
        }
        if (block.startsWith("```")) {
          const inner = block.replace(/^```[a-zA-Z0-9]*\n?/, "").replace(/```$/, "");
          return (
            <pre
              key={bi}
              className="overflow-x-auto rounded-lg bg-bg p-3 font-mono text-[12px] leading-snug text-fg"
            >
              {inner}
            </pre>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-wrap">
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 ? <br /> : null}
                {renderInline(line, `${bi}-${li}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
