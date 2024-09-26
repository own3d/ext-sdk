import type { Extension } from '../types.ts'

interface IpcComposable {
    send: (channel: string, payload: any) => void,
    invoke: (channel: string, payload: any) => Promise<any>
}

/**
 * The Ipc module provides methods to send and receive messages between the extension and the overlay.
 * Avoid using our internal IPC module for communication between different parts of your extension.
 * Instead, use the PubSub module. IPC is only intended for communication between the extension and the OWN3D platform.
 *
 * @param extension - The extension instance
 *
 * @example
 * import { initializeExtension } from '@own3d/sdk/extension'
 * import { useIpc } from '@own3d/sdk/ipc'
 *
 * const extension = initializeExtension()
 *
 * const { send, invoke } = useIpc(extension)
 *
 * send('channel', { key: 'value' })
 *
 * invoke('channel', { key: 'value' }).then((data) => {
 *    console.log(data)
 * })
 */
export function useIpc(extension: Extension): IpcComposable {
    const send = function (channel: string, payload: any) {
        extension.postMessage('ipc', {channel, payload})
    }

    const invoke = function (channel: string, payload: any): Promise<any> {
        return new Promise((resolve) => {
            extension.postMessage('ipc', {channel, payload}, (data) => resolve(data))
        })
    }
    return {
        send,
        invoke,
    }
}