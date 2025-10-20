import type { Authorized, Extension } from '../types.ts'

/**
 * Authentication helpers returned by {@link useAuth}.
 *
 * This composable exposes callbacks that fire when the extension is authorized
 * by the OWN3D platform.
 *
 * @since 0.0.1
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useAuth } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { onAuthorized } = useAuth(extension)
 * onAuthorized(user => console.log('User authorized', user))
 * ```
 */
export interface AuthComposable {
    /**
     * Registers a callback that runs whenever the extension
     * successfully authenticates with the OWN3D platform.
     *
     * @param authCallback - Function called with the {@link Authorized} object.
     */
    onAuthorized: (authCallback: (auth: Authorized) => void) => void
}

/**
 * Authenticate the extension with the OWN3D platform and provide reactive helpers.
 *
 * The returned {@link AuthComposable} allows you to listen for authorization
 * events emitted by the extension supervisor.
 *
 * @param extension - The {@link Extension} instance to authorize.
 * @returns An {@link AuthComposable} containing auth helpers.
 *
 * @since 0.0.1
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useAuth } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { onAuthorized } = useAuth(extension)
 * onAuthorized(user => console.log('Authorized', user))
 * ```
 */
export function useAuth(extension: Extension): AuthComposable {
    const onAuthorized = (authCallback: (auth: Authorized) => void): void => {
        extension.postMessage('authorized', {}, (data) => authCallback(data))
    }

    return {onAuthorized}
}