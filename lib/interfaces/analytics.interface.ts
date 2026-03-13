/**
 * Propiedades de un evento de analytics.
 */
export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Propiedades de un usuario.
 */
export interface AnalyticsUserProperties {
  email?: string
  name?: string
  role?: string
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Item de e-commerce para eventos GA4.
 */
export interface AnalyticsEcommerceItem {
  id: string
  name: string
  price: number
  quantity: number
  category?: string
  variant?: string
}

/**
 * Interface para servicios de analytics.
 * Permite intercambiar el servicio de analytics.
 */
export interface IAnalyticsService {
  /**
   * Identifica un usuario.
   */
  identify(userId: string, properties?: AnalyticsUserProperties): void

  /**
   * Registra un evento.
   */
  track(
    eventName: string,
    properties?: AnalyticsEventProperties,
    userId?: string,
  ): void

  /**
   * Registra una vista de pagina.
   */
  pageView(path: string, properties?: AnalyticsEventProperties): void

  /**
   * Resetea la sesion (logout).
   */
  reset(): void

  /**
   * Agrupa un usuario a una organizacion.
   */
  group(
    groupType: string,
    groupId: string,
    properties?: AnalyticsEventProperties,
  ): void

  /**
   * Verifica si un feature flag esta activo.
   */
  isFeatureEnabled(flagName: string): boolean

  /**
   * Obtiene el valor de un feature flag.
   */
  getFeatureFlag<T = boolean | string | number>(flagName: string): T | undefined

  // ────────────────────────────────────────────────────────────
  // Enhanced E-Commerce (GA4)
  // ────────────────────────────────────────────────────────────

  /**
   * Registra la visualizacion de un producto.
   */
  viewItem(item: {
    id: string
    name: string
    price: number
    category?: string
  }): void

  /**
   * Registra un producto anadido al carrito.
   */
  addToCart(item: AnalyticsEcommerceItem): void

  /**
   * Registra un producto eliminado del carrito.
   */
  removeFromCart(item: {
    id: string
    name: string
    price: number
    quantity: number
  }): void

  /**
   * Registra el inicio del checkout.
   */
  beginCheckout(value: number, items: AnalyticsEcommerceItem[]): void

  /**
   * Registra una compra completada.
   */
  purchase(
    transactionId: string,
    value: number,
    items: AnalyticsEcommerceItem[],
  ): void
}
