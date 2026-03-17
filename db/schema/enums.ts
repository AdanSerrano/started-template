import { createEnum } from '@/db/dialect'

// --- Roles ---
export const userRoleEnum = createEnum('user_role', [
  'super_admin',
  'admin',
  'user',
])

// --- Direcciones ---
export const addressTypeEnum = createEnum('address_type', [
  'shipping',
  'billing',
])

// --- Audit Logs ---
export const auditSeverityEnum = createEnum('audit_severity', [
  'low',
  'medium',
  'high',
  'critical',
])

// --- Organizaciones ---
export const organizationPlanEnum = createEnum('organization_plan', [
  'free',
  'pro',
  'enterprise',
])

export const orgMemberRoleEnum = createEnum('org_member_role', [
  'owner',
  'admin',
  'member',
  'viewer',
])
