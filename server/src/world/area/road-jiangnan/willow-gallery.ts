/**
 * 水路·柳堤长廊 — 水路·江南段
 * 坐标: (2,0,0)
 * 柳树夹道的长廊，石板路两侧垂柳成荫
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadJiangnanWillowGallery extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '水路·柳堤长廊');
    this.set(
      'long',
      '两排老柳沿着堤岸一字排开，枝条低垂，编织成一条天然的绿色长廊。' +
        '阳光透过枝叶洒下斑驳的光影，踩在青石板上碎成一地零星。' +
        '堤下是一条不宽不窄的水渠，水面平静如镜，' +
        '柳枝的倒影在水中轻轻摇曳，偶尔有几尾锦鲤搅碎了整幅画面。' +
        '长廊尽头有一座石凳，上面刻着棋盘格，' +
        '不知是哪位闲人留下的，如今已被苔藓填满了棋格。',
    );
    this.set('coordinates', { x: 2, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-jiangnan/willow-road',
      east: 'area/road-jiangnan/waterside-inn',
    });
  }
}
