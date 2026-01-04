import { request } from 'undici'
import type { userBucket } from '../types/auth.js'

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
