import {Authorized} from "@own3d/ext-types";
import {Extension} from "../types.ts";

export function useAuth(extension: Extension) {
    const onAuthorized = (authCallback: (auth: Authorized) => void): void => {
        extension.postMessage('authorized', {}, (data) => authCallback(data))
    }

    return {onAuthorized}
}