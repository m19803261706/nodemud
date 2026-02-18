/**
 * SectTaskPanel -- 门派日常/周常任务面板
 * 展示当前任务进度、可领取任务列表、交付/放弃操作
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MessageFactory } from '@packages/core';
import type {
  SectTaskInstanceDTO,
  SectTaskTemplateSummary,
  SectTaskProgressDTO,
} from '@packages/core';
import { wsService } from '../../../services/WebSocketService';
import { useGameStore } from '../../../stores/useGameStore';

export const SectTaskPanel = () => {
  const sectTaskData = useGameStore(state => state.sectTaskData);

  /** 打开面板时请求任务数据 */
  useEffect(() => {
    wsService.send(MessageFactory.create('sectTaskRequest', {}));
  }, []);

  if (!sectTaskData) {
    return (
      <View style={s.container}>
        <Text style={s.sectionTitle}>门派任务</Text>
        <View style={s.card}>
          <Text style={s.hint}>加载中...</Text>
        </View>
      </View>
    );
  }

  const {
    activeDailyTask,
    activeWeeklyTask,
    progress,
    availableDailyTemplates,
    availableWeeklyTemplates,
    nearTaskPublisher,
    taskPublisherName,
  } = sectTaskData;

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>门派任务</Text>

      {/* 进度概览 */}
      <TaskProgressBar progress={progress} />

      {/* 不在 NPC 身边的提示 */}
      {!nearTaskPublisher ? (
        <View style={s.card}>
          <Text style={s.hintNpc}>
            前往{taskPublisherName ?? '门派执事'}处领取或交付任务
          </Text>
        </View>
      ) : null}

      {/* 日常任务区 */}
      <View style={s.card}>
        <Text style={s.subTitle}>
          日常任务 ({progress.dailyCount}/{progress.dailyMax})
        </Text>
        {activeDailyTask ? (
          <ActiveTask task={activeDailyTask} canOperate={nearTaskPublisher} />
        ) : progress.dailyCount >= progress.dailyMax ? (
          <Text style={s.hint}>今日日常次数已用完</Text>
        ) : nearTaskPublisher && availableDailyTemplates.length > 0 ? (
          <TemplateList templates={availableDailyTemplates} category="daily" />
        ) : !nearTaskPublisher ? (
          <Text style={s.hint}>需在执事处领取</Text>
        ) : (
          <Text style={s.hint}>暂无可用任务</Text>
        )}
      </View>

      {/* 周常任务区 */}
      <View style={s.card}>
        <Text style={s.subTitle}>
          周常任务 ({progress.weeklyCount}/{progress.weeklyMax})
        </Text>
        {activeWeeklyTask ? (
          <ActiveTask task={activeWeeklyTask} canOperate={nearTaskPublisher} />
        ) : progress.weeklyCount >= progress.weeklyMax ? (
          <Text style={s.hint}>本周周常次数已用完</Text>
        ) : nearTaskPublisher && availableWeeklyTemplates.length > 0 ? (
          <TemplateList
            templates={availableWeeklyTemplates}
            category="weekly"
          />
        ) : !nearTaskPublisher ? (
          <Text style={s.hint}>需在执事处领取</Text>
        ) : (
          <Text style={s.hint}>暂无可用任务</Text>
        )}
      </View>
    </View>
  );
};

/** 进度条 */
const TaskProgressBar = ({ progress }: { progress: SectTaskProgressDTO }) => (
  <View style={s.progressRow}>
    <Text style={s.progressText}>累计完成 {progress.totalCompleted} 次</Text>
    {progress.nextMilestone ? (
      <Text style={s.progressHint}>下一里程碑: {progress.nextMilestone}</Text>
    ) : null}
  </View>
);

/** 活跃任务卡片 */
const ActiveTask = ({ task, canOperate }: { task: SectTaskInstanceDTO; canOperate: boolean }) => {
  const handleComplete = useCallback(() => {
    wsService.send(
      MessageFactory.create('sectTaskComplete', { category: task.category }),
    );
  }, [task.category]);

  const handleAbandon = useCallback(() => {
    wsService.send(
      MessageFactory.create('sectTaskAbandon', { category: task.category }),
    );
  }, [task.category]);

  const allDone = task.objectives.every(obj => obj.current >= obj.count);

  return (
    <View style={s.activeTask}>
      <Text style={s.taskName}>{task.name}</Text>
      <Text style={s.taskDesc}>{task.description}</Text>

      {/* 目标列表 */}
      {task.objectives.map((obj, i) => (
        <View key={i} style={s.objRow}>
          <Text
            style={[
              s.objText,
              obj.current >= obj.count ? s.objDone : undefined,
            ]}
          >
            {obj.description}
          </Text>
          <Text
            style={[
              s.objCount,
              obj.current >= obj.count ? s.objDone : undefined,
            ]}
          >
            {obj.current}/{obj.count}
          </Text>
        </View>
      ))}

      {/* 操作按钮 */}
      <View style={s.btnRow}>
        {allDone && canOperate ? (
          <TouchableOpacity style={s.btnComplete} onPress={handleComplete}>
            <Text style={s.btnCompleteText}>交付任务</Text>
          </TouchableOpacity>
        ) : allDone && !canOperate ? (
          <Text style={s.hintReturn}>返回执事处交付</Text>
        ) : null}
        <TouchableOpacity style={s.btnAbandon} onPress={handleAbandon}>
          <Text style={s.btnAbandonText}>放弃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/** 可领取模板列表 */
const TemplateList = ({
  templates,
  category,
}: {
  templates: SectTaskTemplateSummary[];
  category: 'daily' | 'weekly';
}) => {
  const handleAccept = useCallback(
    (templateId: string) => {
      wsService.send(
        MessageFactory.create('sectTaskAccept', { templateId, category }),
      );
    },
    [category],
  );

  return (
    <View style={s.templateList}>
      {templates.map(t => (
        <TouchableOpacity
          key={t.templateId}
          style={s.templateItem}
          onPress={() => handleAccept(t.templateId)}
        >
          <Text style={s.templateName}>{t.name}</Text>
          <Text style={s.templateAction}>领取</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#F5F0E8',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  hint: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    fontStyle: 'italic',
  },
  hintNpc: {
    fontSize: 12,
    color: '#2E6B8A',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
  },
  hintReturn: {
    fontSize: 11,
    color: '#2E6B8A',
    fontFamily: 'Noto Serif SC',
    fontStyle: 'italic',
    flex: 1,
    textAlignVertical: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  progressHint: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  activeTask: {
    gap: 4,
  },
  taskName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B2F8A',
    fontFamily: 'Noto Serif SC',
  },
  taskDesc: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 16,
  },
  objRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  objText: {
    fontSize: 11,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    flex: 1,
  },
  objCount: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginLeft: 8,
  },
  objDone: {
    color: '#2F7A3F',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btnComplete: {
    flex: 1,
    backgroundColor: '#2F7A3F18',
    borderWidth: 1,
    borderColor: '#2F7A3F40',
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: 'center',
  },
  btnCompleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F7A3F',
    fontFamily: 'Noto Serif SC',
  },
  btnAbandon: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderRadius: 4,
    alignItems: 'center',
  },
  btnAbandonText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  templateList: {
    gap: 4,
  },
  templateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A15',
  },
  templateName: {
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  templateAction: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E6B8A',
    fontFamily: 'Noto Serif SC',
  },
});
