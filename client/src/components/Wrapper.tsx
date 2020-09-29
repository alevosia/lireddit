import React from 'react'
import { Box } from '@chakra-ui/core'

interface Props {
    variant?: 'small' | 'regular'
}

export const Wrapper: React.FC<Props> = ({ children, variant = 'regular' }) => {
    return (
        <Box
            maxW={variant === 'regular' ? '800px' : '400px'}
            w="100%"
            mt={8}
            mx="auto"
        >
            {children}
        </Box>
    )
}
