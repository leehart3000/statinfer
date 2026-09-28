"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { anova } from "statinfer";
import { OutcomeProvider, type Outcome } from "@/components/demo-outcome";
import { Field } from "@/components/demo-ui";
import { explainTest } from "@/lib/explain";
import { parseTable } from "@/lib/format";
import { wording } from "./messages";

/** The statinfer code that reproduces the result. */
function codeFor(groups: number[][]) {
  return [
    'import { anova, summarize } from "statinfer";',
    "",
    "const result = anova({",
    "  groups: [",
    ...groups.map((group) => `    [${group.join(", ")}],`),
    "  ],",
    "});",
    "",
    "console.log(summarize(result));",
  ].join("\n");
}

interface AnovaInputs {
  groupsText: string;
  setGroupsText: (text: string) => void;
}

const AnovaContext = createContext<AnovaInputs | null>(null);

function useAnova(): AnovaInputs {
  const inputs = useContext(AnovaContext);
  if (!inputs) throw new Error("<AnovaForm> must be placed inside <AnovaDemo>");
  return inputs;
}

/** Holds the ANOVA's inputs, and shares them and the outcome with the components inside it. */
export function AnovaDemo({ children }: { children: React.ReactNode }) {
  const [groupsText, setGroupsText] = useState("23, 25, 21, 27, 24\n30, 28, 33, 29\n22, 20, 24, 23, 21, 25");

  const outcome = useMemo((): Outcome => {
    try {
      const groups = parseTable(groupsText);
      const result = anova({ groups });
      return { result, explanation: explainTest(result, wording), code: codeFor(groups) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [groupsText]);

  return (
    <AnovaContext value={{ groupsText, setGroupsText }}>
      <OutcomeProvider outcome={outcome}>{children}</OutcomeProvider>
    </AnovaContext>
  );
}

/** The inputs. */
export function AnovaForm() {
  const s = useAnova();
  return (
    <div className="demo-form">
      <Field label="Groups: one group per line, with values separated by commas or spaces. Groups can be different sizes.">
        <textarea rows={5} value={s.groupsText} onChange={(e) => s.setGroupsText(e.target.value)} />
      </Field>
    </div>
  );
}