import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { Layout } from '../components/Layout'
import { useFetchAllPostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { Flex, Box, Button, Stack, Heading, Text } from '@chakra-ui/core'
import { useState } from 'react'

const Index: NextPage = () => {
    const [cursor, setCursor] = useState<string | null>(null)

    const [{ data, fetching }] = useFetchAllPostsQuery({
        variables: {
            input: {
                limit: 10,
                cursor: cursor,
            },
        },
    })

    const fetchNextPosts = () => {
        if (data && data.posts.length > 0) {
            const { posts } = data
            const last = posts[posts.length - 1].createdAt

            setCursor(last)
        }
    }

    return (
        <Layout>
            <Flex>
                <Heading mb={5}>LiReddit</Heading>
            </Flex>
            {!data && fetching ? (
                <div>Loading...</div>
            ) : data && data.posts.length > 0 ? (
                <Box>
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
                    {data ? (
                        <Flex mt={5}>
                            <Button
                                m="auto"
                                onClick={fetchNextPosts}
                                isLoading={fetching}
                            >
                                load more
                            </Button>
                        </Flex>
                    ) : null}
                </Box>
            ) : (
                <Text>No more posts</Text>
            )}
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: false })(Index)
