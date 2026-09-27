"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { correlationTest, type Alternative } from "statinfer";
import { OutcomeProvider, type Outcome } from "@/components/demo-outcome";
import { Field } from "@/components/demo-ui";
import { explainResult } from "@/lib/explain";
import { parseNumbers } from "@/lib/format";
import { quantity, type Method } from "./messages";

/** The statinfer code that reproduces the result, showing only non-default options. */
function codeFor(x: number[], y: number[], method: Method, alternative: Alternative, confidence: number) {
  const options = [`  x: [${x.join(", ")}],`, `  y: [${y.join(", ")}],`];
  if (method !== "pearson") options.push(`  method: "${method}",`);
  if (alternative !== "two-sided") options.push(`  alternative: "${alternative}",`);
  if (method === "pearson" && confidence !== 0.95) options.push(`  confidenceLevel: ${confidence},`);
  return [
    'import { correlationTest, summarize } from "statinfer";',
    "",
    "const result = correlationTest({",
    ...options,
    "});",
    "",
    "console.log(summarize(result));",
  ].join("\n");
}

interface CorrelationInputs {
  method: Method;
  setMethod: (method: Method) => void;
  xText: string;
  setXText: (text: string) => void;
  yText: string;
  setYText: (text: string) => void;
  alternative: Alternative;
  setAlternative: (alternative: Alternative) => void;
  confidence: string;
  setConfidence: (text: string) => void;
}

const CorrelationContext = createContext<CorrelationInputs | null>(null);

function useCorrelation(): CorrelationInputs {
  const inputs = useContext(CorrelationContext);
  if (!inputs) throw new Error("<CorrelationForm> must be placed inside <CorrelationDemo>");
  return inputs;
}

/** Holds the correlation test's inputs, and shares them and the outcome with the components inside it. */
export function CorrelationDemo({ children }: { children: React.ReactNode }) {
  const [method, setMethod] = useState<Method>("pearson");
  const [xText, setXText] = useState("2.1, 3.4, 1.9, 5.6, 4.2, 3.3, 6.1, 2.8, 4.9, 3.7");
  const [yText, setYText] = useState("1.8, 3.9, 2.2, 5.1, 3.6, 3.5, 6.4, 2.5, 4.1, 4.4");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");
  const [confidence, setConfidence] = useState("0.95");

  const outcome = useMemo((): Outcome => {
    try {
      const x = parseNumbers(xText);
      const y = parseNumbers(yText);
      const confidenceLevel = Number(confidence);
      const result = correlationTest({ x, y, method, alternative, confidenceLevel });
      return {
        result,
        // "No correlation" is the hypothesised value, so the claim is compared with 0.
        explanation: explainResult(result, quantity[method], 0),
        code: codeFor(x, y, method, alternative, confidenceLevel),
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [method, xText, yText, alternative, confidence]);

  return (
    <CorrelationContext
      value={{ method, setMethod, xText, setXText, yText, setYText, alternative, setAlternative, confidence, setConfidence }}
    >
      <OutcomeProvider outcome={outcome}>{children}</OutcomeProvider>
    </CorrelationContext>
  );
}

/** The inputs. */
export function CorrelationForm() {
  const s = useCorrelation();
  return (
    <div className="demo-form">
      <Field label="Method">
        <select value={s.method} onChange={(e) => s.setMethod(e.target.value as Method)}>
          <option value="pearson">Pearson: straight-line relationships in the values</option>
          <option value="spearman">Spearman: consistent trends, based on ranks</option>
        </select>
      </Field>

      <Field label="First measurement (x)">
        <textarea rows={3} value={s.xText} onChange={(e) => s.setXText(e.target.value)} />
      </Field>

      <Field label="Second measurement (y), in the same order as x">
        <textarea rows={3} value={s.yText} onChange={(e) => s.setYText(e.target.value)} />
      </Field>

      <Field label="Alternative hypothesis">
        <select value={s.alternative} onChange={(e) => s.setAlternative(e.target.value as Alternative)}>
          <option value="two-sided">Two-sided: correlated, in either direction</option>
          <option value="greater">Greater: positively correlated (y rises with x)</option>
          <option value="less">Less: negatively correlated (y falls as x rises)</option>
        </select>
      </Field>

      {s.method === "pearson" && (
        <Field label="Confidence level">
          <select value={s.confidence} onChange={(e) => s.setConfidence(e.target.value)}>
            <option value="0.9">90%</option>
            <option value="0.95">95%</option>
            <option value="0.99">99%</option>
          </select>
        </Field>
      )}
    </div>
  );
}