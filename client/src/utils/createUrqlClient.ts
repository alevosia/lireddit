import { cacheExchange, Resolver } from '@urql/exchange-graphcache'
import Router from 'next/router'
import {
    dedupExchange,
    Exchange,
    fetchExchange,
    stringifyVariables,
} from 'urql'
import { pipe, tap } from 'wonka'
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
} from '../generated/graphql'
import { betterUpdateQuery } from './betterUpdateQuery'

const errorExchange: Exchange = ({ forward }) => (ops$) => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            if (!error) {
                return
            }

            console.error(error)

            const errorMessage = error.message.toLowerCase()

            if (errorMessage.includes('not authenticated')) {
                Router.replace('/login')
            }
        })
    )
}

const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info
        console.log({ entityKey })

        const allFields = cache.inspectFields(entityKey)
        const fieldInfos = allFields.filter(
            (info) => info.fieldName === fieldName
        )
        console.log({ fieldInfos })

        // if not cached, return undefined
        const size = fieldInfos.length
        if (size === 0) {
            return undefined
        }

        console.log({ fieldArgs })

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
        console.log({ fieldKey })

        const isCached = !!cache.resolve(
            cache.resolveFieldByKey(entityKey, fieldKey) as string,
            'items'
        )
        console.log({ isCached })

        // set partial if not cached
        info.partial = !isCached

        // combine cached data with new data
        const items: string[] = []

        let hasMore = true

        fieldInfos.forEach((fi) => {
            const key = cache.resolveFieldByKey(
                entityKey,
                fi.fieldKey
            ) as string

            const data = cache.resolve(key, 'items') as string[]
            const _hasMore = cache.resolve(key, 'hasMore')

            if (!_hasMore) {
                hasMore = _hasMore as boolean
            }

            console.log(data)
            items.push(...data)
        })

        return {
            hasMore,
            items: items,
            __typename: 'PaginatedPosts',
        }
    }
}

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
        credentials: 'include' as const,
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            keys: {
                PaginatedPosts: () => null,
            },
            resolvers: {
                Query: {
                    posts: cursorPagination(),
                },
            },
            updates: {
                Mutation: {
                    // update MeQuery's value in cache every login
                    login: (_result, _, cache, __) => {
                        betterUpdateQuery<LoginMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.login.errors) {
                                    return query
                                } else {
                                    return {
                                        me: result.login.user,
                                    }
                                }
                            }
                        )
                    },
                    // update MeQuery's value in cache every register
                    register: (_result, _, cache, __) => {
                        betterUpdateQuery<RegisterMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.register.errors) {
                                    return query
                                } else {
                                    return {
                                        me: result.register.user,
                                    }
                                }
                            }
                        )
                    },
                    // update MeQuery's value in cache every logout
                    // set value of me to null
                    logout: (_result, _, cache, __) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            () => ({ me: null })
                        )
                    },
                },
            },
        }),
        ssrExchange,
        errorExchange,
        fetchExchange,
    ],
})
