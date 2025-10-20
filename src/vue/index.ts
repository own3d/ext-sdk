import { App } from "vue";
import { initializeExtension } from "../extension/index.js";

interface Plugin {
  install: (app: App) => void;
}

/**
 * Vue 3 plugin that exposes the SDK `Extension` instance to your application.
 *
 * The plugin calls {@link initializeExtension} and registers the returned
 * extension on the Vue global properties and via provide/inject so components
 * can access it.
 *
 * @example
 * ```ts
 * import { createApp } from 'vue'
 * import { createExtension } from '@own3d/sdk'
 * import App from './App.vue'
 *
 * const extension = createExtension()
 * const app = createApp(App)
 * app.use(extension)
 * app.mount('#app')
 * ```
 */
export function createExtension(): Plugin {
  const extension = initializeExtension();

  const install = (app: App): void => {
    app.config.globalProperties.$extension = extension;
    app.provide("extension", extension);
  };

  return {
    install,
  };
}
