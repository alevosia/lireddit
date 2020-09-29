import { AppProps } from 'next/app'
import { Provider, createClient } from 'urql'
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'

const client = createClient({
    url: 'http://localhost:4000/graphql',
    fetchOptions: { credentials: 'include' },
})

import theme from '../theme'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <Provider value={client}>
            <ThemeProvider theme={theme}>
                <ColorModeProvider>
                    <CSSReset />
                    <Component {...pageProps} />
                </ColorModeProvider>
            </ThemeProvider>
        </Provider>
    )
}

export default MyApp
