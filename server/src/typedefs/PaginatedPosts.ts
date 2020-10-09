import { Post } from '../entities/Post'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class PaginatedPosts {
    @Field(() => [Post])
    items: Post[]

    @Field()
    hasMore: boolean
}
