"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { demos } from "@/demos";

/** The demo links in the header, with the current page marked. */
export default function NavLinks() {
  const pathname = usePathname();
  return (
    <ul>
      {demos.map((demo) => {
        const href = `/${demo.slug}`;
        return (
          <li key={demo.slug}>
            <Link href={href} aria-current={pathname === href ? "page" : undefined}>
              {demo.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}