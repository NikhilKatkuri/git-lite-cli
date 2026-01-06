type createOptionKey = keyof createOptionMap

type createOptionMap = {
    name: string
    description: string
    private: boolean | undefined
    gitignore: string | undefined
    license: string | undefined
    clone: boolean
}

type uses = {
    skip: boolean
    verbose: boolean
}

type createOptions = createOptionMap & uses

export type { createOptions, createOptionMap, createOptionKey }
