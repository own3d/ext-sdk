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
import * as auth from "./auth/index";
import * as coins from "./coins/index";
import * as context from "./context/index";
import * as extension from "./extension/index";
import * as ipc from "./ipc/index";
import * as notifications from "./notifications/index";
import * as pubsub from "./pubsub/index";
import * as remoteConfig from "./remote-config/index";
import * as sceneBuilder from "./scene-builder/index";
import * as socket from "./socket/index";
import * as subscription from "./subscription/index";
import * as support from "./support/index";
import * as vue from "./vue/index";

export {
  auth,
  coins,
  context,
  extension,
  ipc,
  notifications,
  pubsub,
  remoteConfig,
  sceneBuilder,
  socket,
  subscription,
  support,
  vue,
};

export * from "./types";
