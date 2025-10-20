import type {Extension} from "../types.ts";

/**
 * Minimal socket composable surface used by {@link useSocket}.
 *
 * on(event, callback) registers a handler for a specific socket event
 * delivered via the extension runtime. The handler receives the raw event
 * payload (after the SDK unwraps the envelope).
 */
export interface SocketComposable {
    /**
     * Register a listener for the named event.
     *
     * @param event - The socket event name to listen for (for example: 'notifysub', 'message').
     * @param callback - Called when the event is received with the event payload.
     */
    on: (event: string, callback: (data: any) => void) => void
}

/**
 * Subscribe to real-time events delivered to the extension's socket.
 *
 * The socket delivers events from OWN3D's event bus (notify-sub events,
 * custom pubsub pushes, remote-config changes, chat messages, etc.). Use {@link useSocket}
 * to register handlers for specific event names.
 *
 * @param extension - The {@link Extension} instance to attach the listener to.
 * @returns A small API with an `on` helper to subscribe to socket events.
 *
 * @example
 * ```ts
 * import { initializeExtension, socket } from '@own3d/sdk'
 * const ext = initializeExtension()
 * const { on } = socket.useSocket(ext)
 * on('notifysub', (data: NotifySub) => console.log('notifysub', data))
 * ```
 */
export function useSocket(extension: Extension): SocketComposable {
    const on = (event: string, callback: (data: any) => void): void => {
        extension.on(`socket`, (data) => data.event === event ? callback(data.data) : null)
    }

    return {
        on
    }
}

/**
 * Fragment pieces that make up a chat message body.
 *
 * Chat messages are often represented as an array of fragments. Each fragment
 * represents a small unit of the message such as plain text, a mention, an
 * emote, or other platform-specific element.
 *
 * Implementations should treat unknown `type` values as an opaque object and
 * render the `text` field where available.
 */
export type ChatFragment =
    | { type: 'text'; text: string }
    | { type: 'mention'; text: string; id?: string }
    | { type: 'emote'; text: string; data?: { platform: string; platform_id: string; emote_set_id?: string } }
    | { type: 'cheermote'; text: string; data?: { platform: string; platform_id: string; bits?: number; tier?: number } }
    | { type: string; [key: string]: any } // fallback for unknown fragment types

/**
 * Minimal user object attached to chat messages.
 *
 * Contains identifying information about the author of the message. Fields
 * are optional because some platforms or events may omit parts of the data.
 */
export interface ChatUser {
    /** Platform-specific user id (for example: Twitch user id). */
    platform_id?: string;
    /** Display username (may contain spaces / casing). */
    username?: string;
    /** URL to the user's avatar, if available. */
    avatar_url?: string;
    /** Optional color string (hex) used by some chat platforms. */
    color?: string | null;
    /** Optional list of badges/icons attached to the user (moderator, sub, etc.). */
    badges?: Array<{ type: string; text?: string; id?: string; count?: number }>
    [key: string]: any;
}

/**
 * Representation of the chat/channel the message was posted to.
 *
 * Not all events include channel metadata; fields are therefore optional.
 */
export interface ChatChannel {
    /** Local channel identifier (SDK-specific). */
    id?: string;
    /** Platform-specific channel id (for example: Twitch channel id). */
    platform_id?: string;
    /** Channel display name. */
    username?: string;
    /** Optional channel avatar image URL. */
    avatar_url?: string;
    [key: string]: any;
}

/**
 * Parent message reference for threaded or reply messages.
 */
export interface ChatParent {
    /** The id of the parent message. */
    id: string;
    /** Optional text from the parent message for convenience (may be truncated). */
    message?: string | null;
}

/**
 * Additional attributes describing message state or presentation hints.
 */
export interface ChatAttributes {
    /** Whether the message was edited after being published. */
    edited?: boolean;
    /** Accent color or visual hint used when rendering the message. */
    accent?: string;
    /** Whether this message should be presented as an action (/me). */
    action?: boolean;
    /** Whether the message should be highlighted (for example: pinned or system messages). */
    highlight?: boolean;
    [key: string]: any;
}

/**
 * Normalized chat message object used by the SDK.
 *
 * The SDK aims to expose a common message shape across multiple platforms so
 * that consumers can write rendering and moderation code once. Fields are kept
 * permissive because the underlying platform payloads vary in shape.
 */
