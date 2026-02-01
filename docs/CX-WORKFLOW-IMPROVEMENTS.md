# CX 工作流改进建议

## 问题 1: 临时文档路径不当

### 当前问题

`/cx:prd` 和 `/cx:design` 命令在创建 Issue 内容时，使用系统临时目录 `/tmp/`：

```bash
cat > /tmp/prd_issue.md << 'EOF'
...
EOF
gh issue create --body-file /tmp/prd_issue.md
```

**缺点**：

- 系统重启后临时文件丢失
- 不便于后期查看和管理
- 无法追溯文档草稿历史

### 改进方案

使用项目根目录下的 `docs/` 目录：

```bash
# 在项目根目录下创建 docs 目录
mkdir -p "$PROJECT_ROOT/docs/drafts"

# 使用项目级路径存储文档草稿
cat > "$PROJECT_ROOT/docs/drafts/prd-${feature_name}.md" << 'EOF'
...
EOF
gh issue create --body-file "$PROJECT_ROOT/docs/drafts/prd-${feature_name}.md"
```

**目录结构**：

```
nodemud/
├── docs/
│   ├── drafts/                    # 文档草稿
│   │   ├── prd-核心框架.md
│   │   ├── design-核心框架.md
│   │   └── adr-*.md
│   ├── decisions/                 # ADR 归档（可选）
│   └── CX-WORKFLOW-IMPROVEMENTS.md
```

**.gitignore 配置**：

```
# 可选：文档草稿不提交（Issue 已创建到 GitHub）
docs/drafts/*.md

# 或者提交草稿，方便本地查看
# docs/drafts/
```

### 需要修改的命令

1. `~/.claude/commands/cx/prd.md`
2. `~/.claude/commands/cx/design.md`
3. `~/.claude/commands/cx/adr.md`（如果有）

**修改示例**（prd.md）：

```bash
# 第 6 步：创建 PRD Issue

# ❌ 旧方案
cat > /tmp/prd_issue.md << 'EOF'
...
EOF

# ✅ 新方案
PROJECT_ROOT=$(git rev-parse --show-toplevel)
mkdir -p "$PROJECT_ROOT/docs/drafts"

cat > "$PROJECT_ROOT/docs/drafts/prd-${feature_name}.md" << 'EOF'
...
EOF

prd_url=$(gh issue create \
  --title "[PRD] ${feature_name}" \
  --body-file "$PROJECT_ROOT/docs/drafts/prd-${feature_name}.md" \
  --label "doc:prd,feat:$feature_name,${priority_label}")
```

---

## 问题 2: 文档 Issue 未闭环

### 当前问题

Epic 完成后，只关闭了 Epic 和子任务 Issue，但是 PRD、Design Doc、ADR 等文档 Issue 仍然 OPEN。

**当前状态**（不完美）：

```
Scope #1  [项目蓝图] (OPEN)
  ↓
PRD #2    [需求文档] (OPEN) ❌ 应该关闭
  ↓
Design #3 [技术设计] (OPEN) ❌ 应该关闭
  ↓
Epic #4   [功能总览] (CLOSED) ✅
  ├── #5-#9 子任务 (CLOSED) ✅
```

**期望状态**（完美闭环）：

```
Scope #1  [项目蓝图] (OPEN) ✅ 继续跟踪整体进度
  ↓
PRD #2    [需求文档] (CLOSED) ✅
  ↓
Design #3 [技术设计] (CLOSED) ✅
  ↓
Epic #4   [功能总览] (CLOSED) ✅
  ├── #5-#9 子任务 (CLOSED) ✅
```

### 改进方案

在 Epic 闭环检测时（`/cx:exec` 的 Step 5），增加关闭文档 Issue 的逻辑：

```bash
# Step 5: 更新本地状态 + Epic 闭环检测

if [ "$total" -eq "$done_count" ]; then
  # === Epic 全部完成，触发闭环 ===

  # 1. 关闭 Epic
  gh issue comment $epic_number --body "Epic 完成..."
  gh issue close $epic_number
  gh issue edit $epic_number --remove-label "cx-progress" --add-label "cx-done"

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

  # 3. 更新项目蓝图 Scope（如有）
  # ... 原有逻辑 ...
fi
```

---

## 改进实施

### 需要修改的文件

1. `~/.claude/commands/cx/prd.md` - 修改临时文档路径
2. `~/.claude/commands/cx/design.md` - 修改临时文档路径
3. `~/.claude/commands/cx/adr.md` - 修改临时文档路径（如果有）
4. `~/.claude/commands/cx/exec.md` - 增加文档 Issue 闭环逻辑

### 项目 .gitignore 配置

```bash
# 添加到 .gitignore（如果不想提交文档草稿）
docs/drafts/*.md

# 或者不添加，保留草稿历史
```

---

## 当前 Epic #4 闭环修复

虽然当前的命令还没修复，但是我已手动完成了此次的完美闭环：

- ✅ Epic #4 已关闭
- ✅ PRD #2 已关闭
- ✅ Design #3 已关闭
- ✅ 子任务 #5-#9 已关闭
- ✅ Scope #1 已更新进度

完整的文档链路：

```
Scope #1  [项目蓝图] (OPEN) - 继续跟踪整体进度
  ↓
PRD #2    [需求文档] (CLOSED) ✅
  ↓
Design #3 [技术设计] (CLOSED) ✅
  ↓
Epic #4   [功能总览] (CLOSED) ✅
  ├── #5 后端初始化 (CLOSED) ✅
  ├── #6 前端初始化 (CLOSED) ✅
  ├── #7 代码规范 (CLOSED) ✅
  ├── #8 项目配置 (CLOSED) ✅
  └── #9 集成测试 (CLOSED) ✅
```

---

## 建议操作

1. **立即修复**：手动编辑 `~/.claude/commands/cx/` 下的命令文件
2. **下次执行**：下次运行 `/cx:prd` 时，文档草稿会自动存储到 `docs/drafts/`
3. **自动闭环**：下次 Epic 完成时，文档 Issue 会自动关闭

---

> 创建时间: 2026-02-02
> 问题发现者：用户反馈
