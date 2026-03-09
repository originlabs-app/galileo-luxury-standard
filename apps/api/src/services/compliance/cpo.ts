/**
 * CPO (Certified Pre-Owned) eligibility compliance module.
 *
 * MVP: stub that always passes.
 * Will be activated when REPAIRED/CPO_CERTIFIED event types are added.
 */

import type { ComplianceContext, ComplianceResult } from "./index.js";

export async function cpoCheck(
  _ctx: ComplianceContext,
): Promise<ComplianceResult> {
  // MVP stub: always passes — CPO eligibility check not yet implemented
  return { passed: true, module: "cpo" };
}
