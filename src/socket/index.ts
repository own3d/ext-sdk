import type {Extension} from "../types.ts";

export interface SocketComposable {
    on: (event: string, callback: (data: any) => void) => void
}

/**
 * Subscribe to real-time events delivered to the extension's socket.
 *
 * The socket delivers events from OWN3D's event bus (notify-sub events,
 * custom pubsub pushes, remote-config changes, chat messages, etc.). Use {@link useSocket}
 * to register handlers for specific event names.
 *
 * @param extension - The {@link Extension} instance to attach the listener to.
 *
 * @example
 * ```ts
 * import { initializeExtension, useSocket } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { on } = useSocket(extension)
 * on('notifysub', (data) => console.log('notifysub', data)) // follow, sub, resub, gift, raid, etc.
 * on('messages', (data) => console.log('messages', data)) // multi-chat messages
 * ```
 */
export function useSocket(extension: Extension): SocketComposable {
    const on = (event: string, callback: (data: any) => void): void => {
        extension.on(`socket`, (data) => data.event === event ? callback(data.data) : null)
    }

    return {
        on
    }
}