type unStageMap = {
    all: boolean
    file: string
    staged: boolean
    interactive: boolean
}

type unStageOption = unStageMap & {
    verbose: boolean
}

export type { unStageMap, unStageOption }
