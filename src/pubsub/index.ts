import {Extension} from "../types.ts";

export function usePubSub(_extension: Extension) {
    return {
        publish: (_event: string, _data: any) => {},
        subscribe: (_event: string, _callback: (data: any) => void) => {},
    }
}