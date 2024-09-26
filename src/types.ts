/**
 * The extension object provides methods to interact with the extension supervisor.
 */
export interface Extension {
    on: (event: string, callback: (data: any) => void) => void;
    once: (event: string, callback: (data: any) => void) => void;
    postMessage: (event: string, data: any, callback?: (data: any) => void) => void;
    emit: (event: string, data: any) => void;
    user?: User;
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
export type ConfigSegmentKey = 'creator' | 'developer' | 'global';

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
 */
export interface User {
    channel_id: string;
    client_id: string;
    client_token: string;
    mode: Mode;
    scopes: string[];
    token: string;
    user_id: string;
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
