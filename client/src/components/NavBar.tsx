import { Box, Button, Flex, Link } from '@chakra-ui/core'
import NextLink from 'next/link'
import React from 'react'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'

export const NavBar: React.FC<{}> = () => {
    const [{ fetching: isLoggingOut }, logout] = useLogoutMutation()

    const [{ data, fetching }] = useMeQuery({
        // don't run query when rendered on server
        pause: isServer(),
    })

    let body

    if (fetching) {
        body = <Box>Logging in..</Box>
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link color="white" mr={5}>
                        login
                    </Link>
                </NextLink>
                <NextLink href="/register">
                    <Link color="white">register</Link>
                </NextLink>
            </>
        )
    } else {
        body = (
            <Flex>
                <NextLink href="/create-post">
                    <Link color="white" mr={5}>
                        create post
                    </Link>
                </NextLink>
                <Box mr={5} color="white">
                    {data.me.username}
                </Box>
                <Button
                    onClick={() => {
                        logout()
                    }}
                    isLoading={isLoggingOut}
                    variant="link"
                    color="white"
                >
                    logout
                </Button>
            </Flex>
        )
    }

    return (
        <Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4}>
            <NextLink href="/">
                <Link color="white">home</Link>
            </NextLink>
            <Box ml={'auto'}>{body}</Box>
        </Flex>
    )
}
