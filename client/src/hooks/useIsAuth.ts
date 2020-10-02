import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useMeQuery } from '../generated/graphql'

/**
 * checks if user is logged in, otherwise
 * redirects to login page
 * @returns user
 */
export const useIsAuth = () => {
    const [{ data, fetching }] = useMeQuery()
    const router = useRouter()

    const user = data?.me

    // check if logged in, otherwise redirect to login page
    useEffect(() => {
        if (!fetching && !user) {
            router.replace('/login?next=' + router.pathname)
        }
    }, [user, router])

    return { user }
}
