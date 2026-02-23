# Agent and Skill Invocation Reference

This file lists every available agent and skill in this workspace, and the ways you can invoke them.

## Agent invocation patterns

1. Use the selector command:
   - `/agent` (then pick an agent)
2. Use natural language with an explicit agent name:
   - `Use the <agent-name> agent to <task>.`
   - `Run the <agent-name> agent for <task>.`
3. Built-in shortcut:
   - `/review` (runs the `code-review` agent)

## Skill invocation patterns

1. Use the skills command:
   - `/skills` (view/manage available skills)
2. Use natural language with an explicit skill name:
   - `Use the <skill-name> skill for this.`
   - `Invoke the <skill-name> skill to <task>.`

## Available agents (exact names)

| Agent | Example invocation |
| --- | --- |
| `explore` | `Use the explore agent to map where auth session checks happen.` |
| `task` | `Use the task agent to run npm run build and report pass/fail.` |
| `general-purpose` | `Use the general-purpose agent to implement the requested multi-file fix.` |
| `code-review` | `Use the code-review agent to review my current unstaged changes.` |
| `coder` | `Use the coder agent to implement and verify this feature.` |
| `design-expert` | `Use the design-expert agent to redesign this page with a polished UI.` |
| `fast-coder` | `Use the fast-coder agent to make this small single-file fix quickly.` |
| `orchestrator` | `Use the orchestrator agent to break down and delegate this complex task.` |
| `planner` | `Use the planner agent to create an implementation plan for this request.` |
| `webapp-testing` | `Use the webapp-testing agent to validate the login flow in the browser.` |

## Available skills (exact names)

| Skill | Example invocation |
| --- | --- |
| `agent-browser` | `Use the agent-browser skill to open a site and extract page data.` |
| `brainstorming` | `Use the brainstorming skill before implementing this new feature.` |
| `next-best-practices` | `Use the next-best-practices skill to validate this Next.js route design.` |
| `systematic-debugging` | `Use the systematic-debugging skill to investigate this failing test.` |
| `using-git-worktrees` | `Use the using-git-worktrees skill before starting this feature.` |
| `verification-before-completion` | `Use the verification-before-completion skill before marking this done.` |
| `playwright-cli` | `Use the playwright-cli skill to automate this browser test flow.` |

