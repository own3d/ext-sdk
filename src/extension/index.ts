import axios from 'axios'
import { useAuth } from '../auth/index.ts'
import { useContext } from '../context/index.ts'
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

function emit(event: string, data: any) {
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

window.addEventListener('message', async function (e: any) {
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

window.addEventListener('beforeunload', function () {
    _jsonRpc.rejectAllPendingRequests(
        'Extension is being unloaded',
    )
    postMessage('beforeunload', {state: _state})
})

window.addEventListener('load', function () {
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
onAuthorized((data: Authorized) => {
    _axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    extension.user = {...extension.user, ...data} as Authorized
})

/**
 * Internal listener for the context event, which is triggered by the extension
 */
onContext((context, changed) => {
    for (const key of changed) {
        extension.context = {...extension.context, [key]: context[key]} as Context
    }
})

/**
 * Returns the current extension instance. In future versions, this method will be used to initialize the
 * extension instance when working without the supervisor.
 *
 * @returns The extension instance
 */
export const initializeExtension = (): Extension => {
    return extension
}
