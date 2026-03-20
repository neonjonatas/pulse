# Plan Metadata Definition

This document defines the canonical structure, metadata, lifecycle, and usage rules for all plan documents in the `.agents/plans/` directory.

---

## Plan Lifecycle

```
draft -> active -> applied -> archive
```

| Status | Meaning |
|--------|---------|
| `draft` | Proposed. Under review or awaiting execution approval. |
| `active` | Approved and currently being executed. |
| `applied` | Execution complete. Outcome recorded. |
| `archive` | Superseded, abandoned, or no longer relevant. Kept for historical reference. |

Plans move through lifecycle stages by physically relocating the file:

```
.agents/plans/<category>/draft/my-plan.md    -> draft
.agents/plans/<category>/active/my-plan.md   -> active (approved for execution)
.agents/plans/<category>/applied/my-plan.md  -> applied (completed with outcome)
.agents/plans/<category>/archive/my-plan.md  -> archive (historical)
```

---

## Plan Categories

Plans are organized by concern:

| Category | Path | Purpose |
|----------|------|---------|
| `reliability` | `plans/reliability/` | Infrastructure, health, boot stability, monitoring |
| `refactoring` | `plans/refactoring/` | Architecture changes, migrations, code restructuring |
| `project` | `plans/project/` | Meta-plans, conventions, documentation system changes |

New categories may be added as the system grows. Each category must contain `draft/`, `applied/`, and optionally `archive/` subdirectories.

---

## File Naming

- Use `kebab-case.md`
- Name must describe the plan's objective, not its implementation
- Maximum 5 words in the filename

**Good:** `websocket-sse-transition.md`, `build-and-infra-fix.md`
**Bad:** `fix-stuff.md`, `plan-v2-final-draft.md`, `my-changes.md`

---

## Required Metadata

Every plan must begin with a header section containing:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | `# heading` | Yes | Plan title as the first line |
| Status | text | Yes | Current lifecycle status (`DRAFT`, `ACTIVE`, `APPLIED`, `ARCHIVED`) |
| Domain | text | Yes | Which system area: `reliability`, `refactoring`, `project` |
| Created | date | Yes | ISO date when the plan was authored |
| Author | text | Yes | Who created the plan (`human`, `agent`, or specific identifier) |

### Optional Metadata

| Field | Type | Description |
|-------|------|-------------|
| Updated | date | Last modification date |
| Depends On | list | Other plans or prerequisites |
| Related Services | list | Microservices, agents, or packages affected |
| Related Schemas | list | Schema files that define contracts used by this plan |
| Related Standards | list | Standards that govern this plan's implementation |
| Related Playbooks | list | Playbooks used for validation |

---

## Plan Structure

### Draft Plans

```markdown
# Plan Title

## Status: DRAFT

**Domain:** reliability | refactoring | project
**Created:** YYYY-MM-DD
**Author:** human | agent

---

## Context

Why this plan exists. What problem it solves.

## Current State

What the system looks like before this plan executes.

## Proposed Changes

Specific, actionable changes with file paths and code references.

## Files Changed

List of files that will be created or modified.

## Risks

Known risks and mitigation strategies.

## Validation

How to verify the plan was executed correctly.
```

### Applied Plans

When a plan moves to `applied/`, append an **Outcome** section:

```markdown
## Outcome

**Status:** APPLIED
**Applied:** YYYY-MM-DD
**Verified:** Yes | No

### What Was Done

Summary of actual changes made.

### Files Changed

Actual list of files created or modified.

### Verification Results

Build output, test results, or other evidence of success.

### Remaining Gaps

Issues discovered but not addressed by this plan.
```

---

## Rules

1. **One concern per plan.** Do not combine unrelated changes into a single plan.
2. **Plans are not code.** They describe intent, context, and verification — not implementation details. Code belongs in the codebase.
3. **Applied plans are immutable.** Once moved to `applied/`, do not modify the plan content. Record new findings as a separate plan.
4. **Draft plans are mutable.** Drafts may be revised freely until they become active.
5. **Archive does not mean delete.** Archived plans remain in the repository for historical reference and LLM context.
6. **Cross-reference related artifacts.** Link to schemas, standards, playbooks, and context docs where relevant.
7. **Plans must be executable.** Avoid vague recommendations. Every proposed change must be specific enough for an agent or engineer to implement without ambiguity.

---

## Examples

### Example: Applied Reliability Plan

```
.agents/plans/reliability/applied/build-and-infra-fix.md
```

- Status: APPLIED
- Domain: reliability
- Covers: tsc-alias bug fix, Mastra config fix, Docker infrastructure updates
- Outcome section documents all fixes applied, verification via `pnpm dx:reset`

### Example: Applied Refactoring Plan

```
.agents/plans/refactoring/applied/websocket-sse-transition.md
```

- Status: APPLIED
- Domain: refactoring
- Covers: WebSocket to SSE migration for Backstage real-time pipeline
- Files changed section lists backend SSE components and frontend EventSource integration
