/**
 * A link to another website. Opens in a new tab, shows a small arrow, and
 * tells screen reader users that it opens a new tab.
 */
export default function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}