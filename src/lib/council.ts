/**
 * VOX Council Logic — Single Source of Truth
 *
 * Council thresholds (user-defined):
 *   SELL:  grade < 45
 *   TRIM:  grade 45-49
 *   HOLD:  grade 50-59
 *   BUY:   grade 60-69
 *   CORE:  grade >= 70
 *
 * This function is the ONLY place council decisions should be computed.
 * Any code that maps grades to actions MUST use this helper.
 */

export type CouncilAction = "SELL" | "TRIM" | "HOLD" | "BUY" | "CORE";

export function getCouncilAction(grade: number | null | undefined): CouncilAction {
  if (grade === null || grade === undefined) return "HOLD";
  const g = Number(grade);
  if (isNaN(g)) return "HOLD";

  if (g >= 70) return "CORE";
  if (g >= 60) return "BUY";
  if (g >= 50) return "HOLD";
  if (g >= 45) return "TRIM";
  return "SELL";
}

/**
 * Map a grade to a human-readable investment action.
 * Used for UI labels and position summaries.
 */
export function getActionLabel(grade: number | null | undefined): string {
  return getCouncilAction(grade);
}

/**
 * Validate that a stored council value matches the grade.
 * Returns true if consistent, false if there's a contradiction.
 */
export function isCouncilConsistent(
  grade: number | null | undefined,
  council: string | null | undefined
): boolean {
  if (!council) return false;
  return getCouncilAction(grade) === council;
}
