import { Box, Button, Link } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { LoginInput, useLoginMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/toErrorMap'
import NextLink from 'next/link'

const Login: NextPage = () => {
    const router = useRouter()
    const [{}, login] = useLoginMutation()

    return (
        <Wrapper variant="small">
            <Formik<LoginInput>
                initialValues={{
                    username: '',
                    password: '',
                }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login({ input: values })

                    if (response.data?.login.errors) {
                        // map the errors to the input fields
                        const errors = toErrorMap(response.data.login.errors)
                        setErrors(errors)
                    } else if (response.data?.login.user) {
                        // redirect to homepage if login is successful
                        router.push('/')
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="username"
                            placeholder="username"
                            label="Username"
                            type="text"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Box mt={1}>
                            <NextLink href="/forgot-password">
                                <Link color="#0000FF">forgot password?</Link>
                            </NextLink>
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Login)
