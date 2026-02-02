/**
 * 路径式嵌套值操作工具
 * 对标炎黄 MUD dbase.c 的 _set/_query/_delete
 */

/**
 * 按路径获取嵌套值
 * 第一层是 Map，深层是普通对象
 */
export function getNestedValue(
  data: Map<string, any>,
  parts: string[],
): any | undefined {
  let current: any = data;
  for (const part of parts) {
    if (current instanceof Map) {
      current = current.get(part);
    } else if (current && typeof current === 'object') {
      current = current[part];
    } else {
      return undefined;
    }
    if (current === undefined) return undefined;
  }
  return current;
}

/**
 * 按路径设置嵌套值，自动创建中间层
 */
export function setNestedValue(
  data: Map<string, any>,
  parts: string[],
  value: any,
): void {
  if (parts.length === 0) return;

  if (parts.length === 1) {
    data.set(parts[0], value);
    return;
  }

  let current = data.get(parts[0]);
  if (!current || typeof current !== 'object' || current instanceof Map) {
    current = {};
    data.set(parts[0], current);
  }

  for (let i = 1; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * 按路径删除嵌套值
 */
export function deleteNestedValue(
  data: Map<string, any>,
  parts: string[],
): boolean {
  if (parts.length === 0) return false;

  if (parts.length === 1) {
    return data.delete(parts[0]);
  }

  let current: any = data.get(parts[0]);
  for (let i = 1; i < parts.length - 1; i++) {
    if (!current || typeof current !== 'object') return false;
    current = current[parts[i]];
  }

  if (!current || typeof current !== 'object') return false;

  const lastKey = parts[parts.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  return false;
}
