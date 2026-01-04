type branchtype = 'list' | 'create' | 'switch' | 'delete' | 'rename'

type branchMap = {
    create: string
    switch: string
    delete: string
}

type branch = {
    name: branchtype & Omit<branchtype, 'list'>
    value: string
}
type branchOption = branchMap & { verbose: boolean; list: boolean }

export type { branchtype, branchOption, branchMap, branch }
