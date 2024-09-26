import {Extension} from "../types.ts";

interface SocketComposable {
    on: (event: string, callback: (data: any) => void) => void
}

export function useSocket(extension: Extension): SocketComposable {
    const on = (event: string, callback: (data: any) => void): void => {
        extension.on(`socket`, (data) => data.event === event ? callback(data.data) : null)
    }

    return {
        on
    }
}