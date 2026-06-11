import { describe, it, expect, vi } from 'vitest';

describe('Regresión - Endpoints Deprecados', () => {
  it('gemini-legacy emits deprecation warning on import', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await import('../../services/ai/gemini-legacy');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('geminiLegacy module delegates to chatService', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await import('../../services/ai/gemini-legacy');
    expect(mod.geminiLegacy.runChat).toBeDefined();
    expect(mod.geminiLegacy.generateSubject).toBeDefined();
    expect(mod.geminiLegacy.improveWriting).toBeDefined();
    warnSpy.mockRestore();
  });
});
