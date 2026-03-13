export interface ActionState {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}
