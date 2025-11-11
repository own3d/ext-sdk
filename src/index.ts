/**
 * OWN3D extension SDK public entrypoint.
 *
 * This module re-exports all composables and types provided by the SDK so you
 * can import them from the package root (`@own3d/sdk`). Prefer the package
 * root in documentation and examples instead of deep imports like
 * `@own3d/sdk/auth` or `@own3d/sdk/pubsub`.
 *
 * @example
 * ```ts
 * import { initializeExtension, useAuth, usePubSub } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { onAuthorized } = useAuth(extension)
 * const { publish } = usePubSub(extension)
 * ```
 */
export * from "./auth/index.js";
export * from "./coins/index.js";
export * from "./context/index.js";
export * from "./extension/index.js";
export * from "./ipc/index.js";
export * from "./notifications/index.js";
export * from "./pubsub/index.js";
export * from "./remote-config/index.js";
export * from "./scene-builder/index.js";
export * from "./socket/index.js";
export * from "./subscription/index.js";
export * from "./support/index.js";
export * from "./dashboard/index.js";
export * from "./vue/index.js";
export * from "./types.js";
