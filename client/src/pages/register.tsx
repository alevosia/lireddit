import React from 'react'
import { useRouter } from 'next/router'
import { Formik, Form } from 'formik'
import { Box, Button } from '@chakra-ui/core'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'

interface Props {}
const RegisterPage: React.FC<Props> = ({}) => {
    const router = useRouter()
    const [{}, register] = useRegisterMutation()

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register({ input: values })

                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors))
                    } else if (response.data?.register.user) {
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

export default RegisterPage
