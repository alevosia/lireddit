import { Box, Button } from '@chakra-ui/core'
import { Formik, Form, FormikHelpers } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { InputField } from '../../components/InputField'
import { Wrapper } from '../../components/Wrapper'
import {
    ResetPasswordInput,
    useResetPasswordMutation,
} from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { toErrorMap } from '../../utils/toErrorMap'

type ResetPasswordSubmitHandler = (
    values: ResetPasswordInput,
    formikHelpers: FormikHelpers<ResetPasswordInput>
) => void

const ResetPassword: NextPage = () => {
    const router = useRouter()

    const { token } = router.query

    if (!token || Array.isArray(token)) {
        return <h1>Invalid Token</h1>
    }

    const [{}, resetPassword] = useResetPasswordMutation()
    const [tokenError, setTokenError] = useState<string | null>(null)

    const handleSubmit: ResetPasswordSubmitHandler = async (
        values,
        { setErrors }
    ) => {
        console.log(values)
        const response = await resetPassword({ input: values })

        if (response.data?.resetPassword.errors) {
            // map the errors to the input fields
            const errors = toErrorMap(response.data.resetPassword.errors)

            if ('token' in errors) {
                setTokenError(errors.token)
            }

            setErrors(errors)
        } else if (response.data?.resetPassword.user) {
            // redirect to homepage if password reset is successful
            router.push('/')
        }
    }

    return (
        <Wrapper variant="small">
            <Formik<ResetPasswordInput>
                initialValues={{
                    token,
                    newPassword: '',
                }}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box color="#FF0000" textAlign="center" minH="24px">
                            {tokenError}
                        </Box>
                        <Box mt={4}>
                            <InputField
                                name="newPassword"
                                placeholder="new password"
                                label="New Password"
                                type="password"
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            reset password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(ResetPassword)
