import {Extension} from "../types";

export function usePubSub(extension: Extension) {
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