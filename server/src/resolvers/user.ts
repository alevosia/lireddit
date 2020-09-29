import { MyContext } from '../types'
import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
} from 'type-graphql'
import { User } from '../entities/User'
import argon from 'argon2'

@InputType()
class UserInput {
    @Field({ nullable: true })
    id?: number

    @Field({ nullable: true })
    username?: string
}

@InputType()
class AuthInput {
    @Field()
    username: string

    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class AuthResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    // Me ===========================================
    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
        const id = req.session.userId

        // no session id / not logged in
        if (!id) {
            return null
        }

        const user = await em.findOne(User, { id })

        // user does not exist in database
        if (!user) {
            return null
        }

        return user
    }

    // User ===========================================
    @Query(() => User, { nullable: true })
    async user(
        @Arg('input') { id, username }: UserInput,
        @Ctx() { em }: MyContext
    ): Promise<User | null> {
        console.log(id, username)

        if (id && username) {
            return em.findOne(User, { id, username })
        } else if (id) {
            return em.findOne(User, { id })
        } else if (username) {
            return em.findOne(User, { username })
        } else {
            return null
        }
    }

    // Users ===========================================
    @Query(() => [User])
    async users(@Ctx() { em }: MyContext): Promise<User[]> {
        return em.find(User, {})
    }

    // Register ===========================================
    @Mutation(() => AuthResponse)
    async register(
        @Arg('input') { username, password }: AuthInput,
        @Ctx() { em, req }: MyContext
    ): Promise<AuthResponse> {
        if (username.length < 6) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Username length must be at least 6.',
                    },
                ],
            }
        }

        if (password.length < 8) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Password length must be at least 8.',
                    },
                ],
            }
        }

        // check if user already exists
        const foundUser = await em.findOne(User, { username })

        if (foundUser) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Username is already taken.',
                    },
                ],
            }
        }

        try {
            const hashedPassword = await argon.hash(password)
            const user = em.create(User, {
                username,
                password: hashedPassword,
            })

            await em.persistAndFlush(user)

            // log in user automatically
            req.session.userId = user.id

            return { user }
        } catch (error) {
            console.error(error)

            return {
                errors: [
                    {
                        field: 'unknown',
                        message:
                            'Something went wrong. Please try again later.',
                    },
                ],
            }
        }
    }

    // Login ===========================================
    @Mutation(() => AuthResponse)
    async login(
        @Arg('input') { username, password }: AuthInput,
        @Ctx() { em, req }: MyContext
    ): Promise<AuthResponse> {
        const user = await em.findOne(User, { username })

        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Username does not exist.',
                    },
                ],
            }
        }

        const matched = await argon.verify(user.password, password)

        if (!matched) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Password does not match.',
                    },
                ],
            }
        }

        // Set user id in session
        // This will set a cookie on the user which contains their user id
        // and keep them logged in
        req.session.userId = user.id

        return { user }
    }
}
