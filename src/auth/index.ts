import { Authorized, Extension } from '../types.ts'

export interface AuthComposable {
    onAuthorized: (authCallback: (auth: Authorized) => void) => void
}

export function useAuth(extension: Extension): AuthComposable {
    const onAuthorized = (authCallback: (auth: Authorized) => void): void => {
        extension.postMessage('authorized', {}, (data) => authCallback(data))
    }

    return {onAuthorized}
}