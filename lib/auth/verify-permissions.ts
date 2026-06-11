import { Tab, UserRole } from '../../types';

export type PlatformRole = 'admin' | 'portero' | 'residente' | 'internal' | 'superadmin';

export interface PermissionCheck {
  allowed: boolean;
  role: PlatformRole;
}

const ROLE_HIERARCHY: Record<PlatformRole, number> = {
  residente: 0,
  portero: 1,
  admin: 2,
  internal: 2,
  superadmin: 3,
};

const TAB_PERMISSIONS: Record<PlatformRole, Tab[]> = {
  admin: [
    Tab.Dashboard, Tab.Database, Tab.CommonAreas, Tab.Comunicaciones,
    Tab.Archivos, Tab.Finanzas, Tab.Seguridad, Tab.DueDates, Tab.PendingTasks,
  ],
  portero: [
    Tab.Dashboard, Tab.Seguridad,
  ],
  residente: [
    Tab.Dashboard, Tab.Comunicaciones,
  ],
  internal: [
    Tab.Dashboard, Tab.Finanzas, Tab.Seguridad,
  ],
  superadmin: Object.values(Tab),
};

const USER_ROLE_MAP: Record<UserRole, PlatformRole> = {
  [UserRole.Trial]: 'admin',
  [UserRole.Subscriber]: 'admin',
  [UserRole.Internal]: 'internal',
  [UserRole.Admin]: 'superadmin',
};

export function mapUserRole(role: UserRole): PlatformRole {
  return USER_ROLE_MAP[role] || 'admin';
}

export function getRoleLevel(role: PlatformRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

export function hasMinRole(userRole: PlatformRole, minimum: PlatformRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(minimum);
}

export function canAccessTab(role: PlatformRole, tab: Tab): boolean {
  return TAB_PERMISSIONS[role]?.includes(tab) ?? false;
}

export function getAccessibleTabs(role: PlatformRole): Tab[] {
  return TAB_PERMISSIONS[role] ?? [];
}

export function isConjuntoAdmin(role: PlatformRole): boolean {
  return role === 'admin';
}

export function checkPermission(
  userRole: UserRole | string,
  tab: Tab | null,
): PermissionCheck {
  const platformRole = mapUserRole(userRole as UserRole);
  if (!tab) return { allowed: true, role: platformRole };
  return {
    allowed: canAccessTab(platformRole, tab),
    role: platformRole,
  };
}
