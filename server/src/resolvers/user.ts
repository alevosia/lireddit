import argon from 'argon2'
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql'
import { COOKIE_NAME } from '../constants'
import { User } from '../entities/User'
import { AuthResponse } from '../typedefs/AuthResponse'
import { LoginInput } from '../typedefs/LoginInput'
import { RegisterInput } from '../typedefs/RegisterInput'
import { UserInput } from '../typedefs/UserInput'
import { MyContext } from '../types'
import { sendEmail } from '../utils/sendEmail'
import { validateRegister } from '../utils/validateRegister'

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
        @Arg('input') { username, password, email }: RegisterInput,
        @Ctx() { em, req }: MyContext
    ): Promise<AuthResponse> {
        const errors = validateRegister({ username, password, email })

        if (errors) {
            return { errors }
        }

        // check if user already exists
        const foundUsername = await em.findOne(User, { username })

        if (foundUsername) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Username is already taken.',
                    },
                ],
            }
        }

        // check if user already exists
        const foundEmail = await em.findOne(User, { email })

        if (foundEmail) {
            return {
                errors: [
                    {
                        field: 'email',
                        message: 'Email address is already taken.',
                    },
                ],
            }
        }

        try {
            const hashedPassword = await argon.hash(password)
            const user = em.create(User, {
                username,
                password: hashedPassword,
                email,
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
                            'Something went wrong. Please try again later!',
                    },
                ],
            }
        }
    }

    // Login ===========================================
    @Mutation(() => AuthResponse)
    async login(
        @Arg('input') { username, password }: LoginInput,
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

    // Delete User =======================================
    @Mutation(() => Boolean)
    async deleteUser(
        @Ctx() { em }: MyContext,
        @Arg('id', () => Int) id: number
    ): Promise<Boolean> {
        const user = await em.findOne(User, { id })

        if (!user) {
            return false
        }

        await em.removeAndFlush(user)

        return true
    }

    // Logout =======================================
    @Mutation(() => Boolean)
    async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
        const result = await new Promise<Boolean>((resolve) =>
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME)

                if (err) {
                    console.error(err)
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        )

        return result
    }

    // Forgot Password =======================================
    @Mutation(() => Boolean)
    async forgotPassword(
        @Ctx() { em }: MyContext,
        @Arg('email') email: string
    ): Promise<Boolean> {
        const user = await em.findOne(User, { email })

        if (!user) {
            return false
        }

        try {
            await sendEmail({
                from: '"Lireddit" <no-reply@lireddit.com>',
                to: email,
                subject: 'Forgot Password',
                html: `
                    <h1>Hi there, ${user.username}!</h1>
                    <br />
                    <p>You've requested a password reset on our website.
                `,
            })

            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }
}
