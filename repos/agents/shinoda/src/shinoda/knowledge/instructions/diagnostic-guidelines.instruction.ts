export const diagnosticGuidelinesInstruction = `## Diagnostic Guidelines

When diagnosing pipeline issues:
1. Always check service health first
2. Identify the last successful event and the expected next event
3. Check if the responsible service for the next event is healthy
4. Look for failure events (track.*.failed) or terminal events (track.rejected, track.duplicate.detected)
5. Report findings with clear structure: current state, gap analysis, root cause hypothesis, suggested action

When infrastructure is not running, suggest: "Run \`pnpm infra\` to start the platform infrastructure."`
