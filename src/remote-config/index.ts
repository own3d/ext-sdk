import axios, {AxiosResponse} from "axios";
import {Extension} from "../types.ts";
import {ConfigSegmentKey, ConfigSegments, JsonObject} from "@own3d/ext-types";

export function useRemoteConfig(extension: Extension) {
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