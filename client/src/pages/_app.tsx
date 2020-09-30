import { ColorModeProvider, CSSReset, ThemeProvider } from '@chakra-ui/core'
import { AppProps } from 'next/app'
import { NavBar } from '../components/NavBar'
import theme from '../theme'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
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
