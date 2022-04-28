import Head from "next/head";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { zkHangmanFactoryAbi } from "../abis/zkHangmanFactory";
import { toHex, harmonyTestnetParams } from "../utils";
import { HStack,
         VStack,
         Heading,
         Text,
         Box,
         FormControl,
         FormLabel,
         FormErrorMessage,
         FormHelperText,
         Input,
         Button,
         Spinner,
         AlertDialog,
         AlertDialogOverlay,
         AlertDialogContent,
         AlertDialogBody,
         useDisclosure
} from "@chakra-ui/react"

const providerOptions = {};

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
  });
}

const zkHangmanFactoryAddress = "0x9dA7649434dA3A99e72224d37F3b7c69f6F3C8B0";
const initVerifierAddress = "0xcb3729aE1C27De9b4F7826A749f49E74dC130344";
const guessVerifierAddress = "0x262201b73941709113Fb47E564C9026830476706";

function HomePage() {
  const [error, setError] = useState();
  const [instance, setInstance] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [chainId, setChainId] = useState();
  const [waitForTx, setWaitForTx] = useState(false);
  const [gameAddress, setGameAddress] = useState('');
  const [hostAddress, setHostAddress] = useState('');
  const [playerAddress, setPlayerAddress] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (instance?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accounts changed", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      }

      const handleChainChanged = (hexChainId) => {
        console.log("chain changed")
        setChainId(parseInt(hexChainId, 16));
      };

      instance.on("accountsChanged", handleAccountsChanged);
      instance.on("chainChanged", handleChainChanged);
      instance.on("disconnect", handleDisconnect);

      return () => {
        if (instance.removeListener) {
          instance.removeListener("accountsChanged", handleAccountsChanged);
          instance.removeListener("chainChanged", handleChainChanged);
          instance.removeListener("disconnect", handleDisconnect);
        }
      }
    }
  }, [instance])

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [])

  useEffect(() => {
    console.log(error);
  })

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();
      setInstance(instance);
      setProvider(provider);
      setSigner(signer);
      setNetwork(network);
      setChainId(network.chainId);
      if (accounts) setAccount(accounts[0]);
    } catch (error) {
      setError(error);
    }
  }

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    setAccount();
    setChainId();
    setNetwork("");

  }

  const handleNetwork = (e) => {
    setChainId(Number(e.target.value));
  }

  const switchNetwork = async () => {
    try {
      await provider.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(1666700000) }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await provider.provider.request({
            method: "wallet_addEthereumChain",
            params: [harmonyTestnetParams]
          });
        } catch (error) {
          setError(error);
        }
      }
    }
  };

  const gameAddressChange = (e) => {
    setGameAddress(e.target.value);
  }

  const hostAddressChange = (e) => {
    setHostAddress(e.target.value);
  }

  const playerAddressChange = (e) => {
    setPlayerAddress(e.target.value);
  }

  const router = useRouter();

  const gotoGame = (e) => {
    e.preventDefault();
    let href = "/game/" + gameAddress;
    router.push(href);
  }

  const createGame = async (e) => {
    e.preventDefault();
    const zkHangmanFactoryContract = new ethers.Contract(
      zkHangmanFactoryAddress,
      zkHangmanFactoryAbi,
      signer
    )

    console.log(zkHangmanFactoryContract);
    
    console.log("host address: ", hostAddress);
    console.log("player address: ", playerAddress);
    console.log("init verifier address: ", initVerifierAddress);
    console.log("guess verifier address: ", guessVerifierAddress);
    
        
    let tx = await zkHangmanFactoryContract.createGame(
      hostAddress,
      playerAddress,
      initVerifierAddress,
      guessVerifierAddress
    );

    setWaitForTx(true);
    onOpen();

    let txFinalized = await tx.wait();

    let filter = zkHangmanFactoryContract.filters.GameCreated(hostAddress, playerAddress);
    let filterResults = await zkHangmanFactoryContract.queryFilter(filter, -1000);
    let newGameAddress = filterResults[filterResults.length-1].args.gameAddress;

    setWaitForTx(false);

    let href = "/game/" + newGameAddress;
    router.push(href);
  }
  
  return (
    <div>
    <Head>
      <title> zkHangman </title>
    </Head>
    <VStack h="100vh" mt={10}>
    <Heading>zkHangman</Heading>
    <div>
    {!account ? ( 
      <Button onClick={connectWallet}> connect </Button> 
    ) : (
      <Button onClick={disconnect}> disconnect </Button>
    )
    }
    </div>
    <div>
      {account ? (
        <h2> Account {account} </h2>
      ) : (
        <h2> Account: account not connected </h2>
      )}
    </div>
    <div>
    <h2> chainID : {chainId} </h2>
    </div>
    { (chainId != 1666700000 && account) &&
      <Button onClick={switchNetwork}> Connect to harmony testnet </Button> 
    }
    { (chainId == 1666700000 && account) &&
        (
        <VStack>
          <Box my="30px" width={460}>
          <Heading mb="10px"> Create new game </Heading>
          <form onSubmit={createGame}>
          <FormControl>
            <FormLabel>
              Host address:
            </FormLabel>
              <Input mb="5px" type="text" value={hostAddress} onChange={hostAddressChange} />
            <FormLabel>
              Player address:
            </FormLabel>
              <Input mb="5px" type="text" value={playerAddress} onChange={playerAddressChange} />
          <Input type="submit" value="Submit" />
          </FormControl>
          </form>
          </Box>

          <Box my="30px" width={460}>
          <Heading mb="10px"> Goto existing game </Heading>
          <form onSubmit={gotoGame}>
          <FormControl>
            <FormLabel>
              Game address:
            </FormLabel>
              <Input mb="5px" type="text" value={gameAddress} onChange={gameAddressChange} />
          <Input type="submit" value="Submit" />
          </FormControl>
          </form>
          </Box>
        </VStack>
        )
    }
    {
      waitForTx && (
        <>
          <AlertDialog isOpen={isOpen} onClose={onClose}>
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogBody align="center" py={10}>
                  <Text mb={7}> Please wait for your transaction to be confirmed </Text>
                  <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" /> 
                </AlertDialogBody>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </>
      )
    }
    </VStack>
    </div>
  )
}

export default HomePage
