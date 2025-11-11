import type { Extension } from '../types.js'
import { useIpc } from '../ipc/index.js'

type locale = 'en' | 'de' | 'fr' | 'es' | 'pt'

export interface DashboardTab {
    key: string
    labels: { [key in locale]?: string }
}

export interface DashboardExtensionComposable {
    defineDashboardTabs: (tabs: DashboardTab[]) => void
    setDashboardTab: (key: string) => void
    onDashboardTabChanged: (callback: (key: string) => void) => void
}

/**
 * Helpers for dashboard extensions provided by OWN3D.
 *
 * Use {@link useDashboardExtension} to define and set tabs in the dashboard extension page.
 *
 * @param extension - The {@link Extension} instance to use for IPC.
 * @returns The {@link DashboardExtensionComposable} helpers.
 *
 * @example
 * ```ts
 * import { initializeExtension, useDashboardExtension } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { defineDashboardTabs, setDashboardTab } = useDashboardExtension(extension)
 *
 * defineDashboardTabs([
 *   { key: 'tab1', labels: { en: 'Tab 1', de: 'Reiter 1' } },
 *   { key: 'tab2', labels: { en: 'Tab 2', de: 'Reiter 2' } },
 * ])
 *
 * setDashboardTab('tab1')
 * 
 * onDashboardTabChanged((key) => {
 *   console.log('Active tab changed to:', key)
 * })
 * ```
 */
export function useDashboardExtension(extension: Extension): DashboardExtensionComposable {
    const { send, on } = useIpc(extension)

    function defineDashboardTabs(tabs: DashboardTab[]): void {
        send('own3d.pro/define-dashboard-tabs', tabs)
    }

    function setDashboardTab(key: string): void {
        send('own3d.pro/set-dashboard-tab', key)
    }

    function onDashboardTabChanged(callback: (key: string) => void): void {
        on('own3d.pro/set-dashboard-tab', (key: string) => {
            callback(key)
        })
    }

    return {
        defineDashboardTabs,
        setDashboardTab,
        onDashboardTabChanged,
    }
}
