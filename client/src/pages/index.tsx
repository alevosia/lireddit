import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { Layout } from '../components/Layout'
import { useFetchAllPostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { Flex, Box, Button, Stack, Heading, Text, Icon } from '@chakra-ui/core'
import React, { useState } from 'react'

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
        if (data && data.posts.items.length > 0) {
            const items = data.posts.items

            console.log({ items })
            const last = items[items.length - 1].createdAt

            setCursor(last)
        }
    }

    // console.log({ data })

    return (
        <Layout>
            <Flex>
                <Heading mb={5}>LiReddit</Heading>
            </Flex>
            {!data && fetching ? (
                <div>Loading...</div>
            ) : data && data.posts.items.length > 0 ? (
                <Box>
                    <Stack spacing={5}>
                        {data.posts.items.map((p) => (
                            <Flex
                                borderRadius="5px"
                                borderWidth="1px"
                                padding="10px"
                                borderColor="#ccccccdd"
                                key={p.id}
                                shadow="sm"
                            >
                                <Flex direction='column' justifyContent='center' alignItems='center' mr={3}>
                                    <Icon name="chevron-up" size="24px" />
                                    {p.points}
                                    <Icon name="chevron-down" size="24px" />
                                </Flex>

                                <Box>
                                    <Heading size="md">{p.title} ({p.points})</Heading>
                                    <Text mb={2}>by {p.author.username}</Text>
                                    <Text>
                                        {p.text.substring(0, 250).concat('...')}
                                    </Text>
                                </Box>

                            </Flex>
                        ))}
                    </Stack>
                    {data && data.posts.hasMore ? (
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
            ) : null}
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: false })(Index)
