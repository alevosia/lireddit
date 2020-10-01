import { Box, Button } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import React, { useState } from 'react'
import { InputField } from '../components/InputField'
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

    if (status === 'ERROR') {
        return (
            <Wrapper variant="small">
                <Box>
                    Failed to request a password reset. Please try again later.
                </Box>
            </Wrapper>
        )
    }

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
        <Wrapper variant="small">
            <Formik<ForgotPasswordInput>
                initialValues={{
                    email: '',
                }}
                onSubmit={async (values) => {
                    const response = await forgotPassword({ input: values })

                    if (response.data?.forgotPassword) {
                        setStatus('SENT')
                    } else if (response.data?.forgotPassword) {
                        setStatus('ERROR')
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="email"
                            placeholder="email address"
                            label="Email Address"
                            type="email"
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
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)
