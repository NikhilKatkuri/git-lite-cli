import { request } from 'undici'

const endPoints = {
    main: 'https://api.github.com/',
    getUser() {
        return this.main + 'user'
    },
}

const ghValidate = (value: string): boolean => {
    const ghRegex = /^ghp_[a-zA-Z0-9]{36}$/
    return ghRegex.test(value)
}

export interface userBucket {
    login: string
    email: string | null
    name: string | null
    user_view_type: string | null
}

const verifyGhToken = async (token: string): Promise<userBucket> => {
    let bucket: userBucket = {
        login: '',
        email: null,
        name: null,
        user_view_type: null,
    }

    try {
        const res = await request(endPoints.getUser(), {
            headers: {
                'User-Agent': 'GLC-NodeJS-Undici-Client',
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
            },
        })
        const data = (await res.body.json()) as object & userBucket

        bucket = {
            login: data['login'],
            email: data['email'],
            name: data['name'],
            user_view_type: data['user_view_type'],
        }

        return bucket
    } catch (error) {
        console.error('Error verifying GitHub token:', error)
    }

    return bucket
}

export { ghValidate, verifyGhToken }
