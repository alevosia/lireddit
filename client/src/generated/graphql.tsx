import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  posts: PaginatedPosts;
  post?: Maybe<Post>;
  me?: Maybe<User>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryPostsArgs = {
  input?: Maybe<FetchAllPostsInput>;
};


export type QueryPostArgs = {
  input: FetchPostInput;
};


export type QueryUserArgs = {
  input: UserInput;
};

export type PaginatedPosts = {
  __typename?: 'PaginatedPosts';
  items: Array<Post>;
  hasMore: Scalars['Boolean'];
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['Int'];
  author: User;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
  title: Scalars['String'];
  text: Scalars['String'];
  points: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['Int'];
  posts: Array<Post>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
  username: Scalars['String'];
  email?: Maybe<Scalars['String']>;
};

export type FetchAllPostsInput = {
  limit: Scalars['Int'];
  cursor?: Maybe<Scalars['String']>;
};

export type FetchPostInput = {
  id: Scalars['Int'];
};

export type UserInput = {
  id?: Maybe<Scalars['Int']>;
  username?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost: Post;
  updatePost?: Maybe<Post>;
  deletePost: Scalars['Boolean'];
  vote: Scalars['Boolean'];
  register: AuthResponse;
  login: AuthResponse;
  deleteUser: Scalars['Boolean'];
  logout: Scalars['Boolean'];
  forgotPassword: Scalars['Boolean'];
  resetPassword: AuthResponse;
};


export type MutationCreatePostArgs = {
  input: CreatePostInput;
};


export type MutationUpdatePostArgs = {
  input: UpdatePostInput;
};


export type MutationDeletePostArgs = {
  id: Scalars['Float'];
};


export type MutationVoteArgs = {
  input: VoteInput;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationDeleteUserArgs = {
  input: DeleteUserInput;
};


export type MutationForgotPasswordArgs = {
  input: ForgotPasswordInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};

export type CreatePostInput = {
  title: Scalars['String'];
  text: Scalars['String'];
};

export type UpdatePostInput = {
  id: Scalars['Int'];
  title: Scalars['String'];
};

export type VoteInput = {
  postId: Scalars['Int'];
  isPositive: Scalars['Boolean'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type RegisterInput = {
  username: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
};

export type LoginInput = {
  username: Scalars['String'];
  password: Scalars['String'];
};

export type DeleteUserInput = {
  id: Scalars['Int'];
};

export type ForgotPasswordInput = {
  email: Scalars['String'];
};

export type ResetPasswordInput = {
  token: Scalars['String'];
  newPassword: Scalars['String'];
};

export type RegularAuthResponseFragment = (
  { __typename?: 'AuthResponse' }
  & { user?: Maybe<(
    { __typename?: 'User' }
    & RegularUserFragment
  )>, errors?: Maybe<Array<(
    { __typename?: 'FieldError' }
    & RegularErrorFragment
  )>> }
);

export type RegularErrorFragment = (
  { __typename?: 'FieldError' }
  & Pick<FieldError, 'field' | 'message'>
);

export type RegularUserFragment = (
  { __typename?: 'User' }
  & Pick<User, 'id' | 'username' | 'email'>
);

export type CreatePostMutationVariables = Exact<{
  input: CreatePostInput;
}>;


export type CreatePostMutation = (
  { __typename?: 'Mutation' }
  & { createPost: (
    { __typename?: 'Post' }
    & Pick<Post, 'id' | 'title' | 'text' | 'createdAt' | 'updatedAt' | 'points'>
    & { author: (
      { __typename?: 'User' }
      & RegularUserFragment
    ) }
  ) }
);

export type ForgotPasswordMutationVariables = Exact<{
  input: ForgotPasswordInput;
}>;


export type ForgotPasswordMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'forgotPassword'>
);

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'AuthResponse' }
    & RegularAuthResponseFragment
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'AuthResponse' }
    & RegularAuthResponseFragment
  ) }
);

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type ResetPasswordMutation = (
  { __typename?: 'Mutation' }
  & { resetPassword: (
    { __typename?: 'AuthResponse' }
    & RegularAuthResponseFragment
  ) }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & RegularUserFragment
  )> }
);

export type FetchAllPostsQueryVariables = Exact<{
  input?: Maybe<FetchAllPostsInput>;
}>;


export type FetchAllPostsQuery = (
  { __typename?: 'Query' }
  & { posts: (
    { __typename?: 'PaginatedPosts' }
    & Pick<PaginatedPosts, 'hasMore'>
    & { items: Array<(
      { __typename?: 'Post' }
      & Pick<Post, 'id' | 'title' | 'text' | 'createdAt' | 'updatedAt' | 'points'>
      & { author: (
        { __typename?: 'User' }
        & Pick<User, 'id' | 'username'>
      ) }
    )> }
  ) }
);

export const RegularUserFragmentDoc = gql`
    fragment RegularUser on User {
  id
  username
  email
}
    `;
export const RegularErrorFragmentDoc = gql`
    fragment RegularError on FieldError {
  field
  message
}
    `;
export const RegularAuthResponseFragmentDoc = gql`
    fragment RegularAuthResponse on AuthResponse {
  user {
    ...RegularUser
  }
  errors {
    ...RegularError
  }
}
    ${RegularUserFragmentDoc}
${RegularErrorFragmentDoc}`;
export const CreatePostDocument = gql`
    mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    text
    createdAt
    updatedAt
    points
    author {
      ...RegularUser
    }
  }
}
    ${RegularUserFragmentDoc}`;

export function useCreatePostMutation() {
  return Urql.useMutation<CreatePostMutation, CreatePostMutationVariables>(CreatePostDocument);
};
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($input: ForgotPasswordInput!) {
  forgotPassword(input: $input)
}
    `;

export function useForgotPasswordMutation() {
  return Urql.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument);
};
export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    ...RegularAuthResponse
  }
}
    ${RegularAuthResponseFragmentDoc}`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const RegisterDocument = gql`
    mutation Register($input: RegisterInput!) {
  register(input: $input) {
    ...RegularAuthResponse
  }
}
    ${RegularAuthResponseFragmentDoc}`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument);
};
export const ResetPasswordDocument = gql`
    mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) {
    ...RegularAuthResponse
  }
}
    ${RegularAuthResponseFragmentDoc}`;

export function useResetPasswordMutation() {
  return Urql.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument);
};
export const MeDocument = gql`
    query Me {
  me {
    ...RegularUser
  }
}
    ${RegularUserFragmentDoc}`;

export function useMeQuery(options: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
};
export const FetchAllPostsDocument = gql`
    query FetchAllPosts($input: FetchAllPostsInput) {
  posts(input: $input) {
    hasMore
    items {
      id
      title
      text
      createdAt
      updatedAt
      points
      author {
        id
        username
      }
    }
  }
}
    `;

export function useFetchAllPostsQuery(options: Omit<Urql.UseQueryArgs<FetchAllPostsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<FetchAllPostsQuery>({ query: FetchAllPostsDocument, ...options });
};