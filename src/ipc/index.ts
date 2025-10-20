import type { Extension } from '../types.ts'

export interface IpcComposable {
    send: (channel: string, payload: any) => void,
    invoke: (channel: string, payload: any) => Promise<any>
    on: (channel: string, callback: (payload: any) => void) => void
}

/**
 * IPC helpers for communicating with the OWN3D platform overlay.
 *
 * @remarks
 * Use this module for platform-level messages. For intra-extension
 * communication prefer {@link usePubSub}.
 *
 * @param extension - The {@link Extension} instance.
 * @returns The {@link IpcComposable} with `send`, `invoke` and `on` helpers.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useIpc } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { send, invoke } = useIpc(extension)
 * send('channel', {key: 'value'})
 * const resp = await invoke('channel', {key: 'value'})
 * ```
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

    const on = function (channel: string, callback: (payload: any) => void) {
        extension.on('ipc', ({channel: _channel, payload}) => {
            if (_channel === channel) {
                callback(payload)
            }
        })
    }

    return {
        send,
        invoke,
        on,
    }
}