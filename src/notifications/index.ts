import type { Extension } from '../types'
import { useIpc } from '../ipc/index'

interface NotificationsComposable {
    notify: (content: Notification) => Promise<NotificationResponse>
    dismiss: (id: string) => Promise<NotificationResponse>
    patch: (id: string, content: Notification) => Promise<NotificationResponse>
    info: (content: string | Notification) => Promise<NotificationResponse>
    success: (content: string | Notification) => Promise<NotificationResponse>
    warning: (content: string | Notification) => Promise<NotificationResponse>
    error: (content: string | Notification) => Promise<NotificationResponse>
}

interface Notification {
    id?: string
    type: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message: string
}

interface NotificationResponse {
    id: string
    success: boolean
}

/**
 * The Notifications module provides api methods to send notifications to the user.
 */
export function useNotifications(extension: Extension): NotificationsComposable {
    const {invoke} = useIpc(extension)

    const notify = function (content: Notification): Promise<NotificationResponse> {
        return invoke('scene-builder.own3d.pro/notification', {content})
    }

    const dismiss = function (id: string): Promise<NotificationResponse> {
        return invoke('scene-builder.own3d.pro/dismiss-notification', {id})
    }

    const patch = function (id: string, content: Notification): Promise<NotificationResponse> {
        return invoke('scene-builder.own3d.pro/patch-notification', {id, content})
    }

    const info = function (content: string | Notification): Promise<NotificationResponse> {
        if (typeof content === 'string') {
            return notify({type: 'info', message: content})
        } else {
            return notify({...content, type: 'info'})
        }
    }

    const success = function (content: string | Notification): Promise<NotificationResponse> {
        if (typeof content === 'string') {
            return notify({type: 'success', message: content})
        } else {
            return notify({...content, type: 'success'})
        }
    }

    const warning = function (content: string | Notification): Promise<NotificationResponse> {
        if (typeof content === 'string') {
            return notify({type: 'warning', message: content})
        } else {
            return notify({...content, type: 'warning'})
        }
    }

    const error = function (content: string | Notification): Promise<NotificationResponse> {
        if (typeof content === 'string') {
            return notify({type: 'error', message: content})
        } else {
            return notify({...content, type: 'error'})
        }
    }

    return {
        notify,
        dismiss,
        patch,
        info,
        success,
        warning,
        error,
    }
}