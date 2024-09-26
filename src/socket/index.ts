import type {Extension} from "../types.ts";

interface SocketComposable {
    on: (event: string, callback: (data: any) => void) => void
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
export function useSocket(extension: Extension): SocketComposable {
    const on = (event: string, callback: (data: any) => void): void => {
        extension.on(`socket`, (data) => data.event === event ? callback(data.data) : null)
    }

    return {
        on
    }
}