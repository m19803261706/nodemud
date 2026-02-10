# AGENTS.md

## Scope

本文件作用于仓库根目录及其所有子目录。

## Source Of Truth

1. 项目总规范：`CLAUDE.md`
2. 后端细则：`server/CLAUDE.md`
3. 前端细则：`client/CLAUDE.md`
4. 共享包细则：`packages/core/CLAUDE.md`

如有冲突，优先遵循更具体目录下的规范文件。

## Execution Rules

1. 优先保持与现有代码风格一致，不做无关重构。
2. 改动应小步可验证，尽量附带必要测试或最小验证步骤。
3. 面向用户的回复默认使用中文。

## Git Rules (Critical)

1. 每次完成任务后，只提交本次任务中由 AI 自己修改的文件。
2. 必须使用精确暂存：`git add <file...>`，禁止 `git add .`。
3. 禁止把与当前任务无关的工作区改动打包进同一提交。
4. 若发现非本任务的异常改动，应先暂停并与用户确认。
5. 提交信息必须清楚说明“改了什么、为什么改”。

## Safety

1. 未经用户明确要求，不执行破坏性命令（如 `git reset --hard`、`git checkout --`、`rm -rf`）。
2. 不回滚、不覆盖用户已有但与本任务无关的改动。
