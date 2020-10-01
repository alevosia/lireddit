import argon from 'argon2'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { v4 as generateId } from 'uuid'
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants'
import { User } from '../entities/User'
import {
    AuthResponse,
    ForgotPasswordInput,
    LoginInput,
    RegisterInput,
    ResetPasswordInput,
    UserInput,
    DeleteUserInput,
} from '../typedefs'
import { MyContext } from '../types'
import { sendEmail } from '../utils/sendEmail'
import { validateRegister } from '../utils/validateRegister'

@Resolver()
export class UserResolver {
    // Me ===========================================
    @Query(() => User, { nullable: true })
    async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
        const id = req.session.userId

        // no session id / not logged in
        if (!id) {
            return undefined
        }

        return User.findOne(id)
    }

    // User ===========================================
    @Query(() => User, { nullable: true })
    async user(
        @Arg('input') { id, username }: UserInput
    ): Promise<User | undefined> {
        console.log(id, username)

        if (id && username) {
            console.log('Yup')
            return User.findOne({ id, username }) // TODO: Check if it works
        } else if (id) {
            console.log('Woop')

            return User.findOne({ id })
        } else if (username) {
            console.log('Nep')

            return User.findOne({ username })
        }

        console.log('Yike')
        return undefined
    }

    // Users ===========================================
    @Query(() => [User])
    users(): Promise<User[]> {
        return User.find()
    }

    // Register ===========================================
    @Mutation(() => AuthResponse)
    async register(
        @Arg('input') { username, password, email }: RegisterInput,
        @Ctx() { req }: MyContext
    ): Promise<AuthResponse> {
        const errors = validateRegister({ username, password, email })

        if (errors) {
            return { errors }
        }

        // check if user already exists
        const foundUsername = await User.findOne({ username })

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

        // check by email if user already exists
        const foundEmail = await User.findOne({ email })

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
            // hash user's password
            const hashedPassword = await argon.hash(password)

            // save user to database
            const user = await User.create({
                username,
                password: hashedPassword,
                email,
            }).save()

            // log in user automatically
            req.session.userId = user.id

            return { user }
        } catch (error) {
            console.error(error)

            return {
                errors: [
                    {
                        field: 'username',
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
        @Arg('input') { username, password }: LoginInput,
        @Ctx() { req }: MyContext
    ): Promise<AuthResponse> {
        const user = await User.findOne({ username })

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
    async deleteUser(@Arg('input') { id }: DeleteUserInput): Promise<Boolean> {
        const user = await User.findOne(id)

        if (!user) {
            return false
        }

        await User.delete({ id })

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
        @Ctx() { redis }: MyContext,
        @Arg('input') { email }: ForgotPasswordInput
    ): Promise<Boolean> {
        const user = await User.findOne({ email })

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
                subject: 'Forgot Password - Lireddit',
                html: `
                    <h1>Hi there, ${user.username}!</h1>
                    <p>You have recently requested for password reset from us.</p>
                    <a href="http://localhost:3000/reset-password/${token}">
                    Click here</a> to reset your password.
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
        @Ctx() { redis, req }: MyContext
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

        const userIdNum = Number(userId)

        const user = await User.findOne(userIdNum)

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

        // hash new password
        const hashedPassword = await argon.hash(newPassword)

        // update user's password
        User.update({ id: userIdNum }, { password: hashedPassword })

        // invalidate token
        await redis.del(key)

        // log in user after resetting password
        req.session.userId = user.id

        return { user }
    }
}
