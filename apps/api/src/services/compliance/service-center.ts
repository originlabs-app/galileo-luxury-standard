/**
 * Authorized service center compliance module.
 *
 * Verifies the transfer is initiated from an authorized service center.
 * MVP: stub that always passes.
 * Will be activated when the service center registry is built.
 */

import type { ComplianceContext, ComplianceResult } from "./index.js";

export async function serviceCenterCheck(
  _ctx: ComplianceContext,
): Promise<ComplianceResult> {
  // MVP stub: always passes — service center registry not yet built
  return { passed: true, module: "service-center" };
}
