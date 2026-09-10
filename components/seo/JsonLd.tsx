// Server component. Renders one or more Schema.org JSON-LD blocks.
// Next.js recommends putting <script type="application/ld+json"> directly in
// the page tree rather than in <head>.
type Json = Record<string, unknown>

export default function JsonLd({ data }: { data: Json | Json[] }) {
  const blocks = Array.isArray(data) ? data : [data]
  return (
    <>
      {blocks.map((block, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  )
}
