import axios from "axios";
import {Authorized, User} from "@own3d/ext-types";
import {useAuth} from "../auth";
import {Extension} from "../types.ts";

const initializeExtension = () => {
    let _callbackCounter = 0
    const _observers: { [key: string]: ((data: any) => void)[] } = {}
    const _callbacks: { [key: string]: (data: any) => void } = {}
    const _state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const _axios = axios.create({
        baseURL: 'https://ext.own3d.pro/',
        headers: {
            'Content-Type': 'application/json',
        },
    })

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

        parent.postMessage(message, '*')
    }

    window.addEventListener('message', function (e) {
        // Check if the message originated from the same origin
        if (e.origin === window.origin) {
            // Ignore the message
            console.debug('[own3d-ext]: Ignoring message from same origin')
            return
        }

        const {event, data, callbackId} = e.data
        if (event === 'callback' && _callbacks[callbackId]) {
            _callbacks[callbackId](data)
            delete _callbacks[callbackId]
        } else {
            emit(event, data)
        }
    })

    window.addEventListener('beforeunload', function () {
        postMessage('beforeunload', {state: _state})
    })

    window.addEventListener('load', function () {
        postMessage('load', {state: _state})
    })

    const extension = {
        on,
        once,
        postMessage,
        emit,
        axios: _axios,
        state: _state,
        user: {}
    } as Extension

    const {onAuthorized} = useAuth(extension)

    /**
     * Internal listener for the authorization event, which is triggered by the extension
     */
    onAuthorized((data: Authorized) => {
        console.log('[ext-own3d]: Authorized', data)
        _axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        extension.user = {
            id: data.user_id,
            token: data.token,
            scopes: data.scopes,
        } as User
    })

    return extension;
};

export {initializeExtension};
