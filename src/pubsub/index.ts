import type {Extension} from "../types.ts";

/**
 * Methods returned by {@link usePubSub} for publishing and subscribing to
 * pubsub events handled by the extension runtime.
 *
 * @remarks
 * - The `publish` method POSTs to OWN3D's pubsub endpoint using the
 *   provided {@link Extension}.axios client and returns a
 *   {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise|Promise}.
 * - The `subscribe` method attaches a socket listener to the provided
 *   {@link Extension} and invokes the callback when a matching `pubsub`
 *   event is received.
 *
 * @example
 * ```ts
 * import { usePubSub, initializeExtension } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { subscribe } = usePubSub(extension)
 * subscribe('notifysub', (data) => console.log('notifysub', data))
 * ```
 */
export interface PubSubComposable {
    publish: (event: string, data: any) => Promise<void>,
    subscribe: (event: string, callback: (data: any) => void) => void
}

/**
 * Create a PubSub helper bound to an {@link Extension} instance.
 *
 * The helper returns a {@link PubSubComposable} with `publish` and
 * `subscribe` functions to interact with the OWN3D pubsub system from
 * inside an extension.
 *
 * @param extension - The extension instance to bind to ({@link Extension}).
 * @returns The {@link PubSubComposable} helpers.
 *
 * @example
 * ```ts
 * import { usePubSub, initializeExtension } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const pubsub = usePubSub(extension)
 * await pubsub.publish('custom-event', { foo: 'bar' })
 * ```
 */
export function usePubSub(extension: Extension): PubSubComposable {
    return {
        publish: async (event: string, data: any) => {
            await extension.axios.post('https://ext.own3d.pro/v1/pubsub', {
                event,
                data,
            })
        },
        subscribe: (event: string, callback: (data: any) => void) => {
            extension.on('socket', ({event: _event, data}) => {
                if (_event === 'pubsub' && data.event === event) {
                    callback(data)
                }
            })
        },
    }
}