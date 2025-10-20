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
 * The Subscription module provides methods to the Subscription.
 *
 * @param extension - The extension instance
 *
 * @example
 * import { initializeExtension } from '@own3d/sdk/extension'
 * import { useSubscription } from '@own3d/sdk/subscription'
 *
 * const extension = initializeExtension()
 *
 * const { showProSubscriptionUpsell } = useSubscription(extension)
 *
 * showProSubscriptionUpsell({
 *  firstpromoter: {
 *   slug: 'my-slug',
*   }
 * })
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