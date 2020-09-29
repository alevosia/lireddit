import { __prod__ } from './constants'
import { MikroORM } from '@mikro-orm/core'
import { Post } from './entities/Post'
import { User } from './entities/User'
import path from 'path'

export default {
    entities: [Post, User],
    user: 'postgres',
    password: 'postgres',
    dbName: 'lireddit',
    type: 'postgresql',
    debug: !__prod__,
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
} as Parameters<typeof MikroORM.init>[0]
