type undoOptionsMap = {
    hard: boolean
    soft: boolean
    amend: boolean
}

type undoOptions = undoOptionsMap & {
    verbose: boolean
}

export type { undoOptionsMap, undoOptions }
