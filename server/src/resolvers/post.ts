import { Post } from '../entities/Post'
import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { UpdatePostInput, CreatePostInput, FetchPostInput } from '../typedefs'

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(): Promise<Post[]> {
        return Post.find()
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('input') { id }: FetchPostInput): Promise<Post | undefined> {
        return Post.findOne(id)
    }

    @Mutation(() => Post)
    async createPost(@Arg('input') { title }: CreatePostInput): Promise<Post> {
        return await Post.create({ title }).save()
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
