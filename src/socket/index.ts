import {Extension} from "../types";

export function useSocket(extension: Extension) {
    const on = (event: string, callback: (data: any) => void): void => {
        extension.on(`socket`, (data) => data.event === event ? callback(data.data) : null)
    }

    return {
        on
    }
}