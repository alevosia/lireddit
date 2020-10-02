import { Box, Button } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import React, { useState } from 'react'
import { InputField } from '../components/InputField'
import { Layout } from '../components/Layout'
import { Wrapper } from '../components/Wrapper'
import {
    ForgotPasswordInput,
    useForgotPasswordMutation,
} from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

type Status = 'IDLE' | 'SENDING' | 'SENT' | 'ERROR'

const ForgotPassword: NextPage = () => {
    const [{}, forgotPassword] = useForgotPasswordMutation()
    const [status, setStatus] = useState<Status>('IDLE')

    if (status === 'SENT') {
        return (
            <Wrapper variant="small">
                <Box>
                    We have sent your password reset link to your email address.
                    You may now close this window.
                </Box>
            </Wrapper>
        )
    }

    return (
        <Layout variant="small">
            <Formik<ForgotPasswordInput>
                initialValues={{
                    email: '',
                }}
                onSubmit={async (values) => {
                    await forgotPassword({ input: values })

                    setStatus('SENT')
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="email"
                            placeholder="email address"
                            label="Email Address"
                            type="email"
                            required
                        />
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Send password reset link
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)
