import { Field, InputType } from 'type-graphql'

@InputType()
export class ResetPasswordInput {
    @Field()
    token: string

    @Field()
    newPassword: string
}
