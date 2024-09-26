import axios, { type AxiosResponse } from 'axios'
import type { ConfigSegmentKey, ConfigSegments, Extension, JsonObject } from '../types.ts'

interface RemoteConfigComposable {
    getSegments: () => Promise<ConfigSegments>,
    setSegment: (segment: ConfigSegmentKey, content: JsonObject) => Promise<void>
}

/**
 * The Remote Config module provides methods to get and set configuration values without providing a backend service.
 * Make sure to check out our Remote Config documentation for more information.
 *
 * @param extension - The extension instance
 *
 * @example
 * import { initializeExtension } from '@own3d/sdk/extension'
 * import { useRemoteConfig } from '@own3d/sdk/remote-config'
 *
 * const extension = initializeExtension()
 *
 * const { getSegments, setSegment } = useRemoteConfig(extension)
 *
 * const segments = await getSegments()
 * console.log(segments)
 *
 * await setSegment('creator', { key: 'value' })
 */
export function useRemoteConfig(extension: Extension): RemoteConfigComposable {
    const _axios = axios.create({
        baseURL: 'https://ext.own3d.pro/',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const getSegments = async function (): Promise<ConfigSegments> {
        const response: AxiosResponse<ConfigSegments> = await _axios.get('v1/remote-configs/segments', {
            headers: {
                Authorization: `Bearer ${extension.user?.token}`,
            },
        })

        return response.data
    }

    const setSegment = async function (segment: ConfigSegmentKey, content: JsonObject): Promise<void> {
        await _axios.patch(`v1/remote-configs/segments`, {
            [segment]: content,
        }, {
            headers: {
                Authorization: `Bearer ${extension.user?.token}`,
            },
        })
    }

    return {
        getSegments,
        setSegment,
    }
}