import TTestDemo from "./ttest-demo";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>statinfer demo</h1>
      <p>
        Enter your own data. Everything is calculated in your browser, using the published{" "}
        <a href="https://www.npmjs.com/package/statinfer">statinfer</a> package.
      </p>
      <TTestDemo />
    </main>
  );
}