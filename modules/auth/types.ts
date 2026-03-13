export interface AuthSession {
  user: {
    id: string
    name: string
    email: string
    image: string | null | undefined
    role: 'super_admin' | 'admin' | 'user'
    isActive: boolean
    username: string | null | undefined
    displayUsername: string | null | undefined
    twoFactorEnabled: boolean | null | undefined
    banned: boolean | null | undefined
    banReason: string | null | undefined
    banExpires: Date | null | undefined
    failedLoginAttempts: number
    lockedUntil: Date | null | undefined
    deletedAt: Date | null | undefined
  }
  session: {
    id: string
    userId: string
    token: string
    expiresAt: Date
    impersonatedBy: string | null | undefined
  }
}
