import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { ConnectionProvider } from '../context/ConnectionContext'
import { ContractProvider } from '../context/ContractContext'
import { StepsStyleConfig as Steps } from 'chakra-ui-steps';

const theme = extendTheme({
  components: {
    Steps,
  },
});

function MyApp({ Component, pageProps }) {
    return (
        <ConnectionProvider>
            <ContractProvider>
                <ChakraProvider theme={theme}>
                    <Component {...pageProps} />
                </ChakraProvider>
            </ContractProvider>
        </ConnectionProvider>
    )
}

export default MyApp
