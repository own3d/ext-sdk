/**
 * The extension object provides methods to interact with the extension supervisor.
 */
export interface Extension {
    on: (event: string, callback: (data: any) => void) => void;
    once: (event: string, callback: (data: any) => void) => void;
    postMessage: (event: string, data: any, callback?: (data: any) => void) => void;
    emit: (event: string, data: any) => void;
    user?: Authorized;
    context?: Context;
    axios: any;
    state: any;
}

/**
 * Represents a JSON object.
 */
export type JsonObject = {
    [key: string]: JsonValue;
};

/**
 * Represents a JSON array.
 */
export type JsonArray = Array<JsonValue>;

/**
 * Represents a JSON value.
 */
export type JsonValue = string | number | boolean | null | JsonArray | JsonObject;

/**
 * Represents a configuration segment key.
 */
export type ConfigSegmentKey = 'broadcaster' | 'developer' | 'global';

/**
 * Represents configuration segments.
 */
export type ConfigSegments = {
    [key in ConfigSegmentKey]: JsonObject;
};

/**
 * List of supported modes.
 */
export type Mode = 'widget' | 'standalone' | 'browser-source' | 'config';

/**
 * List of supported themes.
 */
export type Theme = 'dark' | 'light' | 'auto';

/**
 * Represents a user object.
 *
 * @deprecated Use Authorized instead.
 */
export interface User extends Authorized {
    // Deprecated
}

/**
 * Represents a Pro subscription object.
 */
export interface ProSubscription {
    features: string[];
}

/**
 * Represents a Cost object.
 */
export interface Cost {
    amount: number;
    type: 'coins';
}

/**
 * Represents a Product object.
 */
export interface Product {
    sku: string;
    name: string;
    cost: Cost;
    environment: string;
    recurrence: 'one-time' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Represents a Subscription object.
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
 * Represents a Metadata object.
 */
export interface Metadata {
    [key: string]: string;
}

/**
 * When a user decides to use coins, you will receive a Transaction object.
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
 * When a user has authorized your extension, you will receive an Authorized object.
 */
export interface Authorized {
    client_id: string;
    client_token: string;
    channel_id: string;
    user_id: string;
    scopes: string[];
    token: string;
    mode: Mode;
}

/**
 * Each extension has a context object that contains information about the environment, language, mode, and theme.
 */
export interface Context {
    environment: string;
    language: string;
    mode: Mode;
    theme: Theme;

    [key: string]: any;
}

export interface NotifySubCondition {
    platform: string;
    platform_id: string;
}

export interface NotifySubSubscription {
    type: string;
    version: string;
    condition: NotifySubCondition;
}

export interface NotifySubNotification {
    id: string;
    created_at: string;
}

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

export interface NotifySub {
    subscription: NotifySubSubscription;
    notification: NotifySubNotification;
    event: NotifySubEventPayload;
}
