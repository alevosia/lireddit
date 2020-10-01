import { Box, Button } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { RegisterInput, useRegisterMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/toErrorMap'

const Register: NextPage = () => {
    const router = useRouter()
    const [{}, register] = useRegisterMutation()

    return (
        <Wrapper variant="small">
            <Formik<RegisterInput>
                initialValues={{
                    username: '',
                    password: '',
                    email: '',
                }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register({ input: values })

                    if (response.data?.register.errors) {
                        // map the errors to the input fields
                        const errors = toErrorMap(response.data.register.errors)
                        setErrors(errors)
                    } else if (response.data?.register.user) {
                        // redirect to homepage if registration is successful
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
                                name="email"
                                placeholder="email address"
                                label="Email"
                                type="text"
                            />
                        </Box>
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Register
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Register)
