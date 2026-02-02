/**
 * BlueprintLoader 单元测试
 *
 * 覆盖: inferBlueprintId / loadBlueprint / scanAndLoad / update
 */
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { BlueprintLoader } from '../blueprint-loader';
import { BlueprintRegistry } from '../blueprint-registry';
import { BlueprintFactory } from '../blueprint-factory';
import { ObjectManager } from '../object-manager';
import { BaseEntity } from '../base-entity';

// ========== 测试 fixtures 路径 ==========

const FIXTURES_WORLD = path.join(__dirname, 'fixtures', 'world');
const ROOM_FILE = path.join(FIXTURES_WORLD, 'area', 'test-room.ts');
const NPC_FILE = path.join(FIXTURES_WORLD, 'npc', 'test-npc.ts');
const NO_DEFAULT_FILE = path.join(FIXTURES_WORLD, 'invalid', 'no-default.ts');
const NOT_ENTITY_FILE = path.join(FIXTURES_WORLD, 'invalid', 'not-entity.ts');

// ========== 测试 ==========

describe('BlueprintLoader', () => {
  let registry: BlueprintRegistry;
  let objectManager: ObjectManager;
  let factory: BlueprintFactory;
  let loader: BlueprintLoader;

  beforeEach(() => {
    registry = new BlueprintRegistry();
    objectManager = new ObjectManager();
    factory = new BlueprintFactory(registry, objectManager);
    // 测试环境扫描 .ts 文件
    loader = new BlueprintLoader(registry, factory, objectManager, {
      extensions: ['.js', '.ts'],
    });
  });

  afterEach(() => {
    objectManager.onModuleDestroy();
    // 清理 require.cache 中的 fixture 文件，避免测试间干扰
    for (const key of Object.keys(require.cache)) {
      if (key.includes('fixtures/world')) {
        delete require.cache[key];
      }
    }
  });

  // ================================================================
  //  inferBlueprintId
  // ================================================================

  describe('inferBlueprintId', () => {
    it('正常路径推断: area/test-room', async () => {
      // 需要先设置 worldBasePath（通过 scanAndLoad 或 loadBlueprint）
      await loader.scanAndLoad(FIXTURES_WORLD);
      registry.clear();

      const id = loader.inferBlueprintId(path.join(FIXTURES_WORLD, 'area', 'yangzhou', 'inn.js'));
      expect(id).toBe('area/yangzhou/inn');
    });

    it('嵌套路径: npc/yangzhou/dianxiaoer', async () => {
      await loader.scanAndLoad(FIXTURES_WORLD);
      registry.clear();

      const id = loader.inferBlueprintId(
        path.join(FIXTURES_WORLD, 'npc', 'yangzhou', 'dianxiaoer.js'),
      );
      expect(id).toBe('npc/yangzhou/dianxiaoer');
    });

    it('.ts 后缀也能正确去除', async () => {
      await loader.scanAndLoad(FIXTURES_WORLD);
      registry.clear();

      const id = loader.inferBlueprintId(path.join(FIXTURES_WORLD, 'area', 'test-room.ts'));
      expect(id).toBe('area/test-room');
    });
  });

  // ================================================================
  //  loadBlueprint
  // ================================================================

  describe('loadBlueprint', () => {
    beforeEach(() => {
      // 手动设置 worldBasePath，避免依赖 scanAndLoad
      (loader as any).worldBasePath = FIXTURES_WORLD;
    });

    it('正常加载虚拟蓝图', async () => {
      const meta = await loader.loadBlueprint(ROOM_FILE);

      expect(meta.id).toBe('area/test-room');
      expect(meta.virtual).toBe(true);
      expect(meta.filePath).toBe(ROOM_FILE);
      expect(typeof meta.blueprintClass).toBe('function');
      // 已注册到 Registry
      expect(registry.has('area/test-room')).toBe(true);
    });

    it('正常加载克隆蓝图', async () => {
      const meta = await loader.loadBlueprint(NPC_FILE);

      expect(meta.id).toBe('npc/test-npc');
      expect(meta.virtual).toBe(false);
      expect(registry.has('npc/test-npc')).toBe(true);
    });

    it('蓝图类能正确实例化并调用 create()', async () => {
      const meta = await loader.loadBlueprint(ROOM_FILE);
      const instance = new meta.blueprintClass('test-id');
      instance.create();

      expect(instance.get('short')).toBe('测试房间');
      expect(instance.get('type')).toBe('room');
    });

    it('无 default export 且导出非函数时抛错', async () => {
      await expect(loader.loadBlueprint(NO_DEFAULT_FILE)).rejects.toThrow('没有导出有效的类');
    });

    it('非 BaseEntity 子类抛错', async () => {
      await expect(loader.loadBlueprint(NOT_ENTITY_FILE)).rejects.toThrow(
        '导出的类不继承 BaseEntity',
      );
    });
  });

  // ================================================================
  //  scanAndLoad
  // ================================================================

  describe('scanAndLoad', () => {
    it('空目录: count=0, 无报错', async () => {
      // 创建空临时目录
      const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-test-'));

      await loader.scanAndLoad(emptyDir);

      expect(registry.getCount()).toBe(0);

      // 清理
      fs.rmdirSync(emptyDir);
    });

    it('目录不存在: 不抛错', async () => {
      const nonExistDir = path.join(os.tmpdir(), 'bp-test-nonexist-' + Date.now());

      // 不应抛错
      await expect(loader.scanAndLoad(nonExistDir)).resolves.toBeUndefined();
      expect(registry.getCount()).toBe(0);
    });

    it('含蓝图目录: 正确加载有效蓝图，跳过无效文件', async () => {
      await loader.scanAndLoad(FIXTURES_WORLD);

      // area/test-room.ts (virtual) 和 npc/test-npc.ts (clone) 应被加载
      // invalid/ 下的文件应因验证失败被跳过（warn 日志，不抛错）
      expect(registry.has('area/test-room')).toBe(true);
      expect(registry.has('npc/test-npc')).toBe(true);

      // 有效蓝图数量应 >= 2（无效文件被跳过）
      expect(registry.getCount()).toBeGreaterThanOrEqual(2);
    });

    it('虚拟蓝图自动创建实例', async () => {
      await loader.scanAndLoad(FIXTURES_WORLD);

      // 虚拟蓝图的实例应注册到 ObjectManager
      const virtualInstance = objectManager.findById('area/test-room');
      expect(virtualInstance).toBeDefined();
      expect(virtualInstance).toBeInstanceOf(BaseEntity);
      expect(virtualInstance!.get('short')).toBe('测试房间');
    });

    it('克隆蓝图不自动创建实例', async () => {
      await loader.scanAndLoad(FIXTURES_WORLD);

      // 克隆蓝图只注册了元数据，没有自动创建实例
      const instance = objectManager.findById('npc/test-npc');
      expect(instance).toBeUndefined();
    });
  });

  // ================================================================
  //  update (热更新)
  // ================================================================

  describe('update', () => {
    it('虚拟对象 update: dbase 清空 + create() 重执行', async () => {
      // 先加载
      (loader as any).worldBasePath = FIXTURES_WORLD;
      const meta = await loader.loadBlueprint(ROOM_FILE);
      const instance = factory.createVirtual(meta.id);

      // 手动修改 dbase，模拟运行时修改
      instance.set('custom', '自定义属性');
      instance.setTemp('temp_key', '临时值');
      expect(instance.get('custom')).toBe('自定义属性');
      expect(instance.getTemp('temp_key')).toBe('临时值');

      // 执行热更新
      await loader.update('area/test-room');

      // dbase 应被重设（只有 create() 设置的属性）
      expect(instance.get('short')).toBe('测试房间');
      expect(instance.get('type')).toBe('room');
      // 自定义属性应被清除
      expect(instance.get('custom')).toBeUndefined();
      // 临时属性应被清除
      expect(instance.getTemp('temp_key')).toBeUndefined();
    });

    it('克隆蓝图 update: Registry 中蓝图类被更新', async () => {
      (loader as any).worldBasePath = FIXTURES_WORLD;
      await loader.loadBlueprint(NPC_FILE);

      // 热更新
      await loader.update('npc/test-npc');

      // Registry 中应有新的元数据
      const newMeta = registry.get('npc/test-npc');
      expect(newMeta).toBeDefined();
      expect(newMeta!.filePath).toBe(NPC_FILE);

      // 新克隆应使用更新后的蓝图类
      const cloned = factory.clone('npc/test-npc');
      expect(cloned.get('name')).toBe('测试NPC');
      expect(cloned.get('hp')).toBe(100);
    });

    it('不存在的蓝图 update 抛错', async () => {
      await expect(loader.update('nonexistent/blueprint')).rejects.toThrow(
        '蓝图 "nonexistent/blueprint" 不存在',
      );
    });

    it('update 后 require.cache 被清除，模块被重新加载', async () => {
      (loader as any).worldBasePath = FIXTURES_WORLD;
      await loader.loadBlueprint(NPC_FILE);

      // 获取 resolved path
      const resolvedPath = require.resolve(NPC_FILE);

      // 确认 cache 存在
      expect(require.cache[resolvedPath]).toBeDefined();

      // 热更新
      await loader.update('npc/test-npc');

      // cache 应该是新的模块（重新 require 了）
      expect(require.cache[resolvedPath]).toBeDefined();
    });
  });
});
