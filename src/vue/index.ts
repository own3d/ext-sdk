import { initializeExtension } from '../extension'

interface Plugin {
    install: (app: any, options: any) => void;
}

/**
 * This Vue 3 plugin provides the extension instance to all components.
 *
 * @example
 * import { createApp } from 'vue'
 * import { createExtension } from '@own3d/sdk/vue'
 * import App from './App.vue'
 *
 * const extension = createExtension()
 * const app = createApp(App)
 *
 * app.use(extension)
 * app.mount('#app')
 */
export function createExtension(): Plugin {
    const extension = initializeExtension()

    const install = (app: any, _options: any): void => {
        app.config.globalProperties.$extension = extension
        app.provide('extension', extension)
    }

    return {
        install,
    }
}