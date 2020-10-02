import { Post } from '../entities/Post'
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql'
import { UpdatePostInput, CreatePostInput, FetchPostInput } from '../typedefs'
import { MyContext } from 'src/types'
import { User } from '../entities/User'

@Resolver(() => Post)
export class PostResolver {
    @FieldResolver()
    author(@Root() post: Post) {
        return User.findOne(post.authorId)
    }

    @Query(() => [Post])
    posts(): Promise<Post[]> {
        return Post.find()
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('input') { id }: FetchPostInput): Promise<Post | undefined> {
        return Post.findOne(id)
    }

    // TODO: Add { message: string } as mutation response type
    @Mutation(() => Post)
    async createPost(
        @Arg('input') input: CreatePostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post | { message: string }> {
        const userId = req.session.userId

        if (!userId) {
            return {
                message: 'Not Authorized',
            }
        }

        return Post.create({
            ...input,
            authorId: userId,
        }).save()
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('input') { id, title }: UpdatePostInput
    ): Promise<Post | null> {
        const post = await Post.findOne(id)

        if (!post) {
            return null
        }

        await Post.update({ id }, { title })
        post.title = title
        return post
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg('id') id: number): Promise<boolean> {
        const result = await Post.delete({ id })

        if (!result.affected) {
            return false
        }

        return true
    }
}
