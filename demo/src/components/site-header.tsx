import Image from "next/image";
import Link from "next/link";
import { demos } from "@/demos";
import ThemeToggle from "./theme-toggle";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <Image src="/logo.svg" alt="" width={28} height={28} unoptimized />
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