/**
 * Tipos de base de datos para inyeccion de transacciones.
 *
 * DbOrTx permite que los repositories acepten una transaccion opcional,
 * habilitando operaciones atomicas sin acoplar el patron al ORM.
 */
import type { db } from '@/lib/db'

export type DbClient = typeof db
export type DbTransaction = Parameters<
  Parameters<DbClient['transaction']>[0]
>[0]
export type DbOrTx = DbClient | DbTransaction
