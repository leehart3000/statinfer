import Image from "next/image";
import Link from "next/link";
import NavLinks from "./nav-links";
import ThemeToggle from "./theme-toggle";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <Image src="/logo.svg" alt="" width={28} height={28} unoptimized />
        statinfer
      </Link>
      <nav aria-label="Demos">
        <NavLinks />
      </nav>
      <ThemeToggle />
    </header>
  );
}