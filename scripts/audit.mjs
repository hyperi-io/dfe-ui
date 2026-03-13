#!/usr/bin/env node
/**
 * Wraps `yarn npm audit` and translates npm's --audit-level to yarn's --severity.
 * hyperi-ci passes --audit-level=moderate; yarn npm audit expects --severity moderate.
 */
import { execSync } from "child_process";

const args = process.argv.slice(2).flatMap((arg) => {
  const match = arg.match(/^--audit-level=(.+)$/);
  return match ? ["--severity", match[1]] : [arg];
});

execSync("yarn", ["npm", "audit", ...args], { stdio: "inherit" });
