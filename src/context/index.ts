import { Context, Extension } from '../types.ts'

interface ContextComposable {
    onContext: (contextCallback: <T extends Partial<Context>>(context: T, changed: ReadonlyArray<keyof T>) => void) => void
}

export function useContext(extension: Extension): ContextComposable {
    const onContext = (contextCallback: <T extends Partial<Context>>(context: T, changed: ReadonlyArray<keyof T>) => void): void => {
        extension.on('context', (data) => contextCallback(data.context, data.changed));
    }

    return {
        onContext
    }
}
