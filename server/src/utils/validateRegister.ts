import isEmail from 'validator/lib/isEmail'
import { RegisterInput } from '../typedefs/RegisterInput'

type Error = {
    field: string
    message: string
}

type Errors = Error[]

export const validateRegister = ({
    username,
    password,
    email,
}: RegisterInput): Errors | null => {
    if (username.length < 6) {
        return [
            {
                field: 'username',
                message: 'Username length must be at least 6.',
            },
        ]
    }

    if (password.length < 8) {
        return [
            {
                field: 'password',
                message: 'Password length must be at least 8.',
            },
        ]
    }

    if (!isEmail(email)) {
        return [
            {
                field: 'email',
                message: 'Invalid email address.',
            },
        ]
    }

    return null
}
