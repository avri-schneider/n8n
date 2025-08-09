import { describe, it, expect } from 'vitest';
import type { INodeUi } from '@/Interface';
import type { NodeParameterValue, INodeParameters } from 'n8n-workflow';
import { __test__ } from '../useWorkflowHelpers';

const { resolveParameterFromUiContext } = __test__;

function makeActiveNode(parameters: Record<string, unknown>): INodeUi {
  return {
    id: '1',
    name: 'Test Node',
    type: 'n8n-nodes-base.test',
    typeVersion: 1,
    position: [0, 0],
    parameters,
  } as unknown as INodeUi;
}

describe('resolveParameterFromUiContext (UI-only $parameter resolution)', () => {
  it('returns the parameter value for $parameter["key"]', () => {
    const activeNode = makeActiveNode({ path: 'foo', count: 42 });
    const expr: NodeParameterValue | INodeParameters = '={{$parameter["path"]}}';
    expect(resolveParameterFromUiContext<string>(expr, activeNode)).toBe('foo');
  });

  it('preserves non-string values (generic type)', () => {
    const activeNode = makeActiveNode({ count: 42 });
    const expr: NodeParameterValue = '={{$parameter["count"]}}';
    expect(resolveParameterFromUiContext<number>(expr, activeNode)).toBe(42);
  });

  it('returns empty string when activeNode is null', () => {
    const expr: NodeParameterValue = '={{$parameter["anything"]}}';
    expect(resolveParameterFromUiContext<string>(expr, null)).toBe('');
  });

  it('returns empty string when parameter is not a string', () => {
    const activeNode = makeActiveNode({ path: 'foo' });
    const expr = 123 as unknown as NodeParameterValue;
    expect(resolveParameterFromUiContext<string>(expr, activeNode)).toBe('');
  });

  it('returns empty string when expression does not include $parameter', () => {
    const activeNode = makeActiveNode({ path: 'foo' });
    const expr = '={{$json["path"]}}';
    expect(resolveParameterFromUiContext<string>(expr, activeNode)).toBe('');
  });

  it('returns empty string when key is missing', () => {
    const activeNode = makeActiveNode({ path: 'foo' });
    const expr = '={{$parameter["missing"]}}';
    expect(resolveParameterFromUiContext<string>(expr, activeNode)).toBe('');
  });

  it('works with surrounding text if $parameter["..."] appears', () => {
    const activeNode = makeActiveNode({ path: 'foo' });
    const expr = 'prefix {{$parameter["path"]}} suffix';
    expect(resolveParameterFromUiContext<string>(expr, activeNode)).toBe('foo');
  });
});
