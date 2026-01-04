interface userBucket {
    login: string
    email: string | null
    name: string | null
    user_view_type: string | null
}

type options = 'showAll' | 'logout' | 'login'
type optionsRecord = Partial<Record<options | 'verbose', boolean>>

interface tokenData {
    token: string
    gh: Array<userBucket>
    created_at: string
}
export type { options, optionsRecord, tokenData, userBucket }
