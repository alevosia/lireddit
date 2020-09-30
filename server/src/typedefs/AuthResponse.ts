import { Field, ObjectType } from 'type-graphql'
import { User } from '../entities/User'
import { FieldError } from './FieldError'

@ObjectType()
export class AuthResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}
