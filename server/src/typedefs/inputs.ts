import { Field, InputType, Int } from 'type-graphql'

@InputType()
export class CreatePostInput {
    @Field()
    title: string

    @Field()
    text: string
}

@InputType()
export class FetchAllPostsInput {
    @Field(() => Int)
    limit: number

    @Field({ nullable: true })
    cursor?: string
}

@InputType()
export class FetchPostInput {
    @Field(() => Int)
    id: number
}

@InputType()
export class UpdatePostInput {
    @Field(() => Int)
    id: number

    @Field()
    title: string
}

@InputType()
export class UserInput {
    @Field(() => Int, { nullable: true })
    id?: number

    @Field({ nullable: true })
    username?: string
}

@InputType()
export class RegisterInput {
    @Field()
    username: string

    @Field()
    email: string

    @Field()
    password: string
}

@InputType()
export class LoginInput {
    @Field()
    username: string

    @Field()
    password: string
}

@InputType()
export class ForgotPasswordInput {
    @Field()
    email: string
}

@InputType()
export class ResetPasswordInput {
    @Field()
    token: string

    @Field()
    newPassword: string
}

@InputType()
export class DeleteUserInput {
    @Field(() => Int)
    id: number
}

@InputType()
export class VoteInput {
    @Field(() => Int)
    postId: number

    @Field(() => Boolean)
    isPositive: boolean
}

@InputType()
export class DeleteVoteInput {
    @Field(() => Int)
    postId: number
}
