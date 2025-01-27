import type { Extension } from '../types'
import { useIpc } from '../ipc/index'

interface SceneBuilderComposable {
    setInteractive: (interactive: boolean) => Promise<void>
    onClick: (inputId: string, callback: () => void) => void
    setValues: (values: Record<string, string>) => Promise<void>
    patchValues: (values: Record<string, string>) => Promise<void>
}

/**
 * The SceneBuilder module provides methods to the Scene Builder.
 *
 * @param extension - The extension instance
 *
 * @example
 * import { initializeExtension } from '@own3d/sdk/extension'
 * import { useSceneBuilder } from '@own3d/sdk/scene-builder'
 *
 * const extension = initializeExtension()
 *
 * const { setInteractive } = useSceneBuilder(extension)
 *
 * setInteractive(true)
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