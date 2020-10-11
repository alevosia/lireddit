import {
    Entity,
    BaseEntity,
    ManyToOne,
    PrimaryColumn,
    Column,
} from 'typeorm'
import { Post } from './Post'
import { User } from './User'

// many to many relationship
// user < --- > posts
// user -> join table <- posts
// user -> updoot <- posts

@Entity()
export class Updoot extends BaseEntity {
    @Column({ type: 'int' })
    value: number

    @PrimaryColumn()
    userId: number

    @ManyToOne(() => User, (user) => user.updoots)
    user: User

    @PrimaryColumn()
    postId: number

    @ManyToOne(() => Post, (post) => post.updoots)
    post: User
}
