type createOptionKey = keyof createOptionMap

type createOptionMap = {
    name: string
    description: string
    private: boolean
    gitignore: string
    license: string
}

type createOptions = createOptionMap & { verbose: boolean }

export type { createOptions, createOptionMap, createOptionKey }
