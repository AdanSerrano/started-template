import { pgEnum } from 'drizzle-orm/pg-core'

// --- Roles ---
export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'admin',
  'user',
])

// --- Direcciones ---
export const addressTypeEnum = pgEnum('address_type', ['shipping', 'billing'])

// --- Audit Logs ---
export const auditSeverityEnum = pgEnum('audit_severity', [
  'low',
  'medium',
  'high',
  'critical',
])
