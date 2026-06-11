import { describe, it, expect, vi } from 'vitest';
import { HIDDEN_TOOLS_SPEC, TOOL_IMPLEMENTATION_MAP } from '../../lib/ai/occulted-tools';

describe('Regresión - No Exposición de Tools', () => {
  const functionDeclarations = HIDDEN_TOOLS_SPEC[0]?.functionDeclarations ?? [];

  it('Tool names are obfuscated (no technical function names)', () => {
    const toolNames = functionDeclarations.map((fd: any) => fd.name).filter(Boolean);
    const technicalPatterns = [/addResident/i, /queryDatabase/i, /executeTool/i, /deleteRecord/i];

    for (const name of toolNames) {
      for (const pattern of technicalPatterns) {
        expect(name).not.toMatch(pattern);
      }
    }
  });

  it('Backend implementation names never appear in exposed tool spec', () => {
    const toolNames = functionDeclarations.map((fd: any) => fd.name).filter(Boolean);
    const realNames = Object.values(TOOL_IMPLEMENTATION_MAP);

    for (const name of realNames) {
      expect(toolNames).not.toContain(name);
    }
  });
});
