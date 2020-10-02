import { MyContext } from 'src/types'
import { MiddlewareFn } from 'type-graphql'

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    const userId = context.req.session.userId

    if (!userId) {
        throw new Error('Not Authenticated')
    }

    return next()
}
