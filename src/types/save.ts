type SaveOptionKey = keyof SaveOptionMap

type SaveOptionMap = {
    message: string
    all: boolean
    exclude: string[]
}

type SaveOptions = SaveOptionMap & { verbose: boolean }

export type { SaveOptions, SaveOptionMap, SaveOptionKey }
