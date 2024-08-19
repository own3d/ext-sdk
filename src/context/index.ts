import {Extension} from "../types.ts";
import {Context} from "@own3d/ext-types";

export function useContext(extension: Extension) {
    const onContext = (contextCallback: <T extends Partial<Context>>(context: T, changed: ReadonlyArray<keyof T>) => void): void => {
        extension.on('context', (data) => contextCallback(data.context, data.changed));
    }

    return {onContext}
}
