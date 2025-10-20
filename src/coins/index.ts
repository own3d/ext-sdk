import type { Extension, Metadata, Transaction } from '../types.ts'

/**
 * Methods returned by {@link useCoins} for working with the OWN3D coins system.
 *
 * @remarks
 * - `getProducts` returns a list of available coin products.
 * - `useCoins` initiates a purchase and resolves to a {@link Transaction}.
 * - `onTransactionComplete` and `onTransactionCancelled` register listeners
 *   for transaction lifecycle events.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useCoins } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { getProducts } = useCoins(extension)
 * const products = await getProducts()
 * console.log(products)
 * ```
 */
export interface CoinsComposable {
    getProducts: () => Promise<any>,
    showCoinsBalance: () => void,
    useCoins: (sku: string, metadata: Metadata) => Promise<Transaction>,
    onTransactionComplete: (callback: (transaction: Transaction) => void) => void,
    onTransactionCancelled: (callback: (transaction: Transaction) => void) => void
}

/**
 * Create the Coins helper bound to an {@link Extension} instance.
 *
 * @param extension - The {@link Extension} instance to bind to.
 * @returns The {@link CoinsComposable} methods for interacting with coins.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useCoins } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const coins = useCoins(extension)
 * await coins.useCoins('sku_123', { orderId: 'abc' })
 * ```
 */
export function useCoins(extension: Extension): CoinsComposable {
    const getProducts = function () {
        return new Promise((resolve) => {
            extension.postMessage('get-products', {}, (data) => resolve(data))
        })
    }

    const showCoinsBalance = function () {
        extension.postMessage('show-coins-balance', {})
    }

    const useCoins = function (sku: string, metadata: Metadata): Promise<Transaction> {
        return new Promise((resolve) => {
            extension.postMessage('use-coins', {sku, metadata}, (data) => resolve(data))
        })
    }

    const onTransactionComplete = function (callback: (transaction: Transaction) => void) {
        extension.on('transaction-complete', (data) => callback(data))
    }

    const onTransactionCancelled = function (callback: (transaction: Transaction) => void) {
        extension.on('transaction-cancelled', (data) => callback(data))
    }

    return {
        getProducts,
        showCoinsBalance,
        useCoins,
        onTransactionComplete,
        onTransactionCancelled,
    }
}