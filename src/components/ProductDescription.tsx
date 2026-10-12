/**
 * Renders product description with the same gaps, paragraphs, and bullets
 * the admin typed (plain text from the textarea).
 */
export function ProductDescription({ text }: { text: string }) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return null;

  const blocks = normalized.split(/\n{2,}/);

  return (
    <div className="product-description mt-5 max-w-md space-y-4 text-[var(--muted)]">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trimEnd());
        const nonEmpty = lines.filter((l) => l.trim().length > 0);
        const allBullets =
          nonEmpty.length > 0 &&
          nonEmpty.every(
            (l) =>
              /^[-*•▪◦]\s+/.test(l.trim()) || /^\d+[.)]\s+/.test(l.trim())
          );

        if (allBullets) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 leading-relaxed">
              {nonEmpty.map((line, j) => (
                <li key={j}>
                  {line
                    .trim()
                    .replace(/^[-*•▪◦]\s+/, "")
                    .replace(/^\d+[.)]\s+/, "")}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="whitespace-pre-wrap leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}
