import {User} from "@own3d/ext-types";

export interface Extension {
    on: (event: string, callback: (data: any) => void) => void;
    once: (event: string, callback: (data: any) => void) => void;
    postMessage: (event: string, data: any, callback?: (data: any) => void) => void;
    emit: (event: string, data: any) => void;
    user?: User;
    axios: any;
    state: any;
}
