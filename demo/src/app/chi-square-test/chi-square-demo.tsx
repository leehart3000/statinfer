"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { chiSquareTest } from "statinfer";
import { OutcomeProvider, type Outcome } from "@/components/demo-outcome";
import { Field } from "@/components/demo-ui";
import { explainTest } from "@/lib/explain";
import { parseNumbers, parseTable } from "@/lib/format";
import { wording, type Kind } from "./messages";

/** The statinfer code for a test of independence. */
function independenceCode(table: number[][], correction: boolean) {
  const options = ["  table: [", ...table.map((row) => `    [${row.join(", ")}],`), "  ],"];
  if (!correction) options.push("  correction: false,");
  return wrap(options);
}

/** The statinfer code for a goodness-of-fit test. */
function goodnessOfFitCode(observed: number[], proportions: number[] | undefined) {
  const options = [`  observed: [${observed.join(", ")}],`];
  if (proportions) options.push(`  expectedProportions: [${proportions.join(", ")}],`);
  return wrap(options);
}

function wrap(options: string[]) {
  return [
    'import { chiSquareTest, summarize } from "statinfer";',
    "",
    "const result = chiSquareTest({",
    ...options,
    "});",
    "",
    "console.log(summarize(result));",
  ].join("\n");
}

interface ChiSquareInputs {
  kind: Kind;
  setKind: (kind: Kind) => void;
  tableText: string;
  setTableText: (text: string) => void;
  correction: boolean;
  setCorrection: (on: boolean) => void;
  observedText: string;
  setObservedText: (text: string) => void;
  proportionsText: string;
  setProportionsText: (text: string) => void;
}

const ChiSquareContext = createContext<ChiSquareInputs | null>(null);

function useChiSquare(): ChiSquareInputs {
  const inputs = useContext(ChiSquareContext);
  if (!inputs) throw new Error("<ChiSquareForm> must be placed inside <ChiSquareDemo>");
  return inputs;
}

/** Holds the chi-square test's inputs, and shares them and the outcome with the components inside it. */
export function ChiSquareDemo({ children }: { children: React.ReactNode }) {
  const [kind, setKind] = useState<Kind>("independence");
  const [tableText, setTableText] = useState("12, 5\n7, 16");
  const [correction, setCorrection] = useState(true);
  const [observedText, setObservedText] = useState("18, 22, 30, 30");
  const [proportionsText, setProportionsText] = useState("");

  const outcome = useMemo((): Outcome => {
    try {
      if (kind === "independence") {
        const table = parseTable(tableText);
        const result = chiSquareTest({ table, correction });
        return {
          result,
          explanation: explainTest(result, wording[kind]),
          code: independenceCode(table, correction),
        };
      }
      const observed = parseNumbers(observedText);
      // Blank means "all categories equally likely", statinfer's default.
      const proportions = proportionsText.trim() ? parseNumbers(proportionsText) : undefined;
      const result = chiSquareTest({ observed, expectedProportions: proportions });
      return {
        result,
        explanation: explainTest(result, wording[kind]),
        code: goodnessOfFitCode(observed, proportions),
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [kind, tableText, correction, observedText, proportionsText]);

  return (
    <ChiSquareContext
      value={{
        kind,
        setKind,
        tableText,
        setTableText,
        correction,
        setCorrection,
        observedText,
        setObservedText,
        proportionsText,
        setProportionsText,
      }}
    >
      <OutcomeProvider outcome={outcome}>{children}</OutcomeProvider>
    </ChiSquareContext>
  );
}

/** The inputs. */
export function ChiSquareForm() {
  const s = useChiSquare();
  return (
    <div className="demo-form">
      <Field label="Test">
        <select value={s.kind} onChange={(e) => s.setKind(e.target.value as Kind)}>
          <option value="independence">Independence: are the rows and columns of a table related?</option>
          <option value="goodness-of-fit">Goodness-of-fit: do counts match expected proportions?</option>
        </select>
      </Field>

      {s.kind === "independence" ? (
        <>
          <Field label="Table of counts: one row per line, with values separated by commas or spaces">
            <textarea rows={4} value={s.tableText} onChange={(e) => s.setTableText(e.target.value)} />
          </Field>
          <label className="checkbox">
            <input type="checkbox" checked={s.correction} onChange={(e) => s.setCorrection(e.target.checked)} />
            Apply Yates&apos; continuity correction (2×2 tables only)
          </label>
        </>
      ) : (
        <>
          <Field label="Observed counts in each category">
            <textarea rows={2} value={s.observedText} onChange={(e) => s.setObservedText(e.target.value)} />
          </Field>
          <Field label="Expected proportions (optional): one per category, adding up to 1. Leave blank for equal proportions.">
            <textarea rows={2} value={s.proportionsText} onChange={(e) => s.setProportionsText(e.target.value)} />
          </Field>
        </>
      )}
    </div>
  );
}