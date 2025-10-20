import type { Extension } from '../types.js'
import { useIpc } from '../ipc/index.js'

/**
 * Methods returned by {@link useNotifications} for sending UI notifications.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useNotifications } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { notify } = useNotifications(extension)
 * await notify({ type: 'info', message: 'Hello' })
 * ```
 */
export interface NotificationsComposable {
    notify: (content: Notification) => Promise<NotificationResponse>
    dismiss: (id: string) => Promise<NotificationResponse>
    patch: (id: string, content: Notification) => Promise<NotificationResponse>
    info: (content: string | Notification) => Promise<NotificationResponse>
    success: (content: string | Notification) => Promise<NotificationResponse>
    warning: (content: string | Notification) => Promise<NotificationResponse>
    error: (content: string | Notification) => Promise<NotificationResponse>
}

/**
 * Notification payload accepted by {@link useNotifications.notify}.
 */
export interface Notification {
    id?: string
    type: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message: string
}

/**
 * Response returned by the notification system.
 */
export interface NotificationResponse {
    id: string
    success: boolean
}

/**
 * The Notifications module provides API methods to send notifications to the user.
 *
 * @param extension - The {@link Extension} instance to use for IPC.
 * @returns The {@link NotificationsComposable} helpers.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useNotifications } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const notifications = useNotifications(extension)
 * await notifications.success('Operation complete')
 * ```
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