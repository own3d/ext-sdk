import axios from 'axios'
import { useAuth } from '../auth/index.js'
import { useContext } from '../context/index.js'
import type { Authorized, Context, Extension } from '../types.ts'
import { JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient } from 'json-rpc-2.0'

let _callbackCounter = 0
// deno-lint-ignore prefer-const
let _observers: { [key: string]: ((data: any) => void)[] } = {}
// deno-lint-ignore prefer-const
let _callbacks: { [key: string]: (data: any) => void } = {}
const _state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
const _axios = axios.create({
    baseURL: 'https://ext.own3d.pro/',
    headers: {
        'Content-Type': 'application/json',
    },
})
const _jsonRpc = new JSONRPCServerAndClient(
    new JSONRPCServer(),
    new JSONRPCClient((request) => {
        // @ts-ignore
        parent.postMessage(request, '*')
        return Promise.resolve()
    }),
)

/**
 * This variable is used to determine whether the extension should use JSON-RPC for communication.
 * In future versions, this variable will be set to true by default.
 */
const useJsonRpc: boolean = false

function emit(event: string, data: any): void {
    if (event in _observers) {
        for (const observer of _observers[event]) {
            observer(data)
        }
    }
}

function on(event: string, callback: (data: any) => void) {
    // push callback to observers
    if (!_observers[event]) {
        _observers[event] = []
    }
    _observers[event].push(callback)
}

function once(event: string, callback: (data: any) => void) {
    // push callback to observers
    if (!_observers[event]) {
        _observers[event] = []
    }
    _observers[event].push((data) => {
        callback(data)
        _observers[event].splice(_observers[event].indexOf(callback), 1)
    })
}

function postMessage(event: string, data: any, callback?: (data: any) => void) {
    if (useJsonRpc) {
        if (callback) {
            _jsonRpc.request(event, data).then((result) => callback(result))
        } else {
            _jsonRpc.notify(event, data)
        }
    } else {
        const message: {
            event: string;
            data: any;
            callbackId: string | null;
        } = {event, data, callbackId: null}

        if (callback) {
            const callbackId = 'cb_' + (++_callbackCounter)
            _callbacks[callbackId] = callback
            message.callbackId = callbackId
        }

        // @ts-ignore
        parent.postMessage(message, '*')
    }
}

window.addEventListener('message', async function (e: any): Promise<void> {
    // Check if the message originated from the same origin
    // @ts-ignore
    if (e.origin === window.origin) {
        // Ignore the message
        return
    }
    // Handle JSON-RPC messages
    if (typeof e.data === 'object' && 'jsonrpc' in e.data) {
        await _jsonRpc.receiveAndSend(e.data)
        return
    }

    // Handle legacy messages
    const {event, data, callbackId} = e.data
    if (event === 'callback' && _callbacks[callbackId]) {
        _callbacks[callbackId](data)
        delete _callbacks[callbackId]
    } else {
        emit(event, data)
    }
})

window.addEventListener('beforeunload', function (): void {
    _jsonRpc.rejectAllPendingRequests(
        'Extension is being unloaded',
    )
    postMessage('beforeunload', {state: _state})
})

window.addEventListener('load', function (): void {
    postMessage('load', {state: _state, version: 2, jsonrpc: useJsonRpc})
    _jsonRpc
        .request('echo', {text: 'jsonrpc echo test'})
        .then((result) => console.log(result))
})

const extension = {
    on,
    once,
    postMessage,
    emit,
    axios: _axios,
    state: _state,
    user: {},
    context: {},
} as Extension

const {onAuthorized} = useAuth(extension)
const {onContext} = useContext(extension)

/**
 * Internal listener for the authorization event, which is triggered by the extension
 */
onAuthorized((data: Authorized): void => {
    _axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    extension.user = {...extension.user, ...data} as Authorized
})

/**
 * Internal listener for the context event, which is triggered by the extension
 */
// Use a generic callback signature matching useContext's declared type
onContext(<T extends Partial<Context>>(context: T, changed: ReadonlyArray<keyof T>): void => {
    for (const key of changed) {
        extension.context = {...extension.context, [key]: context[key]} as Context
    }
})

/**
 * Returns the current extension instance.
 *
 * This helper provides the canonical {@link Extension} object used throughout
 * the SDK. Call {@link initializeExtension} to get a stable instance that you
 * can pass into other composables such as {@link useAuth} or
 * {@link useContext}.
 *
 * @returns The {@link Extension} instance bound to the current runtime.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * ```
 */

export type Compatibility = 0 | typeof COMPATIBILITY_DASHBOARD_EXTENSION | typeof COMPATIBILITY_SCENE_BUILDER_WIDGET | typeof COMPATIBILITY_CONFIGURATION_PAGE

export const COMPATIBILITY_DASHBOARD_EXTENSION = 2
export const COMPATIBILITY_SCENE_BUILDER_WIDGET = 4
export const COMPATIBILITY_CONFIGURATION_PAGE = 5

export const initializeExtension = (compatibility: Compatibility = 0): Extension => {
    if (compatibility === COMPATIBILITY_DASHBOARD_EXTENSION) {
        let resizeObserver: ResizeObserver | null = null
        resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { height } = entry.contentRect
                window.parent.postMessage({ type: 'update-height', data: height }, '*')
            }
        })
        resizeObserver.observe(document.documentElement)
    }

    return extension
}
