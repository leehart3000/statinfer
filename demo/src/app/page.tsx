import Link from "next/link";
import { demos } from "@/demos";

export default function Home() {
  return (
    <>
      <h1>statinfer</h1>
      <p>
        <strong>statinfer</strong> is a JavaScript and TypeScript package for statistical inference: hypothesis
        tests with confidence intervals, checked against SciPy and statsmodels. It works in Node.js and in the
        browser, and has no dependencies.
      </p>
      <p>Install it from npm:</p>
      <pre>
        <code>npm install statinfer</code>
      </pre>
      <p>
        Each demo runs statinfer in your browser, explains the result in plain language, and shows the
        JavaScript code that reproduces it.
      </p>
      <h2>Demos</h2>
      <ul>
        {demos.map((demo) => (
          <li key={demo.slug}>
            <Link href={`/${demo.slug}`}>{demo.title}</Link>: {demo.summary}
          </li>
        ))}
      </ul>
    </>
  );
}