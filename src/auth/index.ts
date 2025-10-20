import type { Authorized, Extension } from '../types.ts'

/**
 * Represents the authentication helper returned by {@link useAuth}.
 * It exposes callbacks that fire when the extension is authorized.
 *
 * @since 0.0.1
 *
 * @example
 * const { onAuthorized } = useAuth(extension)
 * onAuthorized(user => console.log('User authorized', user))
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
 * The Auth module provides methods to authenticate the extension with the OWN3D platform.
 * It allows you to get the current authenticated user and listen for changes to the authentication state.
 *
 * @param extension - The extension instance
 *
 * @since 0.0.1
 *
 * @example
 * import { initializeExtension } from '@own3d/sdk/extension'
 * import { useAuth } from '@own3d/sdk/auth'
 *
 * const extension = initializeExtension()
 *
 * const { onAuthorized } = useAuth(extension)
 *
 * onAuthorized(async (user) => {
 *     console.log(user)
 * })
 */
export function useAuth(extension: Extension): AuthComposable {
    const onAuthorized = (authCallback: (auth: Authorized) => void): void => {
        extension.postMessage('authorized', {}, (data) => authCallback(data))
    }

    return {onAuthorized}
}