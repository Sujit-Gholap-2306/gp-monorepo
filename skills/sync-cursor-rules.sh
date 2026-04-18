#!/usr/bin/env bash
# Regenerate .cursor/rules/*.mdc from skills/*/SKILL.md
# Run from repo root: bash skills/sync-cursor-rules.sh

set -e

mkdir -p .cursor/rules

# gp-persona (alwaysApply — domain context for all files)
{
  printf '%s\n' '---' \
    'description: GP-Monorepo project-wide persona and domain context. Always apply.' \
    'globs: apps/grampanchayat/**/*.{tsx,ts},packages/shadcn/**/*.{tsx,ts}' \
    'alwaysApply: true' \
    '---' ''
  tail -n +7 skills/gp-persona/SKILL.md
} > .cursor/rules/gp-persona.mdc

# gp-dev (apply to app and packages)
{
  printf '%s\n' '---' \
    'description: GP-Monorepo dev standards — @gp/shadcn, Next.js 16, Tailwind v4, lib rules. Apply when building or modifying any component, page, or API route.' \
    'globs: apps/grampanchayat/**/*.{tsx,ts},packages/shadcn/**/*.{tsx,ts}' \
    'alwaysApply: true' \
    '---' ''
  tail -n +7 skills/gp-dev/SKILL.md
} > .cursor/rules/gp-dev.mdc

# gp-review (apply when reviewing code)
{
  printf '%s\n' '---' \
    'description: GP-Monorepo code review checklist. Apply when reviewing, auditing, or critiquing code in apps/grampanchayat/ or packages/shadcn/.' \
    'globs: apps/grampanchayat/**/*.{tsx,ts},packages/shadcn/**/*.{tsx,ts}' \
    'alwaysApply: false' \
    '---' ''
  tail -n +7 skills/gp-review/SKILL.md
} > .cursor/rules/gp-review.mdc

echo "✓ .cursor/rules/ regenerated"
echo "  gp-persona.mdc"
echo "  gp-dev.mdc"
echo "  gp-review.mdc"
