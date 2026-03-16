import { createAccessControl } from 'better-auth/plugins/access'

/**
 * Custom access control statements for Starter App.
 * Each key is a resource, values are the allowed actions.
 */
const statement = {
  poster: ['create', 'read', 'update', 'delete', 'publish'],
  category: ['create', 'read', 'update', 'delete'],
  order: ['create', 'read', 'update', 'cancel', 'refund'],
  coupon: ['create', 'read', 'update', 'delete'],
  report: ['create', 'read', 'export'],
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete'],
  session: ['list', 'revoke', 'delete'],
  settings: ['read', 'update'],
} as const

export const ac = createAccessControl(statement)

/**
 * Roles matching userRoleEnum values exactly.
 * super_admin: Full access to everything
 * admin: Manages store (no impersonate/delete users)
 * user: Browse and purchase
 */
export const superAdmin = ac.newRole({
  poster: ['create', 'read', 'update', 'delete', 'publish'],
  category: ['create', 'read', 'update', 'delete'],
  order: ['create', 'read', 'update', 'cancel', 'refund'],
  coupon: ['create', 'read', 'update', 'delete'],
  report: ['create', 'read', 'export'],
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete'],
  session: ['list', 'revoke', 'delete'],
  settings: ['read', 'update'],
})

export const adminRole = ac.newRole({
  poster: ['create', 'read', 'update', 'delete', 'publish'],
  category: ['create', 'read', 'update', 'delete'],
  order: ['create', 'read', 'update', 'cancel', 'refund'],
  coupon: ['create', 'read', 'update', 'delete'],
  report: ['create', 'read', 'export'],
  user: ['create', 'list', 'set-role', 'ban'],
  session: ['list', 'revoke'],
  settings: ['read', 'update'],
})

export const userRole = ac.newRole({
  poster: ['read'],
  category: ['read'],
  order: ['create', 'read'],
  coupon: ['read'],
  settings: ['read'],
})

/**
 * Roles object for the admin plugin.
 * Keys MUST match the userRoleEnum values.
 */
export const roles = {
  super_admin: superAdmin,
  admin: adminRole,
  user: userRole,
} as const
