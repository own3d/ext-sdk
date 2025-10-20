import type { Context, Extension } from '../types.ts'

export interface ContextComposable {
    onContext: (
        contextCallback: <T extends Partial<Context>>(context: T, changed: ReadonlyArray<keyof T>) => void,
        options?: { immediate: boolean } | undefined,
    ) => void
}

/**
 * The Context module provides methods to get the current context of the extension.
 *
 * @param extension - The extension instance
 *
 * @example
 * import { initializeExtension } from '@own3d/sdk/extension'
 * import { useContext } from '@own3d/sdk/context'
 *
 * const extension = initializeExtension()
 *
 * const { onContext } = useContext(extension)
 *
 * onContext((context, changed) => {
 *     console.log(context, changed)
 * })
 */
export function useContext(extension: Extension): ContextComposable {
    const onContext = (
        contextCallback: <T extends Partial<Context>>(context: T, changed: ReadonlyArray<keyof T>) => void,
        options?: { immediate: boolean } | undefined,
    ): void => {
        if (options?.immediate) {
            contextCallback(extension.context as Context, Object.keys(extension.context as Context) as (keyof Context)[])
        }
        extension.on('context', (data) => contextCallback(data.context, data.changed))
    }

    return {
        onContext,
    }
}
