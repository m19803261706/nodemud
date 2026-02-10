import { parseRichText } from '../parseRichText';

describe('parseRichText', () => {
  it('supports legacy [important] alias as imp tag', () => {
    const nodes = parseRichText('[important]恭喜升级[/important]', 'light');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].text).toBe('恭喜升级');
    expect(nodes[0].color).toBe('#C04020');
  });

  it('supports legacy escaped close tag [\\/important]', () => {
    const nodes = parseRichText('[important]恭喜升级[\\/important]', 'light');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].text).toBe('恭喜升级');
    expect(nodes[0].color).toBe('#C04020');
  });
});