export interface ChatMessage {
    /** Unique message identifier (string). */
    id: string;
    /** Message category. Common values: 'message', 'announcement'. */
    type: 'message' | 'announcement' | string;
    /** Unix timestamp in milliseconds when the message was created. */
    timestamp: number;
    /** Optional source platform name (eg. 'twitch', 'youtube'). */
    platform?: string;
    /** Author information (see {@link ChatUser}). */
    user?: ChatUser;
    /** Channel information (see {@link ChatChannel}). */
    channel?: ChatChannel;
    /** Plain text version of the message (if available). */
    message?: string;
    /** Tokenized fragments composing the message body. */
    fragments?: ChatFragment[];
    /** Reference to a parent message for replies/threads. */
    parent?: ChatParent | null;
    /** Raw platform-specific payload. */
    platform_data?: Record<string, any> | undefined;
    /** Presentation attributes and state metadata. */
    attributes?: ChatAttributes;
    [key: string]: any;
}

/**
 * Public API surface returned by {@link useChat}.
 */
export interface UseChatComposable {
    /**
     * Register a callback for new incoming chat messages.
     *
     * The callback receives a {@link ChatMessage} object. Use {@link parseMessage}
     * to normalize platform-specific payloads before acting on them.
     */
    onMessage: (callback: (msg: ChatMessage) => void) => void;
    /** Register a callback invoked when a single message is deleted. */
    onDeleteMessage: (callback: (payload: any) => void) => void;
    /** Register a callback invoked when a channel chat is cleared. */
    onClearChat: (callback: (payload: any) => void) => void;
    /** Normalize a raw platform payload into {@link ChatMessage}. */
    parseMessage: (raw: any) => ChatMessage;
}

/**
 * Convenience wrapper for chat-related socket events.
 *
 * The SDK socket delivers an envelope to the extension with shape { event, data }.
 * `useChat` listens to that envelope and exposes typed helpers for chat events.
 *
 * @example
 * ```ts
 * const { onMessage, onDeleteMessage, onClearChat } = useChat(extension)
 * onMessage((msg) => console.log('chat message', msg))
 * onDeleteMessage((payload) => console.log('deleted', payload))
 * onClearChat(() => console.log('cleared'))
 * ```
 *
 * @param extension - The extension runtime returned by {@link initializeExtension}.
 * @returns An object with helpers to subscribe to chat events.
 */
export function useChat(extension: Extension): UseChatComposable {
    const onMessage = (callback: (msg: ChatMessage) => void): void => {
        extension.on('socket', (envelope: any) => {
            if (envelope?.event === 'message') {
                callback(envelope.data as ChatMessage)
            }
        })
    }

    const onDeleteMessage = (callback: (payload: any) => void): void => {
        extension.on('socket', (envelope: any) => {
            if (envelope?.event === 'delete-message') {
                callback(envelope.data)
            }
        })
    }

    const onClearChat = (callback: (payload: any) => void): void => {
        extension.on('socket', (envelope: any) => {
            if (envelope?.event === 'clear-chat') {
                callback(envelope.data)
            }
        })
    }

    const parseMessage = (raw: any): ChatMessage => {
        // Treat incoming payload as an unknown/any shape and normalize fields
        const msgAny: any = raw || {}

        // Normalize timestamp (allow string or number; fallback to Date.now())
        const timestampRaw = msgAny.timestamp
        let timestampNum: number
        if (typeof timestampRaw === 'string') {
            const n = Number(timestampRaw)
            timestampNum = Number.isNaN(n) ? Date.now() : n
        } else if (typeof timestampRaw === 'number') {
            timestampNum = timestampRaw
        } else {
            timestampNum = Date.now()
        }

        // Normalize fragments into an array
        const fragments = Array.isArray(msgAny.fragments)
            ? msgAny.fragments
            : msgAny.fragments
                ? [msgAny.fragments]
                : []

        // Build a normalized ChatMessage. Keep other fields permissive.
        const normalized: ChatMessage = {
            id: String(msgAny.id ?? ''),
            type: msgAny.type ?? 'message',
            timestamp: timestampNum,
            platform: msgAny.platform,
            user: msgAny.user,
            channel: msgAny.channel,
            message: msgAny.message,
            fragments,
            parent: msgAny.parent ?? null,
            platform_data: msgAny.platform_data,
            attributes: msgAny.attributes,
            // spread raw last so callers can still access unknown fields if needed
            ...msgAny,
        }

        return normalized
    }

    return {
        onMessage,
        onDeleteMessage,
        onClearChat,
        parseMessage,
    }
}
