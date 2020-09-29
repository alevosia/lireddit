import gql from 'graphql-tag'
import * as Urql from 'urql'
export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K]
}
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string
    String: string
    Boolean: boolean
    Int: number
    Float: number
}

export type Query = {
    __typename?: 'Query'
    posts: Array<Post>
    post?: Maybe<Post>
    me?: Maybe<User>
    user?: Maybe<User>
    users: Array<User>
}

export type QueryPostArgs = {
    id: Scalars['Float']
}

export type QueryUserArgs = {
    input: UserInput
}

export type Post = {
    __typename?: 'Post'
    id: Scalars['Float']
    createdAt: Scalars['String']
    updatedAt: Scalars['String']
    title: Scalars['String']
}

export type User = {
    __typename?: 'User'
    id: Scalars['Float']
    createdAt: Scalars['String']
    updatedAt: Scalars['String']
    username: Scalars['String']
}

export type UserInput = {
    id?: Maybe<Scalars['Float']>
    username?: Maybe<Scalars['String']>
}

export type Mutation = {
    __typename?: 'Mutation'
    createPost: Post
    updatePost?: Maybe<Post>
    deletePost: Scalars['Boolean']
    register: AuthResponse
    login: AuthResponse
}

export type MutationCreatePostArgs = {
    title: Scalars['String']
}

export type MutationUpdatePostArgs = {
    title: Scalars['String']
    id: Scalars['Float']
}

export type MutationDeletePostArgs = {
    id: Scalars['Float']
}

export type MutationRegisterArgs = {
    input: AuthInput
}

export type MutationLoginArgs = {
    input: AuthInput
}

export type AuthResponse = {
    __typename?: 'AuthResponse'
    errors?: Maybe<Array<FieldError>>
    user?: Maybe<User>
}

export type FieldError = {
    __typename?: 'FieldError'
    field: Scalars['String']
    message: Scalars['String']
}

export type AuthInput = {
    username: Scalars['String']
    password: Scalars['String']
}

export type RegisterMutationVariables = Exact<{
    input: AuthInput
}>

export type RegisterMutation = { __typename?: 'Mutation' } & {
    register: { __typename?: 'AuthResponse' } & {
        user?: Maybe<{ __typename?: 'User' } & Pick<User, 'id' | 'username'>>
        errors?: Maybe<
            Array<
                { __typename?: 'FieldError' } & Pick<
                    FieldError,
                    'field' | 'message'
                >
            >
        >
    }
}

export const RegisterDocument = gql`
    mutation Register($input: AuthInput!) {
        register(input: $input) {
            user {
                id
                username
            }
            errors {
                field
                message
            }
        }
    }
`

export function useRegisterMutation() {
    return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(
        RegisterDocument
    )
}
