import { Field, InputType } from 'type-graphql'

@InputType()
export class UserInput {
    @Field({ nullable: true })
    id?: number

    @Field({ nullable: true })
    username?: string
}
