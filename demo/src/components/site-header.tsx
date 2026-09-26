import Link from "next/link";
import { demos } from "@/demos";
import ThemeToggle from "./theme-toggle";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        statinfer
      </Link>
      <nav aria-label="Demos">
        <ul>
          {demos.map((demo) => (
            <li key={demo.slug}>
              <Link href={`/${demo.slug}`}>{demo.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <ThemeToggle />
    </header>
  );
}