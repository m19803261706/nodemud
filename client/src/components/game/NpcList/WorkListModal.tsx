/**
 * 打工工单弹窗
 * 展示 NPC 可分配活计，并直接选择档位开工
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from '../../LinearGradient';
import type { WorkListDetail, WorkOfferView } from '../../../stores/useGameStore';

interface WorkListModalProps {
  detail: WorkListDetail | null;
  onClose: () => void;
  onStart: (jobId: string, plan: 'once' | 'short' | 'medium' | 'auto', npcId: string) => void;
}

const Divider = () => (
  <LinearGradient
    colors={['#8B7A5A00', '#8B7A5A60', '#8B7A5A00']}
    style={s.divider}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
  />
);

const PlanButton = ({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={s.planBtnWrap}
    onPress={onPress}
    activeOpacity={0.75}
    disabled={disabled}
  >
    <View style={[s.planBtn, disabled ? s.planBtnDisabled : null]}>
      <LinearGradient
        colors={
          disabled
            ? ['#CFC8BD', '#C6BFB3', '#B8B0A4']
            : ['#D5CEC0', '#C9C2B4', '#B8B0A0']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Text style={[s.planBtnText, disabled ? s.planBtnTextDisabled : null]}>
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const JobRow = ({
  job,
  npcId,
  onStart,
}: {
  job: WorkOfferView;
  npcId: string;
  onStart: (jobId: string, plan: 'once' | 'short' | 'medium' | 'auto', npcId: string) => void;
}) => {
  const disabled = !job.eligible;

  return (
    <View style={s.jobRow}>
      <View style={s.jobHeadRow}>
        <Text style={s.jobTitle}>{job.title}</Text>
        <Text style={s.jobAttr}>宜:{job.recommendedAttr}</Text>
      </View>
      <Text style={s.jobSummary}>{job.summary}</Text>
      <Text style={s.jobHint}>{job.newbieHint}</Text>
      <Text style={s.jobMeta}>
        预估每轮消耗：气血 {job.estimateCost.hp} / 精力 {job.estimateCost.energy}
      </Text>
      <Text style={s.jobMeta}>
        预估每轮收益：经验 {job.estimateReward.exp} · 潜能 {job.estimateReward.potential} · 银两 {job.estimateReward.silver}
      </Text>
      {job.tags.length > 0 ? (
        <Text style={s.jobTags}>标签：{job.tags.join('、')}</Text>
      ) : null}

      {disabled ? (
        <View style={s.reasonBox}>
          <Text style={s.reasonText}>{job.reason ?? '当前不可接此活计。'}</Text>
        </View>
      ) : (
        <View style={s.planRow}>
          {job.planOptions.map(plan => (
            <PlanButton
              key={`${job.jobId}-${plan.key}`}
              label={plan.label}
              onPress={() => onStart(job.jobId, plan.key, npcId)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export const WorkListModal = ({ detail, onClose, onStart }: WorkListModalProps) => {
  if (!detail) return null;

  return (
    <Modal
      visible={!!detail}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={s.card}>
              <LinearGradient
                colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View style={s.borderOverlay} pointerEvents="none" />

              <View style={s.content}>
                <View style={s.headerRow}>
                  <View>
                    <Text style={s.title}>工单</Text>
                    <Text style={s.npcName}>{detail.npcName}</Text>
                  </View>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={s.closeText}>关闭</Text>
                  </TouchableOpacity>
                </View>

                <Divider />

                <View style={s.dailyBox}>
                  <Text style={s.dailyTitle}>今日进度</Text>
                  <Text style={s.dailyText}>
                    已得：经验 {detail.dailyProgress.expEarned} · 潜能 {detail.dailyProgress.potentialEarned} · 银两 {detail.dailyProgress.silverEarned}
                  </Text>
                  <Text style={s.dailyText}>
                    剩余：经验 {detail.dailyProgress.expRemaining} · 潜能 {detail.dailyProgress.potentialRemaining}
                  </Text>
                </View>

                {detail.active ? (
                  <View style={s.activeBox}>
                    <Text style={s.activeText}>
                      正在进行：{detail.active.title}（已完成 {detail.active.roundsCompleted}
                      {detail.active.roundsPlanned == null ? ' / 持续' : ` / ${detail.active.roundsPlanned}`}
                      ）
                    </Text>
                  </View>
                ) : null}

                <Divider />

                {detail.jobs.length > 0 ? (
                  <ScrollView style={s.jobsScroll} nestedScrollEnabled>
                    {detail.jobs.map(job => (
                      <View key={job.jobId}>
                        <JobRow job={job} npcId={detail.npcId} onStart={onStart} />
                        <Divider />
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={s.emptyText}>这位 NPC 暂时没有活计。</Text>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 320,
    maxHeight: 560,
    borderRadius: 4,
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 4,
  },
  content: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  npcName: {
    marginTop: 2,
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  closeText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 6,
  },
  dailyBox: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#8B7A5A20',
    borderRadius: 3,
    backgroundColor: '#FFFFFF40',
    gap: 2,
  },
  dailyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5048',
    fontFamily: 'Noto Serif SC',
  },
  dailyText: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  activeBox: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 3,
    backgroundColor: '#8B7A5A15',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
  },
  activeText: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  jobsScroll: {
    maxHeight: 390,
  },
  jobRow: {
    gap: 4,
    paddingVertical: 4,
  },
  jobHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  jobAttr: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  jobSummary: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5A5550',
    fontFamily: 'Noto Serif SC',
  },
  jobHint: {
    fontSize: 11,
    color: '#7A6B5A',
    fontFamily: 'Noto Serif SC',
  },
  jobMeta: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  jobTags: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  planRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  planBtnWrap: {
    width: 68,
  },
  planBtn: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    borderRadius: 2,
    overflow: 'hidden',
  },
  planBtnDisabled: {
    borderColor: '#8B7A5A40',
  },
  planBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 1,
  },
  planBtnTextDisabled: {
    color: '#9A9388',
  },
  reasonBox: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#8B4A4A30',
    backgroundColor: '#8B4A4A10',
  },
  reasonText: {
    fontSize: 11,
    color: '#8B4A4A',
    fontFamily: 'Noto Serif SC',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    paddingVertical: 20,
  },
});
