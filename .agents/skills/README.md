# Codex project skills

These skills are installed in `.agents/skills` for Codex in this project.

- The 10 core Spec Kit skills and `.specify/` runtime files were generated with Spec Kit `1.0.8` using the Codex integration and PowerShell scripts.
- `speckit-baseline` and `claude-command-converter` come from [dceoy/speckit-agent-skills](https://github.com/dceoy/speckit-agent-skills), commit `52e6e7d8e03d3907b3f582e2dfdbb60c233f0bb0`.
- The upstream AGPL-3.0 license is in this directory as `LICENSE`.
- Invoke workflows in Codex as `$speckit-constitution`, `$speckit-specify`, `$speckit-plan`, `$speckit-tasks`, `$speckit-implement`, and the other `$speckit-*` skills.
- Run the project-pinned Specify CLI from PowerShell with `\.specify\tools\specify.ps1 <command>`.
- `$speckit-taskstoissues` requires a connected GitHub MCP integration and authentication when you use it.