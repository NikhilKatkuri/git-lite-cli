type cloneOptionKey = keyof CloneOptionsMap

type CloneOptionsMap = {
    url: string
    dir: string
    depth?: number
    branch?: string
    singleBranch?: boolean
}

type cloneOptions = CloneOptionsMap & { verbose: boolean }

export type { CloneOptionsMap, cloneOptions, cloneOptionKey }
