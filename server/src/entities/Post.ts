import { Field, Int, ObjectType } from 'type-graphql'
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
} from 'typeorm'
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
