import type { Extension } from '../types'
import { useIpc } from '../ipc/index'

interface NotificationsComposable {
    notify: (content: Notification) => void
    info: (content: string | Notification) => void
    success: (content: string | Notification) => void
    warning: (content: string | Notification) => void
    error: (content: string | Notification) => void
}

interface Notification {
    notificationId?: string
    type: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message: string
}

/**
 * The Notifications module provides api methods to send notifications to the user.
 */
export function useNotifications(extension: Extension): NotificationsComposable {
    const {send, invoke} = useIpc(extension)

    const notify = function (content: Notification): void {
        send('scene-builder.own3d.pro/notification', {content})
    }

    const info = function (content: string | Notification): void {
        if (typeof content === 'string') {
            notify({type: 'info', message: content})
        } else {
            notify({...content, type: 'info'})
        }
    }

    const success = function (content: string | Notification): void {
        if (typeof content === 'string') {
            notify({type: 'success', message: content})
        } else {
            notify({...content, type: 'success'})
        }
    }

    const warning = function (content: string | Notification): void {
        if (typeof content === 'string') {
            notify({type: 'warning', message: content})
        } else {
            notify({...content, type: 'warning'})
        }
    }

    const error = function (content: string | Notification): void {
        if (typeof content === 'string') {
            notify({type: 'error', message: content})
        } else {
            notify({...content, type: 'error'})
        }
    }

    return {
        notify,
        info,
        success,
        warning,
        error,
    }
}