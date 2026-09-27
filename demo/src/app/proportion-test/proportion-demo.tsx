"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { proportionTest, type Alternative } from "statinfer";
import { OutcomeProvider, type Outcome } from "@/components/demo-outcome";
import { Field } from "@/components/demo-ui";
import { explainResult } from "@/lib/explain";
import { parseNumber } from "@/lib/format";
import { quantity, type Kind } from "./messages";

/** The statinfer code that reproduces the result, showing only non-default options. */
function codeFor(
  kind: Kind,
  counts: { successes: number[]; trials: number[] },
  p: number,
  alternative: Alternative,
  confidence: number,
) {
  const options =
    kind === "one-sample"
      ? [`  successes: ${counts.successes[0]},`, `  trials: ${counts.trials[0]},`]
      : [`  successes: [${counts.successes.join(", ")}],`, `  trials: [${counts.trials.join(", ")}],`];
  if (kind === "one-sample" && p !== 0.5) options.push(`  p: ${p},`);
  if (alternative !== "two-sided") options.push(`  alternative: "${alternative}",`);
  if (confidence !== 0.95) options.push(`  confidenceLevel: ${confidence},`);
  return [
    'import { proportionTest, summarize } from "statinfer";',
    "",
    "const result = proportionTest({",
    ...options,
    "});",
    "",
    "console.log(summarize(result));",
  ].join("\n");
}

interface ProportionInputs {
  kind: Kind;
  setKind: (kind: Kind) => void;
  successes: string;
  setSuccesses: (text: string) => void;
  trials: string;
  setTrials: (text: string) => void;
  p: string;
  setP: (text: string) => void;
  successes1: string;
  setSuccesses1: (text: string) => void;
  trials1: string;
  setTrials1: (text: string) => void;
  successes2: string;
  setSuccesses2: (text: string) => void;
  trials2: string;
  setTrials2: (text: string) => void;
  alternative: Alternative;
  setAlternative: (alternative: Alternative) => void;
  confidence: string;
  setConfidence: (text: string) => void;
}

const ProportionContext = createContext<ProportionInputs | null>(null);

function useProportion(): ProportionInputs {
  const inputs = useContext(ProportionContext);
  if (!inputs) throw new Error("<ProportionForm> must be placed inside <ProportionDemo>");
  return inputs;
}

/** Holds the proportion test's inputs, and shares them and the outcome with the components inside it. */
export function ProportionDemo({ children }: { children: React.ReactNode }) {
  const [kind, setKind] = useState<Kind>("one-sample");
  // One sample: 58 heads in 100 coin flips.
  const [successes, setSuccesses] = useState("58");
  const [trials, setTrials] = useState("100");
  const [p, setP] = useState("0.5");
  // Two samples: 45 of 120 visitors compared with 30 of 110.
  const [successes1, setSuccesses1] = useState("45");
  const [trials1, setTrials1] = useState("120");
  const [successes2, setSuccesses2] = useState("30");
  const [trials2, setTrials2] = useState("110");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");
  const [confidence, setConfidence] = useState("0.95");

  const outcome = useMemo((): Outcome => {
    try {
      const confidenceLevel = Number(confidence);
      if (kind === "one-sample") {
        const s = parseNumber(successes, "Successes");
        const n = parseNumber(trials, "Trials");
        const hypothesised = parseNumber(p, "The hypothesised proportion");
        const result = proportionTest({ successes: s, trials: n, p: hypothesised, alternative, confidenceLevel });
        return {
          result,
          explanation: explainResult(result, quantity[kind], hypothesised),
          code: codeFor(kind, { successes: [s], trials: [n] }, hypothesised, alternative, confidenceLevel),
        };
      }
      const s1 = parseNumber(successes1, "Group 1 successes");
      const n1 = parseNumber(trials1, "Group 1 trials");
      const s2 = parseNumber(successes2, "Group 2 successes");
      const n2 = parseNumber(trials2, "Group 2 trials");
      const result = proportionTest({ successes: [s1, s2], trials: [n1, n2], alternative, confidenceLevel });
      return {
        result,
        explanation: explainResult(result, quantity[kind], 0),
        code: codeFor(kind, { successes: [s1, s2], trials: [n1, n2] }, 0.5, alternative, confidenceLevel),
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [kind, successes, trials, p, successes1, trials1, successes2, trials2, alternative, confidence]);

  return (
    <ProportionContext
      value={{
        kind,
        setKind,
        successes,
        setSuccesses,
        trials,
        setTrials,
        p,
        setP,
        successes1,
        setSuccesses1,
        trials1,
        setTrials1,
        successes2,
        setSuccesses2,
        trials2,
        setTrials2,
        alternative,
        setAlternative,
        confidence,
        setConfidence,
      }}
    >
      <OutcomeProvider outcome={outcome}>{children}</OutcomeProvider>
    </ProportionContext>
  );
}

/** A whole-number input for counts. */
function CountInput({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  return <input type="number" min={0} step={1} value={value} onChange={(e) => onChange(e.target.value)} />;
}

/** The inputs. */
export function ProportionForm() {
  const s = useProportion();
  return (
    <div className="demo-form">
      <Field label="Test">
        <select value={s.kind} onChange={(e) => s.setKind(e.target.value as Kind)}>
          <option value="one-sample">One sample: compare with a target proportion</option>
          <option value="two-sample">Two samples: compare two groups</option>
        </select>
      </Field>

      {s.kind === "one-sample" ? (
        <>
          <div className="field-row">
            <Field label="Successes">
              <CountInput value={s.successes} onChange={s.setSuccesses} />
            </Field>
            <Field label="Trials">
              <CountInput value={s.trials} onChange={s.setTrials} />
            </Field>
          </div>
          <Field label="Hypothesised proportion">
            <input type="number" min={0} max={1} step="any" value={s.p} onChange={(e) => s.setP(e.target.value)} />
          </Field>
        </>
      ) : (
        <>
          <div className="field-row">
            <Field label="Group 1 successes">
              <CountInput value={s.successes1} onChange={s.setSuccesses1} />
            </Field>
            <Field label="Group 1 trials">
              <CountInput value={s.trials1} onChange={s.setTrials1} />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Group 2 successes">
              <CountInput value={s.successes2} onChange={s.setSuccesses2} />
            </Field>
            <Field label="Group 2 trials">
              <CountInput value={s.trials2} onChange={s.setTrials2} />
            </Field>
          </div>
        </>
      )}

      <Field label="Alternative hypothesis">
        <select value={s.alternative} onChange={(e) => s.setAlternative(e.target.value as Alternative)}>
          <option value="two-sided">Two-sided: different, in either direction</option>
          <option value="less">Less: lower than the hypothesised value</option>
          <option value="greater">Greater: higher than the hypothesised value</option>
        </select>
      </Field>

      <Field label="Confidence level">
        <select value={s.confidence} onChange={(e) => s.setConfidence(e.target.value)}>
          <option value="0.9">90%</option>
          <option value="0.95">95%</option>
          <option value="0.99">99%</option>
        </select>
      </Field>
    </div>
  );
}