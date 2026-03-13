import type {
  IAnalyticsService,
  AnalyticsEventProperties,
  AnalyticsUserProperties,
  AnalyticsEcommerceItem,
} from '@/lib/interfaces'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Convierte items de e-commerce al formato GA4.
 */
function toGA4Items(items: AnalyticsEcommerceItem[]) {
  return items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
    ...(item.category && { item_category: item.category }),
    ...(item.variant && { item_variant: item.variant }),
  }))
}

/**
 * Llama a window.gtag de forma segura.
 * No-op si gtag no esta disponible (SSR, bloqueadores, dev).
 */
function safeGtag(...args: unknown[]): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

/**
 * Implementacion de IAnalyticsService usando Google Analytics 4.
 * Solo funciona en el navegador. Todas las llamadas son no-op en SSR.
 */
export class GA4AnalyticsService implements IAnalyticsService {
  private measurementId: string

  constructor() {
    this.measurementId = process.env.NEXT_PUBLIC_GA4_ID ?? ''
  }

  identify(userId: string, properties?: AnalyticsUserProperties): void {
    safeGtag('config', this.measurementId, {
      user_id: userId,
      ...(properties && { user_properties: properties }),
    })
  }

  track(eventName: string, properties?: AnalyticsEventProperties): void {
    safeGtag('event', eventName, properties ?? {})
  }

  pageView(path: string, properties?: AnalyticsEventProperties): void {
    safeGtag('config', this.measurementId, {
      page_path: path,
      ...properties,
    })
  }

  reset(): void {
    safeGtag('config', this.measurementId, { user_id: undefined })
  }

  group(
    groupType: string,
    groupId: string,
    properties?: AnalyticsEventProperties,
  ): void {
    safeGtag('event', 'join_group', {
      group_type: groupType,
      group_id: groupId,
      ...properties,
    })
  }

  isFeatureEnabled(): boolean {
    return false
  }

  getFeatureFlag<T>(): T | undefined {
    return undefined
  }

  // ────────────────────────────────────────────────────────────
  // Enhanced E-Commerce (GA4)
  // ────────────────────────────────────────────────────────────

  viewItem(item: {
    id: string
    name: string
    price: number
    category?: string
  }): void {
    safeGtag('event', 'view_item', {
      currency: 'EUR',
      value: item.price,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          ...(item.category && { item_category: item.category }),
        },
      ],
    })
  }

  addToCart(item: AnalyticsEcommerceItem): void {
    safeGtag('event', 'add_to_cart', {
      currency: 'EUR',
      value: item.price * item.quantity,
      items: toGA4Items([item]),
    })
  }

  removeFromCart(item: {
    id: string
    name: string
    price: number
    quantity: number
  }): void {
    safeGtag('event', 'remove_from_cart', {
      currency: 'EUR',
      value: item.price * item.quantity,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        },
      ],
    })
  }

  beginCheckout(value: number, items: AnalyticsEcommerceItem[]): void {
    safeGtag('event', 'begin_checkout', {
      currency: 'EUR',
      value,
      items: toGA4Items(items),
    })
  }

  purchase(
    transactionId: string,
    value: number,
    items: AnalyticsEcommerceItem[],
  ): void {
    safeGtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'EUR',
      value,
      items: toGA4Items(items),
    })
  }
}
