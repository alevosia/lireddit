import argon from 'argon2'
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql'
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants'
import { User } from '../entities/User'
import { AuthResponse } from '../typedefs/AuthResponse'
import { LoginInput } from '../typedefs/LoginInput'
import { RegisterInput } from '../typedefs/RegisterInput'
import { UserInput } from '../typedefs/UserInput'
import { MyContext } from '../types'
import { sendEmail } from '../utils/sendEmail'
import { validateRegister } from '../utils/validateRegister'
import { v4 as generateId } from 'uuid'
import { ResetPasswordInput } from '../typedefs/ResetPasswordInput'
import { ForgotPasswordInput } from '../typedefs/ForgotPAsswordInput'

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
        @Ctx() { em, redis }: MyContext,
        @Arg('input') { email }: ForgotPasswordInput
    ): Promise<Boolean> {
        const user = await em.findOne(User, { email })

        if (!user) {
            return false
        }

        const token = generateId()

        await redis.set(
            FORGOT_PASSWORD_PREFIX + token,
            user.id,
            'ex',
            1000 * 60 * 60 * 24 * 3
        ) // 3 days

        try {
            await sendEmail({
                from: '"Lireddit" <no-reply@lireddit.com>',
                to: email,
                subject: 'Forgot Password',
                html: `
                    <a href="http://localhost:3000/reset-password/${token}">reset password</a>
                `,
            })

            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    @Mutation(() => AuthResponse)
    async resetPassword(
        @Arg('input')
        { token, newPassword }: ResetPasswordInput,
        @Ctx() { em, redis, req }: MyContext
    ): Promise<AuthResponse> {
        if (newPassword.length < 8) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'Password length must be at least 8.',
                    },
                ],
            }
        }

        const key = FORGOT_PASSWORD_PREFIX + token

        const userId = await redis.get(key)

        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'Token expired.',
                    },
                ],
            }
        }

        const user = await em.findOne(User, { id: Number(userId) })

        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'User does not exist.',
                    },
                ],
            }
        }

        // hash and update user's password
        user.password = await argon.hash(newPassword)
        em.persistAndFlush(user)

        // invalidate token
        await redis.del(key)

        // log in user after resetting password
        req.session.userId = user.id

        return { user }
    }
}
