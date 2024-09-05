import { Authorized, Extension } from '../types'

export function useAuth(extension: Extension) {
    const onAuthorized = (authCallback: (auth: Authorized) => void): void => {
        extension.postMessage('authorized', {}, (data) => authCallback(data))
    }

    return {onAuthorized}
}