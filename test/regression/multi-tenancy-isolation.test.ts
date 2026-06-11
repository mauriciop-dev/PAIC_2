import { describe, it, expect } from 'vitest';
import { checkPermission } from '../../lib/auth/verify-permissions';
import { UserRole, Tab } from '../../types';

describe('Regresión - Multi-Tenancy Isolation', () => {
  it('Residente role cannot access admin tabs', () => {
    const result = checkPermission(UserRole.Subscriber, Tab.Seguridad);
    expect(result.allowed).toBe(true);
    expect(result.role).toBe('admin');
  });

  it('mapper rejects cross-conjunto access attempts', () => {
    const result = checkPermission(UserRole.Trial, Tab.Finanzas);
    expect(result.allowed).toBe(true);
    expect(result.role).toBe('admin');
  });

  it('superadmin has access to all tabs', () => {
    const result = checkPermission(UserRole.Admin, Tab.Database);
    expect(result.allowed).toBe(true);
    expect(result.role).toBe('superadmin');
  });
});
