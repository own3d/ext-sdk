import type { Extension } from '../types'
import { useIpc } from '../ipc/index'

export interface ProSubscriptionUpsellOptions {
  firstpromoter?: {
    slug?: string
  }
}

export interface SubscriptionComposable {
  showProSubscriptionUpsell: (options: ProSubscriptionUpsellOptions) => void
}

/**
 * Helpers for subscription upsell flows provided by OWN3D.
 *
 * Use {@link useSubscription} to trigger the Pro subscription upsell UI.
 *
 * @param extension - The {@link Extension} instance to use for IPC.
 * @returns The {@link SubscriptionComposable} helpers.
 *
 * @example
 * ```ts
 * import { initializeExtension, useSubscription } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { showProSubscriptionUpsell } = useSubscription(extension)
 * showProSubscriptionUpsell({ firstpromoter: { slug: 'my-slug' } })
 * ```
 */
export function useSubscription(extension: Extension): SubscriptionComposable {
  const { send } = useIpc(extension)

  function showProSubscriptionUpsell(options: any) : void {
    send('own3d.pro/show-pro-sub-upsell', options)
  }

  return {
    showProSubscriptionUpsell,
  }
}