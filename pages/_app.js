import { ChakraProvider } from '@chakra-ui/react'
import { ConnectionProvider } from '../context/ConnectionContext'

function MyApp({ Component, pageProps }) {
    return (
        <ConnectionProvider>
            <ChakraProvider>
                <Component {...pageProps} />
            </ChakraProvider>
        </ConnectionProvider>
    )
}

export default MyApp
