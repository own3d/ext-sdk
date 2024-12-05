import type { Extension } from '../types'
import { useIpc } from '../ipc/index'

interface SceneBuilderComposable {
    setInteractive: (interactive: boolean) => void
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
    const {send} = useIpc(extension)

    const setInteractive = function (interactive: boolean) {
        send('scene-builder.own3d.pro/interactive', {interactive})
    }

    return {
        setInteractive
    }
}