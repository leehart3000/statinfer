"use client";

import { createContext, useContext } from "react";
import { summarize, type TestResult } from "statinfer";
import { ValidDataNote } from "./demo-ui";

/** What a demo produces from its inputs: a result with its explanation and code, or an error message. */
export type Outcome = { result: TestResult; explanation: string[]; code: string } | { error: string };

const OutcomeContext = createContext<Outcome | null>(null);

/** Shares a demo's outcome with the result sections placed inside it. */
export function OutcomeProvider({ outcome, children }: { outcome: Outcome; children: React.ReactNode }) {
  return <OutcomeContext value={outcome}>{children}</OutcomeContext>;
}

function useOutcome(): Outcome {
  const outcome = useContext(OutcomeContext);
  if (!outcome) throw new Error("Demo result sections must be placed inside a demo, such as <TTestDemo>");
  return outcome;
}

/** The result table, or the error message if the input isn't valid. */
export function DemoResults() {
  const outcome = useOutcome();
  return "error" in outcome ? (
    <p role="alert" className="error">
      {outcome.error}
    </p>
  ) : (
    <pre>{summarize(outcome.result)}</pre>
  );
}

/** The plain-language explanation. */
export function DemoMeaning() {
  const outcome = useOutcome();
  if ("error" in outcome) return <ValidDataNote />;
  return (
    <>
      {outcome.explanation.map((sentence) => (
        <p key={sentence}>{sentence}</p>
      ))}
    </>
  );
}

/** The JavaScript code that reproduces the result. */
export function DemoCode() {
  const outcome = useOutcome();
  if ("error" in outcome) return <ValidDataNote />;
  return <pre>{outcome.code}</pre>;
}

/** The raw result object, as JSON, in a collapsible box. */
export function DemoJson() {
  const outcome = useOutcome();
  if ("error" in outcome) return <ValidDataNote />;
  return (
    <details>
      <summary>Show the raw result as JSON</summary>
      <pre>{JSON.stringify(outcome.result, null, 2)}</pre>
    </details>
  );
}