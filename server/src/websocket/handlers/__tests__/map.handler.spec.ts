import { ObjectManager } from '../../../engine/object-manager';
import { Area } from '../../../engine/game-objects/area';
import { MapHandler } from '../map.handler';

describe('MapHandler.findAreaByRoom', () => {
  function createHandlerWithArea(areaId: string, rooms: string[]): MapHandler {
    const objectManager = new ObjectManager();
    const area = new Area(areaId);
    area.set('rooms', rooms);
    objectManager.register(area);

    return new MapHandler(objectManager, {} as any, {} as any);
  }

  it('当 area 实例 ID 为 area/x/area 时，返回规范化 areaId（area/x）', () => {
    const handler = createHandlerWithArea('area/rift-town/area', [
      'area/rift-town/square',
      'area/rift-town/north-street',
    ]);

    const result = handler.findAreaByRoom('area/rift-town/north-street');

    expect(result).not.toBeNull();
    expect(result?.area.id).toBe('area/rift-town/area');
    expect(result?.areaId).toBe('area/rift-town');
  });

  it('当 area 实例 ID 已是 area/x 时，保持该规范化 ID', () => {
    const handler = createHandlerWithArea('area/songyang', [
      'area/songyang/gate',
      'area/songyang/hall',
    ]);

    const result = handler.findAreaByRoom('area/songyang/hall');

    expect(result).not.toBeNull();
    expect(result?.area.id).toBe('area/songyang');
    expect(result?.areaId).toBe('area/songyang');
  });

  it('找不到房间时返回 null', () => {
    const handler = createHandlerWithArea('area/rift-town/area', [
      'area/rift-town/square',
    ]);

    const result = handler.findAreaByRoom('area/rift-town/not-exists');

    expect(result).toBeNull();
  });
});
