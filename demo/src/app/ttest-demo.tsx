"use client";

import { useMemo, useState } from "react";
import { summarize, tTest, type Alternative, type TestResult } from "statinfer";

type Kind = "one-sample" | "paired" | "welch" | "pooled";

const PURPOSE: Record<Kind, string> = {
  "one-sample":
    "Is the average of one group different from a target value? For example: does a machine fill bottles with 500 ml on average?",
  paired:
    "Did the same subjects change between two measurements? For example: blood pressure before and after a treatment, for the same patients.",
  welch:
    "Do two separate groups have different averages? For example: test scores of two classes. This is the usual choice, because it doesn't assume the groups are equally spread out.",
  pooled:
    "The same question as Welch's test, but assuming both groups are equally spread out. Only use it when you have a good reason to believe that.",
};

const QUANTITY: Record<Kind, string> = {
  "one-sample": "true mean",
  paired: "true mean difference (x − y)",
  welch: "true difference in means (x − y)",
  pooled: "true difference in means (x − y)",
};

/** Turns "1, 2 3\n4" into [1, 2, 3, 4], or throws a readable error. */
function parseNumbers(text: string): number[] {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  const values = parts.map(Number);
  const bad = parts.find((_, i) => !Number.isFinite(values[i]));
  if (bad !== undefined) throw new Error(`"${bad}" is not a number`);
  return values;
}

const fmt = (n: number) => String(Number(n.toPrecision(4)));

/** A plain-language reading of the result. */
function explain(result: TestResult, kind: Kind, mu: number): string[] {
  const quantity = QUANTITY[kind];
  const claim =
    result.alternative === "less"
      ? `the ${quantity} is less than ${mu}`
      : result.alternative === "greater"
        ? `the ${quantity} is greater than ${mu}`
        : `the ${quantity} differs from ${mu}`;
  const p = result.pValue < 0.001 ? "less than 0.001" : fmt(result.pValue);
  const sentences = [
    `The estimate from your data is ${fmt(result.estimate!)}.`,
    `If the ${quantity} really were ${mu}, the chance of getting a result at least this extreme is ${p}. That's the p-value.`,
    result.pValue < 0.05
      ? `That's below 0.05, so at the common 5% level this counts as evidence that ${claim}.`
      : `That's not below 0.05, so at the common 5% level there isn't enough evidence that ${claim}. That doesn't prove it equals ${mu}; the data just can't tell.`,
  ];
  const [low, high] = result.confidenceInterval!;
  const level = `${fmt(result.confidenceLevel! * 100)}%`;
  sentences.push(
    low === -Infinity
      ? `The ${level} confidence interval says the ${quantity} is at most ${fmt(high)}.`
      : high === Infinity
        ? `The ${level} confidence interval says the ${quantity} is at least ${fmt(low)}.`
        : `The ${level} confidence interval, ${fmt(low)} to ${fmt(high)}, is the range of values for the ${quantity} that are consistent with your data.`,
  );
  return sentences;
}

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

const field = { display: "grid", gap: "0.25rem" } as const;

export default function TTestDemo() {
  const [kind, setKind] = useState<Kind>("one-sample");
  const [xText, setXText] = useState("5.1, 4.9, 5.6, 5.8, 6.0, 5.5, 5.3, 6.2");
  const [yText, setYText] = useState("4.8, 5.0, 5.2, 4.7, 5.1, 5.4, 4.9, 5.0");
  const [mu, setMu] = useState("5");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");
  const [confidence, setConfidence] = useState("0.95");

  const outcome = useMemo(():
    | { result: TestResult; explanation: string[]; code: string }
    | { error: string } => {
    try {
      const x = parseNumbers(xText);
      const y = kind === "one-sample" ? [] : parseNumbers(yText);
      const muValue = Number(mu);
      if (!Number.isFinite(muValue)) throw new Error("The hypothesised value must be a number");
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
        explanation: explain(result, kind, muValue),
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
    <section style={{ display: "grid", gap: "1rem", maxWidth: "40rem" }}>
      <h2>t-test</h2>

      <label style={field}>
        Test
        <select value={kind} onChange={(e) => changeKind(e.target.value as Kind)}>
          <option value="one-sample">One-sample</option>
          <option value="paired">Paired</option>
          <option value="welch">Two-sample (Welch)</option>
          <option value="pooled">Two-sample (pooled variance)</option>
        </select>
      </label>

      <p>
        <strong>When to use it:</strong> {PURPOSE[kind]}
      </p>

      <label style={field}>
        {kind === "one-sample" ? "Sample" : "First sample (x)"}
        <textarea rows={3} value={xText} onChange={(e) => setXText(e.target.value)} />
      </label>

      {kind !== "one-sample" && (
        <label style={field}>
          Second sample (y)
          <textarea rows={3} value={yText} onChange={(e) => setYText(e.target.value)} />
        </label>
      )}

      <label style={field}>
        {kind === "one-sample" ? "Hypothesised mean" : "Hypothesised difference (x − y)"}
        <input type="number" step="any" value={mu} onChange={(e) => setMu(e.target.value)} />
      </label>

      <label style={field}>
        Alternative hypothesis
        <select value={alternative} onChange={(e) => setAlternative(e.target.value as Alternative)}>
          <option value="two-sided">Two-sided: different, in either direction</option>
          <option value="less">Less: lower than the hypothesised value</option>
          <option value="greater">Greater: higher than the hypothesised value</option>
        </select>
      </label>

      <label style={field}>
        Confidence level
        <select value={confidence} onChange={(e) => setConfidence(e.target.value)}>
          <option value="0.9">90%</option>
          <option value="0.95">95%</option>
          <option value="0.99">99%</option>
        </select>
      </label>

      {"error" in outcome ? (
        <p role="alert" style={{ color: "crimson" }}>{outcome.error}</p>
      ) : (
        <>
          <h3>What it means</h3>
          {outcome.explanation.map((sentence) => (
            <p key={sentence}>{sentence}</p>
          ))}

          <h3>Result</h3>
          <pre>{summarize(outcome.result)}</pre>

          <h3>Use it in your code</h3>
          <p>
            Install with <code>npm install statinfer</code>, then:
          </p>
          <pre>{outcome.code}</pre>

          <details>
            <summary>Raw result (JSON)</summary>
            <pre>{JSON.stringify(outcome.result, null, 2)}</pre>
          </details>
        </>
      )}
    </section>
  );
}