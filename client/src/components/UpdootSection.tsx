import { Flex, IconButton } from '@chakra-ui/core'
import React from 'react'
import {
    PostSnippetFragment,
    useDeleteVoteMutation,
    useVoteMutation,
} from '../generated/graphql'

interface Props {
    // post: FetchAllPostsQuery['posts']['items'][0]
    post: PostSnippetFragment
}

export const UpdootSection: React.FC<Props> = ({ post }) => {
    const [{}, vote] = useVoteMutation()
    const [{}, deleteVote] = useDeleteVoteMutation()

    const handleVote = async (isPositive: boolean) => {
        if (
            (isPositive && post.voted === 1) ||
            (!isPositive && post.voted === -1)
        ) {
            deleteVote({
                input: {
                    postId: post.id,
                },
            })
        } else {
            vote({
                input: {
                    isPositive,
                    postId: post.id,
                },
            })
        }
    }

    return (
        <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            pr={2}
        >
            <IconButton
                onClick={() => handleVote(true)}
                icon="chevron-up"
                size="sm"
                fontSize="24px"
                aria-label="upvote post"
                color={post.voted === 1 ? 'tomato' : '#000000'}
            />
            {post.points}
            <IconButton
                onClick={() => handleVote(false)}
                icon="chevron-down"
                size="sm"
                fontSize="24px"
                aria-label="downvote post"
                color={post.voted === -1 ? 'tomato' : '#000000'}
            />
        </Flex>
    )
}
