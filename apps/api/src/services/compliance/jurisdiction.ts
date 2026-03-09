/**
 * Jurisdiction compliance module.
 *
 * Checks that the destination address is not in a blocked jurisdiction.
 * MVP: always passes (no jurisdiction data available yet).
 * TODO: integrate real jurisdiction lookup (GeoIP or on-chain registry).
 */

import type { ComplianceContext, ComplianceResult } from "./index.js";

export async function jurisdictionCheck(
  _ctx: ComplianceContext,
): Promise<ComplianceResult> {
  // MVP stub: always passes — no jurisdiction data available yet
  return { passed: true, module: "jurisdiction" };
}
