import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

let onAuthChangeCallback: ((event: string, session: any) => void) | null = null;

vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn((_event: string, callback: any) => {
        onAuthChangeCallback = callback;
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      }),
      signOut: vi.fn(),
    },
    removeAllChannels: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('../../services/apiService', () => ({
  apiService: {
    fetchUserProfile: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('../../lib/auth/verify-permissions', () => ({
  mapUserRole: vi.fn(() => 'admin'),
  isConjuntoAdmin: vi.fn(() => false),
  checkIsAdminRole: vi.fn(() => false),
  canAccessTab: vi.fn(() => true),
  getAccessibleTabs: vi.fn(() => []),
  checkPermission: vi.fn(() => ({ allowed: false, role: 'admin' })),
}));

describe('Regresión - Dashboard Post-Migración IA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthChangeCallback = null;
  });

  it('App renders without throwing', async () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('Dashboard loads without console errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);

    if (onAuthChangeCallback) {
      onAuthChangeCallback('INITIAL_SESSION', null);
    }

    // Wait for state updates to settle
    await vi.dynamicImportSettled();
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
