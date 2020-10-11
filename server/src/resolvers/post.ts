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
    VoteInput,
} from '../typedefs'
import { MyContext } from '../types'
import { User } from '../entities/User'
import { isAuth } from '../middleware/isAuth'
import { FindManyOptions, LessThan } from 'typeorm'
import { PaginatedPosts } from '../typedefs/PaginatedPosts'
import { Updoot } from '../entities/Updoot'

@Resolver(() => Post)
export class PostResolver {
    @FieldResolver()
    async author(
        @Root() post: Post,
        @Ctx() { redis }: MyContext
    ): Promise<User | undefined> {
        const key = `USER:${post.authorId}`
        const userString = await redis.get(key)

        if (userString) {
            return JSON.parse(userString)
        }

        const user = await User.findOne(post.authorId)

        if (user) {
            await redis.set(key, JSON.stringify(user))
        }

        return user
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('input', { nullable: true }) input?: FetchAllPostsInput
    ): Promise<PaginatedPosts> {
        const FETCH_LIMIT = 100

        // the real limit is the lower number between FETCH_LIMIT and input limit
        const realLimit = input
            ? Math.min(FETCH_LIMIT, input.limit)
            : FETCH_LIMIT

        // used to check if there is more data to be fetched
        const realLimitPlusOne = realLimit + 1

        const options: FindManyOptions<Post> = {
            order: { createdAt: 'DESC' },
            take: realLimitPlusOne, // take one more than the real limit
        }

        if (input?.cursor) {
            const date = new Date(parseInt(input.cursor))

            options.where = {
                createdAt: LessThan(date), // descending order
            }
        }

        const posts = await Post.find(options)

        return {
            // return the real limit
            items: posts.slice(0, realLimit),
            // check if the fetched posts has one more than the real limit
            hasMore: posts.length === realLimitPlusOne,
        }
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

    @FieldResolver()
    async points(
        @Root() post: Post,
    ): Promise<number> {
        const updoots = await Updoot.find({ where: { postId: post.id }})

        const points = updoots.reduce(
            (total, updoot) => total += updoot.value
        , 0)

        return points
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('input') { postId, isPositive }: VoteInput,
        @Ctx() { req }: MyContext
    ): Promise<Boolean> {
        const post = await Post.findOne(postId)

        if (!post) {
            return false
        }

        const { userId } = req.session
        const value = isPositive ? 1 : -1

        await Updoot.create({
            userId,
            postId,
            value
        }).save()

        // post.points += 1
        // await post.save()
        
        return true
    }
}
