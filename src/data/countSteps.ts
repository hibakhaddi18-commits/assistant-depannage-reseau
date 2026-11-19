import type { Flow } from './types';

// Longest path through the decision tree (steps only, diagnoses excluded).
export function countSteps(flow: Flow): number {
  let maxDepth = 0;
  const seen = new Set<string>();

  function walk(stepId: string, depth: number) {
    if (!stepId || stepId.startsWith('d:') || seen.has(stepId)) return;
    seen.add(stepId);
    const step = flow.steps[stepId];
    if (!step) return;
    maxDepth = Math.max(maxDepth, depth);
    for (const choice of step.choices) walk(choice.next, depth + 1);
    seen.delete(stepId);
  }

  walk(flow.start, 1);
  return maxDepth;
}
