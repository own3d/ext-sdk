import type {Extension} from "../types.ts";

interface PubSubComposable {
    publish: (event: string, data: any) => Promise<void>,
    subscribe: (event: string, callback: (data: any) => void) => void
}

/**
 * The Socket module provides methods to connect to our event bus, which is a real-time messaging system
 * that allows you to receive events from the OWN3D platform. For example, you can listen for events like
 * new subscriptions or donations via our NotifySub Event Types or custom events. You can also use the
 * Socket module to receive events from the extension itself, like Remote Config changes.
 *
 * @param extension - The extension instance
 *
 * @example
 * import { initializeExtension } from '@own3d/sdk/extension'
 * import { useSocket } from '@own3d/sdk/socket'
 *
 * const extension = initializeExtension()
 *
 * const { on } = useSocket(extension)
 *
 * on('notifysub', (data) => {
 *     console.log(data)
 * })
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