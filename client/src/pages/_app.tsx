import { ColorModeProvider, CSSReset, ThemeProvider } from '@chakra-ui/core'
import { NextPage } from 'next'
import { AppProps } from 'next/app'
import theme from '../theme'

const MyApp: NextPage<AppProps> = ({ Component, pageProps }) => {
    return (
        <ThemeProvider theme={theme}>
            <ColorModeProvider>
                <CSSReset />
                <Component {...pageProps} />
            </ColorModeProvider>
        </ThemeProvider>
    )
}

export default MyApp
