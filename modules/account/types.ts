import type { addresses } from '@/db/schema'

export type Address = typeof addresses.$inferSelect
export type AddressInsert = typeof addresses.$inferInsert

export type ProfileUpdateData = {
  name: string
  phone?: string | null
  image?: string | null
}
