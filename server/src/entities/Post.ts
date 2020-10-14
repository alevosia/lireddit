import { Field, Int, ObjectType } from 'type-graphql'
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    OneToMany,
} from 'typeorm'
import { Updoot } from './Updoot'
import { User } from './User'

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    authorId: number

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.posts)
    author: User

    @OneToMany(() => Updoot, (updoot) => updoot.post)
    updoots: Updoot[]

    @Field(() => Int)
    voted: number

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date

    @Field()
    @Column()
    title: string

    @Field()
    @Column()
    text: string

    @Field(() => Int)
    @Column({ default: 0 })
    points: number
}
