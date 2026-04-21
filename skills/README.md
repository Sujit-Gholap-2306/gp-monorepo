# GP-Monorepo Skills

Versioned skill definitions for any AI assistant — Claude Code, Cursor, Copilot, or any future tool.

Each skill is one folder with a `SKILL.md` file. Pure markdown, no tool-specific format.

## Layout

```
skills/
  GP-Specific (own and maintain):
  gp-persona/             ← Project-wide persona + domain context (apply to all GP work)
  gp-dev/                 ← Dev standards: @gp/shadcn, Next.js 16, Tailwind v4, lib rules
  gp-review/              ← Code review checklist for PRs and audits
  gp-component-variants/  ← CVA variant system, folder structure, server/client split for gram/ components

  General (copied from shared library, update when upstream changes):
  shadcn/             ← shadcn/ui component management
  vercel-react-best-practices/  ← React + Next.js performance patterns
  web-design-guidelines/        ← UI/UX and accessibility audit
  architecture-patterns/        ← Clean Architecture, DDD
  mongodb/            ← MongoDB schema design and queries
  langchain-architecture/       ← LangChain + LangGraph for AI features
  native-data-fetching/         ← React Query, fetch, error handling
  brainstorming/      ← Design-before-code process
```

## Skill File Format

Each `SKILL.md` has a YAML frontmatter block followed by the skill body:

```markdown
---
name: skill-name
description: When to apply this skill. AI assistants use this to decide relevance.
---

# Skill Title
...
```

The `description` field is the key — write it so any AI can match it to the right context.

## How Each Tool Uses These

**Claude Code**
- Global symlinks (one-time per machine):
  ```bash
  ln -sf $(pwd)/skills/gp-persona ~/.claude/skills/gp-persona
  ln -sf $(pwd)/skills/gp-dev ~/.claude/skills/gp-dev
  ln -sf $(pwd)/skills/gp-review ~/.claude/skills/gp-review
  ```
- Or reference in `CLAUDE.md` (already done at repo root)

**Cursor**
- Add to `.cursor/rules/` as `.mdc` files
- Cursor frontmatter: `description`, `globs`, `alwaysApply`
- Body: paste the SKILL.md content after the frontmatter

**Copilot / other tools**
- Copy the SKILL.md body into the tool's context/instruction file
- The content is plain markdown — paste anywhere

## Adding a New Skill

1. Create `skills/<name>/SKILL.md` with name + description frontmatter
2. Add it to the layout table above
3. Wire it up in your tool of choice
