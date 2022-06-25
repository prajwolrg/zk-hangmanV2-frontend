import { ChakraProvider } from '@chakra-ui/react'
import { ConnectionProvider } from '../context/ConnectionContext'
import { ContractProvider } from '../context/ContractContext'

function MyApp({ Component, pageProps }) {
    return (
        <ConnectionProvider>
            <ContractProvider>
                <ChakraProvider>
                    <Component {...pageProps} />
                </ChakraProvider>
            </ContractProvider>
        </ConnectionProvider>
    )
}

export default MyApp
