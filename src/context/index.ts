import type { Context, Extension } from '../types.ts'

export interface ContextComposable {
    onContext: (
        contextCallback: <T extends Partial<Context>>(context: T, changed: ReadonlyArray<keyof T>) => void,
        options?: { immediate: boolean } | undefined,
    ) => void
}

/**
 * Helpers for subscribing to extension context updates.
 *
 * The context contains environment, language, mode, theme and other runtime
 * details about the extension host. Use {@link useContext} to receive updates
 * when the supervisor sends a new context.
 *
 * @param extension - The {@link Extension} instance to observe.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useContext } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { onContext } = useContext(extension)
 * onContext((ctx, changed) => console.log('context changed', changed, ctx))
 * ```
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
