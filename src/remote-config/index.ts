import axios, { type AxiosResponse } from 'axios'
import type { ConfigSegmentKey, ConfigSegments, Extension, JsonObject } from '../types.ts'

export interface RemoteConfigComposable {
    getSegments: () => Promise<ConfigSegments>,
    setSegment: (segment: ConfigSegmentKey, content: JsonObject) => Promise<void>
}

/**
 * Remote Config helpers for reading and updating configuration segments.
 *
 * @remarks
 * - `getSegments` fetches all configured segments for the extension.
 * - `setSegment` patches a segment's content.
 *
 * @param extension - The {@link Extension} instance used for authentication headers.
 * @returns The {@link RemoteConfigComposable} helper methods.
 *
 * @example
 * ```ts
 * import { initializeExtension } from '@own3d/sdk'
 * import { useRemoteConfig } from '@own3d/sdk'
 *
 * const extension = initializeExtension()
 * const { getSegments, setSegment } = useRemoteConfig(extension)
 * const segments = await getSegments()
 * console.log(segments)
 * await setSegment('global', { key: 'value' })
 * ```
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