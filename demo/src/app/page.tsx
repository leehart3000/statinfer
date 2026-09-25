import { summarize, tTest } from "statinfer";

export default function Home() {
  const result = tTest({ x: [5.1, 4.9, 5.6, 5.8, 6.0, 5.5, 5.3, 6.2], mu: 5 });

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>statinfer demo</h1>
      <p>A one-sample t-test, calculated with the published statinfer package:</p>
      <pre>{summarize(result)}</pre>
    </main>
  );
}