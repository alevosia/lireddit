import React from 'react'
import { NavBar } from './NavBar'
import { Wrapper, WrapperVariant } from './Wrapper'

interface Props {
    variant?: WrapperVariant
}

export const Layout: React.FC<Props> = ({ children, variant }) => {
    return (
        <>
            <NavBar />
            <Wrapper variant={variant}>{children}</Wrapper>
        </>
    )
}
