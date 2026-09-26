import type { Metadata } from "next";
import TTestDemo from "./ttest-demo";

export const metadata: Metadata = { title: "t-test demo" };

export default function TTestPage() {
  return (
    <>
      <h1>t-test</h1>
      <TTestDemo />
    </>
  );
}