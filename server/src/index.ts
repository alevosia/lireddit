import 'reflect-metadata'

import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import path from 'path'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import { COOKIE_NAME, __prod__ } from './constants'
import { Post } from './entities/Post'
import { User } from './entities/User'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'lireddit2',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: !__prod__,
        entities: [User, Post],
        migrations: [path.join(__dirname, './migrations/*')],
    })

    await conn.runMigrations()

    const app = express()

    const RedisStore = connectRedis(session)
    const redis = new Redis()

    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true,
        })
    )

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
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
            req,
            res,
            redis,
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
