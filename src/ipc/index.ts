import { Extension } from '../types.ts'

interface IpcComposable {
    send: (channel: string, payload: any) => void,
    invoke: (channel: string, payload: any) => Promise<any>
}

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