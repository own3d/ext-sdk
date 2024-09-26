import {Extension} from "../types.ts";

interface PubSubComposable {
    publish: (event: string, data: any) => Promise<void>,
    subscribe: (event: string, callback: (data: any) => void) => void
}

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