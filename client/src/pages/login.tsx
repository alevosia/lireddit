import { Box, Button, Link } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Layout } from '../components/Layout'
import { LoginInput, useLoginMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/toErrorMap'

const Login: NextPage = () => {
    const router = useRouter()
    const [{}, login] = useLoginMutation()

    return (
        <Layout variant="small">
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
                        const { next } = router.query

                        // redirect to next path of router query
                        if (typeof next === 'string') {
                            router.replace(next)
                        } else {
                            router.replace('/')
                        }
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
                            required
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                                required
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
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(Login)
