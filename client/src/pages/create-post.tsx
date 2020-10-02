import { Box, Button } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { InputField } from '../components/InputField'
import { Layout } from '../components/Layout'
import { CreatePostInput, useCreatePostMutation } from '../generated/graphql'
import { useIsAuth } from '../hooks/useIsAuth'
import { createUrqlClient } from '../utils/createUrqlClient'

type Status = 'IDLE' | 'SENDING' | 'ERROR' | 'SENT'

const CreatePost: NextPage = () => {
    const router = useRouter()
    const { user } = useIsAuth()

    const [status, setStatus] = useState<Status>('IDLE')
    const [error, setError] = useState<string>('')

    const [{}, createPost] = useCreatePostMutation()

    return (
        <Layout variant="small">
            {user ? (
                <Formik<CreatePostInput>
                    initialValues={{
                        title: '',
                        text: '',
                    }}
                    onSubmit={async (values, _) => {
                        const { error } = await createPost({ input: values })

                        if (error) {
                            console.error(error)
                            setStatus('ERROR')
                            setError(error.graphQLErrors[0].message)
                        } else {
                            router.push('/')
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <div>{user.username}</div>
                            {status === 'ERROR' ? (
                                <Box textAlign="center" color="#FF0000">
                                    {error}
                                </Box>
                            ) : null}
                            <InputField
                                name="title"
                                placeholder="title"
                                label="Title"
                                type="text"
                                required
                            />
                            <Box mt={4}>
                                <InputField
                                    name="text"
                                    placeholder="text"
                                    label="Body"
                                    textarea
                                    required
                                />
                            </Box>
                            <Button
                                mt={4}
                                type="submit"
                                isLoading={isSubmitting}
                                variantColor="teal"
                            >
                                Create post
                            </Button>
                        </Form>
                    )}
                </Formik>
            ) : null}
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(CreatePost)
