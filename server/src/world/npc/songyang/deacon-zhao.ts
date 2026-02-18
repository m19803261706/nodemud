/**
 * 赵执事 -- 嵩阳宗外务执事
 * 门派职责：捐献入账 / 见证叛门
 * 性格：精明 (cunning) / 说话风格：商贾气 (merchant)
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';

export default class SongyangDeaconZhao extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '赵执事');
    this.set('short', '一位手执账册的精干执事');
    this.set(
      'long',
      '赵执事腰间挂着一串旧算盘，案上账册摞得整齐。他说话不疾不徐，却把每笔来往都记得分明。',
    );
    this.set('title', '嵩阳宗');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'neutral');
    this.set('level', 32);
    this.set('max_hp', 2200);
    this.set('hp', 2200);
    this.set('combat_exp', 3600);

    // 性格标签
    this.set('personality', 'cunning');
    this.set('speech_style', 'merchant');

    this.set('sect_id', 'songyang');
    this.set('sect_role', 'deacon');

    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '赵执事翻过一页账册，蘸墨落笔。',
      '赵执事抬头看你一眼，道：「捐献入账，不可徇私。」',
      '赵执事轻敲算盘，珠声清脆。',
      '赵执事皱眉翻了翻账目，嘟囔道：「这月药材支出又超了……」',
      '赵执事拨着算盘，头也不抬：「又有人赊账不还，回头得跟陆长老提一嘴。」',
    ]);

    this.set('inquiry', {
      捐献: '赵执事道：「门中器物、药材皆可入账。若要捐献，直言便是。」',
      贡献: '赵执事道：「门中贡献记在账上，积少成多，自见分晓。」',
      叛门: '赵执事道：「一旦叛门，宗门永拒。话出口前先想清楚。」',
      default: '赵执事道：「账目在此，诸事凭规矩说话。」',
    });
  }
}
