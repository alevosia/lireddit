import { cacheExchange, Resolver } from '@urql/exchange-graphcache'
import Router from 'next/router'
import { dedupExchange, Exchange, fetchExchange } from 'urql'
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

        const allFields = cache.inspectFields(entityKey)
        const fieldInfos = allFields.filter(
            (info) => info.fieldName === fieldName
        )

        // if not cached, return undefined
        const size = fieldInfos.length
        if (size === 0) {
            return undefined
        }

        const results: string[] = []

        fieldInfos.forEach((fi) => {
            const data = cache.resolveFieldByKey(
                entityKey,
                fi.fieldKey
            ) as string[]
            console.log(data)
            results.push(...data)
        })

        return results

        //   const visited = new Set();
        //   let result: NullArray<string> = [];
        //   let prevOffset: number | null = null;

        //   for (let i = 0; i < size; i++) {
        //     const { fieldKey, arguments: args } = fieldInfos[i];
        //     if (args === null || !compareArgs(fieldArgs, args)) {
        //       continue;
        //     }

        //     const links = cache.resolveFieldByKey(entityKey, fieldKey) as string[];
        //     const currentOffset = args[cursorArgument];

        //     if (
        //       links === null ||
        //       links.length === 0 ||
        //       typeof currentOffset !== 'number'
        //     ) {
        //       continue;
        //     }

        //     if (!prevOffset || currentOffset > prevOffset) {
        //       for (let j = 0; j < links.length; j++) {
        //         const link = links[j];
        //         if (visited.has(link)) continue;
        //         result.push(link);
        //         visited.add(link);
        //       }
        //     } else {
        //       const tempResult: NullArray<string> = [];
        //       for (let j = 0; j < links.length; j++) {
        //         const link = links[j];
        //         if (visited.has(link)) continue;
        //         tempResult.push(link);
        //         visited.add(link);
        //       }
        //       result = [...tempResult, ...result];
        //     }

        //     prevOffset = currentOffset;
        //   }

        //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
        //   if (hasCurrentPage) {
        //     return result;
        //   } else if (!(info as any).store.schema) {
        //     return undefined;
        //   } else {
        //     info.partial = true;
        //     return result;
        //   }
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
