import {Extension} from "../types.ts";

export function useIpc(extension: Extension) {
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
        invoke
    }
}