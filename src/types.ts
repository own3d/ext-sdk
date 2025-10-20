/**
 * The canonical extension runtime object used throughout the SDK.
 *
 * This object is provided by the extension supervisor and exposed via
 * {@link initializeExtension} (from `src/extension`). It contains methods to
 * send and receive messages, access the authenticated user, runtime context
 * and an axios client configured for the OWN3D API.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * extension.on('context', (ctx) => console.log(ctx))
 * extension.postMessage('ping', {})
 * ```
 */
export interface Extension {
    /** Register a listener for a named runtime event. */
    on: (event: string, callback: (data: any) => void) => void;
    /** Register a one-time listener for the named event. */
    once: (event: string, callback: (data: any) => void) => void;
    /** Send a message into the host runtime; optionally provide a callback for replies. */
    postMessage: (event: string, data: any, callback?: (data: any) => void) => void;
    /** Emit a local event to SDK observers. */
    emit: (event: string, data: any) => void;
    /** Authenticated user information (populated after authorization). */
    user?: Authorized;
    /** Runtime context provided by the host supervisor. */
    context?: Context;
    /** Axios instance configured for the OWN3D API. */
    axios: any;
    /** Internal state token used by the extension runtime. */
    state: any;
}

/**
 * Represents a generic JSON object value.
 *
 * Use this type when the shape is dynamic or unknown. It composes with
 * {@link JsonValue} and {@link JsonArray}.
 *
 * @example
 * ```ts
 * const obj: JsonObject = { name: 'Alice', count: 3 }
 * ```
 */
export type JsonObject = {
    [key: string]: JsonValue;
};

/**
 * Represents a JSON array.
 *
 * @example
 * ```ts
 * const arr: JsonArray = ['a', 1, { nested: true }]
 * ```
 */
export type JsonArray = Array<JsonValue>;

/**
 * A JSON value: string, number, boolean, null, array or object.
 */
export type JsonValue = string | number | boolean | null | JsonArray | JsonObject;

/**
 * Valid keys for remote configuration segments.
 *
 * @example
 * ```ts
 * const key: ConfigSegmentKey = 'global'
 * ```
 */
export type ConfigSegmentKey = 'broadcaster' | 'developer' | 'global';

/**
 * All remote configuration segments mapped by {@link ConfigSegmentKey}.
 *
 * Each segment is a JSON object (free-form key/value map).
 */
export type ConfigSegments = {
    [key in ConfigSegmentKey]: JsonObject;
};

/**
 * Running mode for the extension host.
 *
 * - `widget` — running as a small widget
 * - `standalone` — standalone page
 * - `browser-source` — OBS/browser source
 * - `config` — configuration UI
 */
export type Mode = 'widget' | 'standalone' | 'browser-source' | 'config';

/**
 * Theme options used by the runtime.
 */
export type Theme = 'dark' | 'light' | 'auto';

/**
 * Legacy user shape. Use {@link Authorized} instead.
 *
 * @deprecated Use {@link Authorized} instead — this alias will be removed in a
 * future major release.
 */
export interface User extends Authorized {
    // Deprecated
}

/**
 * Represents a Pro subscription object and enabled features.
 *
 * @example
 * ```ts
 * const pro: ProSubscription = { features: ['no-ads', 'priority-support'] }
 * ```
 */
export interface ProSubscription {
    /** List of enabled feature keys for the subscription. */
    features: string[];
}

/**
 * Cost expressed for a product or subscription.
 */
export interface Cost {
    /** Amount expressed in the given `type` currency. */
    amount: number;
    /** Currently only 'coins' is supported. */
    type: 'coins';
}

/**
 * Product metadata for coins and subscription purchases.
 */
