export interface Extension {
    on: (event: string, callback: (data: any) => void) => void;
    once: (event: string, callback: (data: any) => void) => void;
    postMessage: (event: string, data: any, callback?: (data: any) => void) => void;
    emit: (event: string, data: any) => void;
    user?: User;
    axios: any;
    state: any;
}
export type JsonObject = {
    [key: string]: JsonValue;
};
export type JsonArray = Array<JsonValue>;
export type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
export type ConfigSegmentKey = 'creator' | 'developer' | 'global';
export type ConfigSegments = {
    [key in ConfigSegmentKey]: JsonObject;
};
export type Mode = 'widget' | 'standalone' | 'browser-source' | 'config';
export type Theme = 'widget' | 'standalone' | 'browser-source' | 'config';
export interface User {
    channel_id: string;
    client_id: string;
    client_token: string;
    mode: Mode;
    scopes: string[];
    token: string;
    user_id: string;
}
export interface ProSubscription {
    features: string[];
}
export interface Cost {
    amount: number;
    type: 'coins';
}
export interface Product {
    sku: string;
    name: string;
    cost: Cost;
    environment: string;
    recurrence: 'one-time' | 'weekly' | 'monthly' | 'yearly';
}
export interface Subscription {
    id: string;
    status: 'active' | 'canceled';
    created_at: string;
    expires_at: string;
    canceled_at: string;
    cost: Cost;
}
export interface Metadata {
    [key: string]: string;
}
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
export interface Authorized {
    client_id: string;
    client_token: string;
    channel_id: string;
    user_id: string;
    scopes: string[];
    token: string;
}
export interface Context {
    environment: string;
    language: string;
    mode: Mode;
    theme: Theme;
    [key: string]: any;
}
