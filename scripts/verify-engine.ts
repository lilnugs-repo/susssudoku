/**
 * Sanity check for the Sudoku engine: every generated puzzle must have a unique
 * solution that matches the stored solution, and the givens must agree with it.
 * Run with: npm run test:engine
 */
import {
  DIFFICULTIES,
  countSolutions,
  findLogicalStep,
  generatePuzzle,
  isSolved,
  solve,
  solveWithSingles,
} from "../src/lib/sudoku/index.ts";

const PER_LEVEL = Number(process.env.COUNT ?? 20);
let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error("  ✗", msg);
};

for (const difficulty of DIFFICULTIES) {
  const clueCounts: number[] = [];
  const times: number[] = [];
  let singlesSolvable = 0;
  for (let n = 0; n < PER_LEVEL; n++) {
    const t0 = performance.now();
    const p = generatePuzzle(difficulty);
    times.push(performance.now() - t0);
    clueCounts.push(p.clues);

    if (!isSolved(p.solution)) fail(`${difficulty} #${n}: solution is not a valid grid`);
    if (p.puzzle.some((v, i) => v !== 0 && v !== p.solution[i])) fail(`${difficulty} #${n}: givens disagree with solution`);
    if (countSolutions(p.puzzle, 2) !== 1) fail(`${difficulty} #${n}: puzzle is not unique`);
    const solved = solve(p.puzzle);
    if (!solved || solved.some((v, i) => v !== p.solution[i])) fail(`${difficulty} #${n}: solver disagrees`);
    if (solveWithSingles(p.puzzle).solved) singlesSolvable++;
    const step = findLogicalStep(p.puzzle);
    if (step && p.solution[step.cell] !== step.digit) fail(`${difficulty} #${n}: hint step is wrong`);
  }
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  console.log(
    `${difficulty.padEnd(6)} clues ${Math.min(...clueCounts)}–${Math.max(...clueCounts)} (avg ${avg(clueCounts).toFixed(1)}), ` +
      `singles-solvable ${singlesSolvable}/${PER_LEVEL}, gen avg ${avg(times).toFixed(0)}ms max ${Math.max(...times).toFixed(0)}ms`,
  );
}

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nAll engine checks passed ✓");
