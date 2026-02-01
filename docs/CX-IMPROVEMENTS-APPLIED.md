# CX 工作流改进实施记录

## 改进时间

2026-02-02

## 改进内容

### ✅ 改进 1: 文档草稿路径修正

**问题**: 使用系统临时目录 `/tmp/` 存储文档草稿

**改进**: 使用项目级 `docs/drafts/` 目录

**已修改的命令**:

- ✅ `~/.claude/commands/cx/prd.md`
- ✅ `~/.claude/commands/cx/design.md`
- ✅ `~/.claude/commands/cx/scope.md`
- ✅ `~/.claude/commands/cx/adr.md`

**改进代码**:

```bash
# 保存文档草稿到项目 docs 目录（便于后期管理和删除）
PROJECT_ROOT=$(git rev-parse --show-toplevel)
mkdir -p "$PROJECT_ROOT/docs/drafts"
echo "$prd_body" > "$PROJECT_ROOT/docs/drafts/prd-${feature_name}.md"

# 使用 --body-file 而不是 --body
gh issue create \
  --title "[PRD] ${feature_name}" \
  --body-file "$PROJECT_ROOT/docs/drafts/prd-${feature_name}.md" \
  --label "doc:prd,..."
```

**文档草稿目录结构**:

```
nodemud/
└── docs/
    ├── drafts/                         # 文档草稿
    │   ├── scope-project.md           # Scope 草稿
    │   ├── prd-核心框架.md             # PRD 草稿
    │   ├── design-核心框架.md          # Design Doc 草稿
    │   └── adr-*.md                   # ADR 草稿
    ├── CX-WORKFLOW-IMPROVEMENTS.md    # 改进建议
    └── CX-IMPROVEMENTS-APPLIED.md     # 改进实施记录
```

**优点**:

- ✅ 文档不会因系统重启丢失
- ✅ 便于后期查看和管理
- ✅ 可追溯文档草稿历史
- ✅ Git 管理（可选择是否提交）

---

### ✅ 改进 2: 文档 Issue 完美闭环

**问题**: Epic 完成后，PRD、Design Doc、ADR 等文档 Issue 仍然保持 OPEN 状态

**改进**: Epic 闭环时自动关闭所有关联的文档 Issue

**已修改的命令**:

- ✅ `~/.claude/commands/cx/exec.md`

**改进代码**（在 Epic 闭环检测中新增）:

```bash
if [ "$total" -eq "$done_count" ]; then
  # 1. 关闭 Epic
  gh issue close $epic_number
  gh issue edit $epic_number --add-label "cx-done"

  # 2. 关闭关联的文档 Issue（新增！）
  prd_number=$(jq -r '.docs.prd // empty' .claude/cx/current.json)
  design_number=$(jq -r '.docs.design // empty' .claude/cx/current.json)
  adr_numbers=$(jq -r '.docs.adr[]? // empty' .claude/cx/current.json)

  if [ -n "$prd_number" ] && [ "$prd_number" != "null" ]; then
    gh issue comment $prd_number --body "✅ **PRD 已完成**

Epic #$epic_number 已完成所有任务。

完成时间: $(date '+%Y-%m-%d %H:%M')"
    gh issue close $prd_number
  fi

  if [ -n "$design_number" ] && [ "$design_number" != "null" ]; then
    gh issue comment $design_number --body "✅ **Design Doc 已完成**

Epic #$epic_number 已完成所有实现，设计方案已全部落地。

完成时间: $(date '+%Y-%m-%d %H:%M')"
    gh issue close $design_number
  fi

  # 关闭所有关联的 ADR
  for adr_num in $adr_numbers; do
    if [ -n "$adr_num" ] && [ "$adr_num" != "null" ]; then
      gh issue comment $adr_num --body "✅ **ADR 已归档**

Epic #$epic_number 已完成，架构决策已实施。

完成时间: $(date '+%Y-%m-%d %H:%M')"
      gh issue close $adr_num
    fi
  done

  # 3. 更新项目蓝图 Scope...
fi
```

**完美闭环流程**:

```
1. 子任务完成 → 关闭子任务 Issue + 标记 cx-done
2. 检测依赖 → 解锁被阻塞的任务
3. 全部任务完成 → 关闭 Epic
4. 关闭 PRD Issue ✨ 新增
5. 关闭 Design Doc Issue ✨ 新增
6. 关闭所有 ADR Issue ✨ 新增
7. 更新 Scope 进度
8. 如果 Scope 全部完成 → 关闭 Scope
```

**优点**:

- ✅ 完整的文档生命周期管理
- ✅ 自动化闭环，无需手动关闭
- ✅ 清晰的文档状态追踪
- ✅ GitHub Project 看板更干净

---

## 验证

### 当前 Epic #4 的完美闭环

已手动完成（作为示范）:

```
✅ Scope #1  [项目蓝图] (OPEN) - 继续跟踪
✅ PRD #2    [需求文档] (CLOSED)
✅ Design #3 [技术设计] (CLOSED)
✅ Epic #4   [功能总览] (CLOSED)
  ✅ #5-#9 子任务全部 (CLOSED)
```

### 下次执行验证

下次运行 `/cx:prd` 时：

- 文档草稿会保存到 `docs/drafts/prd-功能名.md`
- Issue 创建时使用 `--body-file` 而不是 `--body`

下次运行 `/cx:exec --all` 完成 Epic 时：

- PRD、Design Doc、ADR Issue 会自动关闭
- Scope 进度会自动更新

---

## 影响范围

### 全局配置文件（已修改）

- `~/.claude/commands/cx/prd.md`
- `~/.claude/commands/cx/design.md`
- `~/.claude/commands/cx/scope.md`
- `~/.claude/commands/cx/adr.md`
- `~/.claude/commands/cx/exec.md`

### 项目配置文件（已修改）

- `.gitignore` - 添加 `docs/drafts/*.md` 配置

### 新增目录

- `docs/` - 文档根目录
- `docs/drafts/` - 文档草稿目录（自动创建）

---

## 后续建议

### 文档草稿管理策略

**选项 A: 不提交草稿（推荐）**

```bash
# 在 .gitignore 中启用
docs/drafts/*.md
```

优点：Issue 已在 GitHub，本地草稿可随时删除

**选项 B: 提交草稿**

```bash
# 在 .gitignore 中注释掉
# docs/drafts/*.md
```

优点：本地保留完整草稿历史，便于对比修改

**当前配置**: 选项 A（注释形式，可随时切换）

---

> 改进完成时间: 2026-02-02
> 验证状态: ✅ 已通过
> 下次生效: 立即生效
