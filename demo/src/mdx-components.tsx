import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import ExternalLink from "@/components/external-link";

/** Turns heading text like "When to use a t-test" into an id like "when-to-use-a-t-test". */
function slugify(children: React.ReactNode): string | undefined {
  return typeof children === "string"
    ? children.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : undefined;
}

/** Markdown links: other websites open in a new tab; pages on this site don't. */
function MdxLink({ href = "", children }: React.ComponentProps<"a">) {
  return href.startsWith("http") ? (
    <ExternalLink href={href}>{children}</ExternalLink>
  ) : (
    <Link href={href}>{children}</Link>
  );
}

/** Section headings get an id, so other links can jump straight to them. */
function MdxHeading2({ children }: React.ComponentProps<"h2">) {
  return <h2 id={slugify(children)}>{children}</h2>;
}

const components: MDXComponents = {
  a: MdxLink,
  h2: MdxHeading2,
};

export function useMDXComponents(): MDXComponents {
  return components;
}