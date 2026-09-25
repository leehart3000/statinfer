// Checks that the built package (dist) loads by its own name, with both
// `import` and `require`, and gives a correct answer.
import { createRequire } from "node:module";
import * as esm from "statinfer";

const cjs = createRequire(import.meta.url)("statinfer");
const names = ["tTest", "proportionTest", "chiSquareTest", "correlationTest", "anova", "fishersExactTest", "summarize"];

for (const [how, mod] of [["import", esm], ["require", cjs]]) {
  for (const name of names) {
    if (typeof mod[name] !== "function") {
      console.error(`Built package via ${how}: ${name} is missing`);
      process.exit(1);
    }
  }
}

const { pValue } = esm.tTest({ x: [5.1, 4.9, 5.6, 5.8, 6.0, 5.5, 5.3, 6.2], mu: 5 });
if (Math.abs(pValue - 0.009944414335751597) > 1e-12) {
  console.error(`Built package gave the wrong p-value: ${pValue}`);
  process.exit(1);
}

console.log("Built package loads and works via import and require");