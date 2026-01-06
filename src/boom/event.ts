import pkg from '../../package.json' with { type: 'json' }
// {
//   "event": "sync",
//   "meta": {
//     "os": "win32",
//     "arch": "x64",
//     "node": "v22.19.0",
//     "glc_version": "3.0.0",
//     "duration_ms": 1240,
//     "success": true,
//     "region": "IN-TS"
//   },
//   "timestamp": "2026-01-06T15:45:00Z"
// }

type EventMeta = {
    os: string
    arch: string
    node: string
    glc_version: string
    duration_ms: number
    success: boolean
    region: string
}

export type BoomEvent = {
    event: string
    meta: EventMeta
    timestamp: string
}

function meta(duration_ms: number): EventMeta {
    return {
        os: process.platform,
        arch: process.arch,
        node: process.version,
        glc_version: pkg.version,
        duration_ms,
        success: true,
        region: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    }
}

export default function createEvent(
    event: string,
    duration_ms: number
): BoomEvent {
    const _meta = meta(duration_ms)
    return {
        event,
        meta: _meta,
        timestamp: new Date().toISOString(),
    }
}
