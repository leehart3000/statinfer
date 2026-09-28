"use client";

import Link from "next/link";
import { useState } from "react";
import { guide } from "@/lib/test-guide";

/** A step-by-step "which test should I use?" guide, ending with a link to the right demo. */
export default function TestGuide() {
  // The steps visited so far, so "Back" can return to the previous one.
  const [path, setPath] = useState<string[]>(["start"]);
  const node = guide[path[path.length - 1]];

  return (
    <div className="guide" aria-live="polite">
      {"question" in node ? (
        <>
          <p className="guide-question">{node.question}</p>
          <ul className="guide-answers">
            {node.answers.map((answer) => (
              <li key={answer.next}>
                <button type="button" onClick={() => setPath([...path, answer.next])}>
                  {answer.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="guide-question">
          Use the <Link href={node.href}>{node.title}</Link>. {node.note}
        </p>
      )}

      {path.length > 1 && (
        <p className="guide-nav">
          <button type="button" onClick={() => setPath(path.slice(0, -1))}>
            ← Back
          </button>
          <button type="button" onClick={() => setPath(["start"])}>
            Start again
          </button>
        </p>
      )}
    </div>
  );
}