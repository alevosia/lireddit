import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { Layout } from '../components/Layout'
import { useFetchAllPostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { Box, Button, Stack, Heading, Text } from '@chakra-ui/core'
import { useState } from 'react'

const Index: NextPage = () => {
    const [cursor, setCursor] = useState<string>('')

    const [{ fetching, data }] = useFetchAllPostsQuery({
        variables: {
            input: {
                limit: 5,
                cursor: cursor,
            },
        },
    })

    const fetchNextPosts = () => {
        if (data && data.posts.length > 0) {
            const { posts } = data
            const last = posts[posts.length - 1].createdAt
            console.log(last)

            setCursor(last)
        }
    }

    return (
        <Layout>
            {fetching ? (
                <div>Loading...</div>
            ) : data ? (
                <Box>
                    <Button mb={5} onClick={fetchNextPosts}>
                        Next
                    </Button>
                    <Stack spacing={5}>
                        {data.posts.map((p) => (
                            <Box
                                borderRadius="5px"
                                borderWidth="1px"
                                padding="10px"
                                borderColor="#ccccccdd"
                                key={p.id}
                                shadow="sm"
                            >
                                <Text></Text>
                                <Heading size="md">{p.title}</Heading>
                                <Text>
                                    <strong>{p.author.username}</strong>
                                </Text>
                                <Text>
                                    {p.text.substring(0, 250).concat('...')}
                                </Text>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            ) : null}
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: false })(Index)
