import { Field, Int, ObjectType } from 'type-graphql'
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToMany,
} from 'typeorm'
import { Post } from './Post'
import { Updoot } from './Updoot'

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number

    @Field(() => [Post])
    @OneToMany(() => Post, (post) => post.author)
    posts: Post[]

    @OneToMany(() => Updoot, (updoot) => updoot.user)
    updoots: Updoot[]

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date

    @Field()
    @Column({ unique: true })
    username: string

    @Field({ nullable: true })
    @Column({ unique: true })
    email: string

    @Column()
    password: string
}
