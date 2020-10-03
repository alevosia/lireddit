import { Post } from '../entities/Post'
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql'
import {
    UpdatePostInput,
    CreatePostInput,
    FetchPostInput,
    FetchAllPostsInput,
} from '../typedefs'
import { MyContext } from '../types'
import { User } from '../entities/User'
import { isAuth } from '../middleware/isAuth'
import { FindManyOptions, LessThan } from 'typeorm'

@Resolver(() => Post)
export class PostResolver {
    @FieldResolver()
    author(@Root() post: Post) {
        return User.findOne(post.authorId)
    }

    @Query(() => [Post])
    posts(
        @Arg('input', { nullable: true }) input?: FetchAllPostsInput
    ): Promise<Post[]> {
        const FETCH_LIMIT = 10

        const options: FindManyOptions<Post> = {
            order: { createdAt: 'DESC' },
            take: FETCH_LIMIT,
        }

        if (input) {
            options.take = Math.min(input.limit, FETCH_LIMIT)

            if (input.cursor) {
                const date = new Date(parseInt(input.cursor))

                options.where = {
                    createdAt: LessThan(date),
                }
            }
        }

        return Post.find(options)
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('input') { id }: FetchPostInput): Promise<Post | undefined> {
        return Post.findOne(id)
    }

    // TODO: Add { message: string } as mutation response type
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: CreatePostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post | { message: string }> {
        const userId = req.session.userId

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