export interface Product {
    sku: string;
    name: string;
    cost: Cost;
    environment: string;
    recurrence: 'one-time' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Subscription record for a user.
 */
export interface Subscription {
    id: string;
    status: 'active' | 'canceled';
    created_at: string;
    expires_at: string;
    canceled_at: string;
    cost: Cost;
}

/**
 * Simple key/value metadata bag attached to purchases or transactions.
 */
export interface Metadata {
    [key: string]: string;
}

/**
 * Transaction object received when coins are spent via {@link useCoins}.
 *
 * @example
 * ```ts
 * const tx: Transaction = {
 *   id: 'tx_1', client_id: 'c1', user_id: 'u1', channel_id: 'ch1',
 *   subscription: null, product: { sku: 'sku1', name: 'Gold', cost: { amount: 100, type: 'coins' }, environment: 'prod', recurrence: 'one-time' },
 *   metadata: { orderId: 'abc' }, status: 'completed'
 * }
 * ```
 */
export interface Transaction {
    id: string;
    client_id: string;
    user_id: string;
    channel_id: string;
    subscription: Subscription | null;
    product: Product;
    metadata: Metadata;
    status: 'pending' | 'completed' | 'canceled';
}

/**
 * Authenticated context provided when a user authorizes an extension.
 *
 * This object is surfaced in {@link Extension.user} and delivered via the
 * {@link useAuth} composable's callbacks.
 *
 * @example
 * ```ts
 * const auth: Authorized = { client_id: 'c', client_token: 't', channel_id: 'ch', user_id: 'u', scopes: ['read'], token: 'jwt', mode: 'widget' }
 * ```
 */
export interface Authorized {
    /** The client ID of the extension. */
    client_id: string;
    /** The client token of the extension (used for EBS authentication). */
    client_token: string;
    /** The channel ID where the extension is running. */
    channel_id: string;
    /** The user ID of the authenticated user. */
    user_id: string;
    /** The scopes granted to the extension. */
    scopes: string[];
    /** The token that can be used to make authenticated requests to the OWN3D API. */
    token: string;
    /** The mode in which the extension is running (see {@link Mode}). */
    mode: Mode;
}

/**
 * Runtime context delivered by the supervisor to the extension.
 *
 * The context contains environment, language, mode and theme data. It may
 * also include other runtime keys specific to the host platform.
 *
 * @example
 * ```ts
 * const ctx: Context = { environment: 'prod', language: 'en', mode: 'widget', theme: 'dark' }
 * ```
 */
export interface Context {
    /** The runtime environment name (for example: 'prod', 'staging'). */
    environment: string;
    /** Language code in use (eg. 'en', 'de'). */
    language: string;
    /** Running mode (see {@link Mode}). */
    mode: Mode;
    /** Preferred theme (see {@link Theme}). */
    theme: Theme;

    /** Additional provider-specific keys. */
    [key: string]: any;
}

/**
 * NotifySub condition identifies the platform and target id for notify-sub events.
 */
export interface NotifySubCondition {
    platform: string;
    platform_id: string;
}

/**
 * NotifySub subscription metadata.
 */
export interface NotifySubSubscription {
    type: string;
    version: string;
    condition: NotifySubCondition;
}

/**
 * NotifySub notification metadata.
 */
export interface NotifySubNotification {
    id: string;
    created_at: string;
}

/**
 * Union type for the payload of notify-sub events emitted by OWN3D's event bus.
 *
 * The union covers multiple event formats (follow, subscribe, cheer, raid,
 * custom reward redemption, etc.). Use the concrete properties in your
 * handlers according to the expected event type.
 */
export type NotifySubEventPayload =
    | {} // For event types like "stream.online", "stream.offline", "update"
    | { name: string } // For "follow"
    | { name: string; tier: string; is_gift: boolean } // For "subscribe"
    | {
    name: string;
    message: string;
    emotes: any[];
    tier: string;
    months: number;
    streak: number;
    duration: number;
} // For "re-subscribe"
    | {
    gifter: string;
    tier: string;
    amount: number;
    cumulative_amount: number;
    is_anonymous: boolean;
} // For "gift-subscribe"
    | { name: string; amount: number; message: string } // For "cheer"
    | { name: string; count: number } // For "raid"
    | {
    name: string;
    message: string;
    tier: string;
    currency: string;
    amount: string;
} // For "superchat"
    | {
    name: string;
    sticker: string;
    tier: string;
    currency: string;
    amount: string;
} // For "supersticker"
    | { name: string; url: string } // For "shoutout.create" and "shoutout.receive"
    | { level: number } // For "hype_train.begin"
    | {
    name: string;
    campaign_id: string;
    charity_name: string;
    charity_description: string;
    charity_website: string;
    charity_logo: string;
    currency: string;
    amount: string;
} // For "charity-donation"
    | { id: string } // For "custom reward" add, update, remove
    | {
    id: string;
    name: string;
    message: string;
    status: string;
    user_id: string;
    user_login: string;
    user_name: string;
    user_input: string;
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
    reward_id: string;
    reward_title: string;
    reward_cost: number;
    reward_prompt: string;
}; // For "custom reward redemption" add, update

/**
 * A notify-sub event envelope containing subscription, notification and event payload.
 */
export interface NotifySub {
    subscription: NotifySubSubscription;
    notification: NotifySubNotification;
    event: NotifySubEventPayload;
}

