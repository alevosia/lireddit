import 'reflect-metadata'

import express from 'express'
import cors from 'cors'
import { __prod__ } from './constants'
import { ApolloServer } from 'apollo-server-express'
import mikroConfig from './mikro-orm.config'
import { MikroORM } from '@mikro-orm/core'
import { buildSchema } from 'type-graphql'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'

const main = async () => {
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up() // run migrations

    const app = express()

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()

    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true,
        })
    )

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
            }),
            cookie: {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 30,
                secure: __prod__,
                sameSite: 'lax',
            },
            secret: 'das2adDs2#512sd',
            saveUninitialized: false,
            resave: false,
        })
    )

    app.get('/', (_, res) => {
        res.send('Hello World!')
    })

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, PostResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({
            em: orm.em,
            req,
            res,
        }),
    })

    apolloServer.applyMiddleware({
        app,
        cors: false,
    })

    app.listen(4000, () => {
        console.log('Server listening to port 4000.')
    })
}

main().catch(console.error)
