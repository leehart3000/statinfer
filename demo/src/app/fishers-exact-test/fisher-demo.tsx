"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { fishersExactTest, type Alternative } from "statinfer";
import { OutcomeProvider, type Outcome } from "@/components/demo-outcome";
import { Field } from "@/components/demo-ui";
import { explainResult } from "@/lib/explain";
import { parseNumber } from "@/lib/format";
import { quantity } from "./messages";

type Table = [[number, number], [number, number]];

/** The statinfer code that reproduces the result, showing only non-default options. */
function codeFor(table: Table, alternative: Alternative) {
  const options = [`  table: [[${table[0].join(", ")}], [${table[1].join(", ")}]],`];
  if (alternative !== "two-sided") options.push(`  alternative: "${alternative}",`);
  return [
    'import { fishersExactTest, summarize } from "statinfer";',
    "",
    "const result = fishersExactTest({",
    ...options,
    "});",
    "",
    "console.log(summarize(result));",
  ].join("\n");
}

interface FisherInputs {
  cells: [string, string, string, string];
  setCell: (index: number, text: string) => void;
  alternative: Alternative;
  setAlternative: (alternative: Alternative) => void;
}

const FisherContext = createContext<FisherInputs | null>(null);

function useFisher(): FisherInputs {
  const inputs = useContext(FisherContext);
  if (!inputs) throw new Error("<FisherForm> must be placed inside <FisherDemo>");
  return inputs;
}

/** Holds Fisher's exact test's inputs, and shares them and the outcome with the components inside it. */
export function FisherDemo({ children }: { children: React.ReactNode }) {
  // The "lady tasting tea" experiment: rows are the true order (milk first, tea first),
  // columns are her guesses. She identified 3 of the 4 milk-first cups correctly.
  const [cells, setCells] = useState<[string, string, string, string]>(["3", "1", "1", "3"]);
  const [alternative, setAlternative] = useState<Alternative>("greater");

  function setCell(index: number, text: string) {
    setCells((current) => {
      const next = [...current] as [string, string, string, string];
      next[index] = text;
      return next;
    });
  }

  const outcome = useMemo((): Outcome => {
    try {
      const labels = ["Row 1, column 1", "Row 1, column 2", "Row 2, column 1", "Row 2, column 2"];
      const [a, b, c, d] = cells.map((text, i) => parseNumber(text, labels[i]!));
      const table: Table = [
        [a!, b!],
        [c!, d!],
      ];
      const result = fishersExactTest({ table, alternative });
      return {
        result,
        // "No association" means an odds ratio of 1.
        explanation: explainResult(result, quantity, 1),
        code: codeFor(table, alternative),
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [cells, alternative]);

  return (
    <FisherContext value={{ cells, setCell, alternative, setAlternative }}>
      <OutcomeProvider outcome={outcome}>{children}</OutcomeProvider>
    </FisherContext>
  );
}

/** A whole-number input for one cell of the table. */
function CellInput({ index, label }: { index: number; label: string }) {
  const s = useFisher();
  return (
    <Field label={label}>
      <input
        type="number"
        min={0}
        step={1}
        value={s.cells[index]}
        onChange={(e) => s.setCell(index, e.target.value)}
      />
    </Field>
  );
}

/** The inputs. */
export function FisherForm() {
  const s = useFisher();
  return (
    <div className="demo-form">
      <div className="field-row">
        <CellInput index={0} label="Row 1, column 1" />
        <CellInput index={1} label="Row 1, column 2" />
      </div>
      <div className="field-row">
        <CellInput index={2} label="Row 2, column 1" />
        <CellInput index={3} label="Row 2, column 2" />
      </div>

      <Field label="Alternative hypothesis">
        <select value={s.alternative} onChange={(e) => s.setAlternative(e.target.value as Alternative)}>
          <option value="two-sided">Two-sided: associated, in either direction</option>
          <option value="greater">Greater: odds ratio above 1 (the diagonal counts are larger)</option>
          <option value="less">Less: odds ratio below 1 (the off-diagonal counts are larger)</option>
        </select>
      </Field>
    </div>
  );
}