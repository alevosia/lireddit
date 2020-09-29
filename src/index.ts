import 'reflect-metadata'

import express from 'express'
import { __prod__ } from './constants'
import { ApolloServer } from 'apollo-server-express'
import mikroConfig from './mikro-orm.config'
import { MikroORM } from '@mikro-orm/core'
import { Post } from './entities/Post'
import { buildSchema } from 'type-graphql'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

const main = async () => {
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up() // run migrations

    const posts = await orm.em.find(Post, {})

    console.log(posts)

    const app = express()

    app.get('/', (_, res) => {
        res.send('Hello World!')
    })

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, PostResolver],
            validate: false,
        }),
        context: () => ({ em: orm.em }),
    })

    apolloServer.applyMiddleware({ app })

    app.listen(4000, () => {
        console.log('Server listening to port 4000.')
    })
}

main().catch(console.error)
