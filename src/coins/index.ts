import { Extension, Metadata, Transaction } from '../types'

export function useCoins(extension: Extension) {
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
        onTransactionCancelled
    }
}