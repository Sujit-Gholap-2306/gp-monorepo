# GP-Monorepo Skills

Versioned skill definitions for AI assistants (Claude Code, Cursor, Codex).

## Layout

```
skills/
  README.md                       ← this file
  sync-cursor-rules.sh            ← generate .cursor/rules/*.mdc from SKILL.md files

  GP-Specific (maintain these):
  gp-persona/SKILL.md             ← Project-wide persona + domain context (alwaysApply)
  gp-dev/SKILL.md                 ← Dev standards: @gp/shadcn, Next.js 16, Tailwind v4, lib rules
  gp-review/SKILL.md              ← Code review checklist for PRs and audits

  General (copied from global, update when upstream changes):
  shadcn/SKILL.md                 ← shadcn/ui component management
  vercel-react-best-practices/    ← React + Next.js performance patterns
  web-design-guidelines/          ← UI/UX and accessibility audit
  architecture-patterns/          ← Clean Architecture, DDD for backend
  mongodb/SKILL.md                ← MongoDB schema design and queries
  langchain-architecture/         ← LangChain + LangGraph for AI features
  native-data-fetching/           ← React Query, fetch, error handling patterns
  brainstorming/SKILL.md          ← Design-before-code process
```

## Canonical Source

**Edit `skills/<name>/SKILL.md` first.**

Each skill is one folder with a `SKILL.md` file and optional YAML frontmatter:
- `name` — skill identifier
- `description` — when to apply (Claude uses this to decide)
- `alwaysApply: true` — auto-apply without being explicitly invoked (Cursor only)

## Claude Code

### Global symlinks (one-time setup per machine)

```bash
ln -sf /Users/mac1/Workspace/Projects/GP-Monorepo/skills/gp-persona ~/.claude/skills/gp-persona
ln -sf /Users/mac1/Workspace/Projects/GP-Monorepo/skills/gp-dev ~/.claude/skills/gp-dev
ln -sf /Users/mac1/Workspace/Projects/GP-Monorepo/skills/gp-review ~/.claude/skills/gp-review
```

This makes the same `SKILL.md` files available globally without duplication.

### Reference in CLAUDE.md

Skills are referenced in `CLAUDE.md` at the repo root. Claude Code reads `CLAUDE.md` automatically on every session.

## Cursor

Cursor reads `.cursor/rules/*.mdc`. Each `.mdc` file mirrors a `SKILL.md` with Cursor-specific YAML frontmatter (`globs`, `alwaysApply`).

Run `bash skills/sync-cursor-rules.sh` from the repo root to regenerate after editing a SKILL.md.

## Adding a New Skill

1. Create `skills/<name>/SKILL.md` with YAML frontmatter
2. Add it to the layout table above
3. Add a symlink if you want it globally available in Claude Code
4. Run `sync-cursor-rules.sh` if you want it in Cursor
