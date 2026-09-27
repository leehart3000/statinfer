"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { tTest, type Alternative } from "statinfer";
import { OutcomeProvider, type Outcome } from "@/components/demo-outcome";
import { Field } from "@/components/demo-ui";
import { explainResult } from "@/lib/explain";
import { parseNumber, parseNumbers } from "@/lib/format";
import { quantity, type Kind } from "./messages";

/** The statinfer code that reproduces the result, showing only non-default options. */
function codeFor(kind: Kind, x: number[], y: number[], mu: number, alternative: Alternative, confidence: number) {
  const options = [`  x: [${x.join(", ")}],`];
  if (kind !== "one-sample") options.push(`  y: [${y.join(", ")}],`);
  if (kind === "paired") options.push("  paired: true,");
  if (kind === "pooled") options.push("  equalVariance: true,");
  if (mu !== 0) options.push(`  mu: ${mu},`);
  if (alternative !== "two-sided") options.push(`  alternative: "${alternative}",`);
  if (confidence !== 0.95) options.push(`  confidenceLevel: ${confidence},`);
  return [
    'import { summarize, tTest } from "statinfer";',
    "",
    "const result = tTest({",
    ...options,
    "});",
    "",
    "console.log(summarize(result));",
  ].join("\n");
}

interface TTestInputs {
  kind: Kind;
  changeKind: (next: Kind) => void;
  xText: string;
  setXText: (text: string) => void;
  yText: string;
  setYText: (text: string) => void;
  mu: string;
  setMu: (text: string) => void;
  alternative: Alternative;
  setAlternative: (alternative: Alternative) => void;
  confidence: string;
  setConfidence: (text: string) => void;
}

const TTestContext = createContext<TTestInputs | null>(null);

function useTTest(): TTestInputs {
  const inputs = useContext(TTestContext);
  if (!inputs) throw new Error("<TTestForm> must be placed inside <TTestDemo>");
  return inputs;
}

/** Holds the t-test's inputs, and shares them and the outcome with the components inside it. */
export function TTestDemo({ children }: { children: React.ReactNode }) {
  const [kind, setKind] = useState<Kind>("one-sample");
  const [xText, setXText] = useState("5.1, 4.9, 5.6, 5.8, 6.0, 5.5, 5.3, 6.2");
  const [yText, setYText] = useState("4.8, 5.0, 5.2, 4.7, 5.1, 5.4, 4.9, 5.0");
  const [mu, setMu] = useState("5");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");
  const [confidence, setConfidence] = useState("0.95");

  const outcome = useMemo((): Outcome => {
    try {
      const x = parseNumbers(xText);
      const y = kind === "one-sample" ? [] : parseNumbers(yText);
      const muValue = parseNumber(mu, "The hypothesised value");
      const confidenceLevel = Number(confidence);
      const result = tTest({
        x,
        y: kind === "one-sample" ? undefined : y,
        paired: kind === "paired",
        equalVariance: kind === "pooled",
        mu: muValue,
        alternative,
        confidenceLevel,
      });
      return {
        result,
        explanation: explainResult(result, quantity[kind], muValue),
        code: codeFor(kind, x, y, muValue, alternative, confidenceLevel),
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [kind, xText, yText, mu, alternative, confidence]);

  function changeKind(next: Kind) {
    setKind(next);
    // A sensible starting value: the target mean, or "no difference".
    setMu(next === "one-sample" ? "5" : "0");
  }

  return (
    <TTestContext
      value={{
        kind,
        changeKind,
        xText,
        setXText,
        yText,
        setYText,
        mu,
        setMu,
        alternative,
        setAlternative,
        confidence,
        setConfidence,
      }}
    >
      <OutcomeProvider outcome={outcome}>{children}</OutcomeProvider>
    </TTestContext>
  );
}

/** The inputs. */
export function TTestForm() {
  const s = useTTest();
  return (
    <div className="demo-form">
      <Field label="Test">
        <select value={s.kind} onChange={(e) => s.changeKind(e.target.value as Kind)}>
          <option value="one-sample">One-sample</option>
          <option value="paired">Paired</option>
          <option value="welch">Two-sample (Welch)</option>
          <option value="pooled">Two-sample (pooled variance)</option>
        </select>
      </Field>

      <Field label={s.kind === "one-sample" ? "Sample" : "First sample (x)"}>
        <textarea rows={3} value={s.xText} onChange={(e) => s.setXText(e.target.value)} />
      </Field>

      {s.kind !== "one-sample" && (
        <Field label="Second sample (y)">
          <textarea rows={3} value={s.yText} onChange={(e) => s.setYText(e.target.value)} />
        </Field>
      )}

      <Field label={s.kind === "one-sample" ? "Hypothesised mean" : "Hypothesised difference (x − y)"}>
        <input type="number" step="any" value={s.mu} onChange={(e) => s.setMu(e.target.value)} />
      </Field>

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