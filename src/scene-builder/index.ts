import type { Extension } from '../types'
import { useIpc } from '../ipc/index'

export interface SceneBuilderComposable {
    setInteractive: (interactive: boolean) => Promise<void>
    onClick: (inputId: string, callback: () => void) => void
    setValues: (values: Record<string, string>) => Promise<void>
    patchValues: (values: Record<string, string>) => Promise<void>
}

/**
 * Helpers for interacting with the Scene Builder overlay.
 *
 * Use {@link useSceneBuilder} to control interactivity, update input values
 * and listen for click events originating from the Scene Builder UI.
 *
 * @param extension - The {@link Extension} instance.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useSceneBuilder } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { setInteractive } = useSceneBuilder(extension)
 * await setInteractive(true)
 * ```
 */
export function useSceneBuilder(extension: Extension): SceneBuilderComposable {
    const {invoke, on} = useIpc(extension)

    const setInteractive = function (interactive: boolean) : Promise<void> {
        return invoke('scene-builder.own3d.pro/interactive', {interactive})
    }

    const onClick = function (inputId: string, callback: () => void) {
        on(`scene-builder.own3d.pro/click/${inputId}`, callback)
    }

    const setValues = function (values: Record<string, string>): Promise<void> {
        return invoke('scene-builder.own3d.pro/set-values', {values})
    }

    const patchValues = function (values: Record<string, string>): Promise<void> {
        return invoke('scene-builder.own3d.pro/patch-values', {values})
    }

    return {
        setInteractive,
        onClick,
        setValues,
        patchValues,
    }
}