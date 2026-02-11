/**
 * NPC 列表 — 右侧角色列表面板（含 NPC 卡片 + 地面物品卡片）
 */

import React, { useMemo, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import {
  MessageFactory,
  SkillCategory,
  SkillSlotType,
  type SkillLearnRequestData,
  type PlayerSkillInfo,
} from '@packages/core';
import { useGameStore, type NpcDetailData } from '../../../stores/useGameStore';
import { useSkillStore } from '../../../stores/useSkillStore';
import { wsService } from '../../../services/WebSocketService';
import { NpcCard } from './NpcCard';
import { NpcInfoModal } from './NpcInfoModal';
import { ItemCard } from './ItemCard';
import { ShopListModal } from './ShopListModal';
import { SkillPanel } from '../SkillPanel';

function mapNpcTeachSkillsToReadonlyItems(
  detail: NpcDetailData,
  playerSkills: PlayerSkillInfo[],
): PlayerSkillInfo[] {
  const learnedMap = new Map(playerSkills.map(skill => [skill.skillId, skill]));
  const teachSkills = detail.teachSkills ?? [];
  return teachSkills.map(skill => {
    const teachLevel =
      typeof skill.level === 'number' && Number.isFinite(skill.level)
        ? Math.max(0, Math.floor(skill.level))
        : 0;
    const learned = learnedMap.get(skill.skillId);
    if (learned) {
      return {
        ...learned,
        level: teachLevel > 0 ? teachLevel : learned.level,
      };
    }

    return {
      skillId: skill.skillId,
      skillName: skill.skillName,
      skillType: skill.skillType as SkillSlotType,
      category: skill.category as SkillCategory,
      level: teachLevel,
      learned: 0,
      learnedMax: Math.max(1, Math.pow(teachLevel + 1, 2)),
      isMapped: false,
      mappedSlot: null,
      isActiveForce: false,
      isLocked: false,
    };
  });
}

export const NpcList = () => {
  const nearbyNpcs = useGameStore(state => state.nearbyNpcs);
  const npcDetail = useGameStore(state => state.npcDetail);
  const shopListDetail = useGameStore(state => state.shopListDetail);
  const inventory = useGameStore(state => state.inventory);
  const playerSkills = useSkillStore(state => state.skills);
  const setNpcDetail = useGameStore(state => state.setNpcDetail);
  const setShopListDetail = useGameStore(state => state.setShopListDetail);
  const groundItems = useGameStore(state => state.groundItems);
  const sendCommand = useGameStore(state => state.sendCommand);
  const [npcSkillPanelDetail, setNpcSkillPanelDetail] =
    useState<NpcDetailData | null>(null);
  const npcSkillItems = useMemo(
    () =>
      npcSkillPanelDetail
        ? mapNpcTeachSkillsToReadonlyItems(npcSkillPanelDetail, playerSkills)
        : [],
    [npcSkillPanelDetail, playerSkills],
  );
  const canLearnFromNpcInPanel =
    !!npcSkillPanelDetail &&
    new Set(npcSkillPanelDetail.actions ?? []).has('learnSkill');

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        {nearbyNpcs.map(npc => (
          <NpcCard
            key={npc.id}
            npc={npc}
            onPress={() => sendCommand(`look ${npc.name}`)}
          />
        ))}
        {groundItems.length > 0 ? (
          <View>
            <Text style={s.sectionLabel}>地面物品</Text>
            {groundItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onPress={() => sendCommand(`look ${item.name}`)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
      <NpcInfoModal
        detail={npcDetail}
        inventory={inventory}
        onClose={() => setNpcDetail(null)}
        onViewSkills={detail => {
          setNpcSkillPanelDetail(detail);
        }}
        onChat={name => {
          sendCommand(`ask ${name} default`);
          setNpcDetail(null);
        }}
        onShop={name => {
          sendCommand(`list ${name}`);
          setNpcDetail(null);
        }}
        onApprentice={name => {
          sendCommand(`apprentice ${name}`);
          setNpcDetail(null);
        }}
        onDonate={(itemName, npcName) => {
          sendCommand(`donate ${itemName} to ${npcName}`);
        }}
        onSpar={name => {
          sendCommand(`spar ${name}`);
          setNpcDetail(null);
        }}
        onBetray={name => {
          sendCommand(`betray ${name}`);
          setNpcDetail(null);
        }}
        onSell={(itemName, npcName) => {
          sendCommand(`sell ${itemName} to ${npcName}`);
        }}
        onAttack={name => {
          sendCommand(`kill ${name}`);
        }}
        onGive={(itemName, npcName) => {
          sendCommand(`give ${itemName} to ${npcName}`);
        }}
        onQuestAccept={(questId, npcId) => {
          wsService.send(
            MessageFactory.create('questAccept', { questId, npcId }),
          );
          setNpcDetail(null);
        }}
        onQuestComplete={(questId, npcId) => {
          wsService.send(
            MessageFactory.create('questComplete', { questId, npcId }),
          );
          setNpcDetail(null);
        }}
      />
      <ShopListModal
        detail={shopListDetail}
        onClose={() => setShopListDetail(null)}
        onBuy={(selector, merchantName) => {
          sendCommand(`buy ${selector} from ${merchantName}`);
          setShopListDetail(null);
        }}
      />
      <SkillPanel
        visible={!!npcSkillPanelDetail}
        onClose={() => setNpcSkillPanelDetail(null)}
        title={
          npcSkillPanelDetail
            ? `${npcSkillPanelDetail.name} · 可传授武学`
            : '可传授武学'
        }
        skillsOverride={npcSkillItems}
        bonusSummaryOverride={null}
        readOnlyCatalog
        detailActionLabel={canLearnFromNpcInPanel ? '学习技能' : undefined}
        onDetailActionPress={skillId => {
          if (!npcSkillPanelDetail || !canLearnFromNpcInPanel) return;
          const req: SkillLearnRequestData = {
            npcId: npcSkillPanelDetail.npcId,
            skillId,
            times: 1,
          };
          wsService.send(MessageFactory.create('skillLearnRequest', req));
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 7,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
  },
  content: {
    padding: 8,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginTop: 4,
    marginBottom: 2,
  },
});
