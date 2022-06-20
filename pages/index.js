import Head from "next/head";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { zkHangmanFactoryAbi } from "../abis/zkHangmanFactory";
import { toHex, harmonyTestnetParams, harmonyMainnetParams, hardhatNodeParams } from "../utils";
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
         useDisclosure,
} from "@chakra-ui/react"

const providerOptions = {};

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
  });
}

// local hardhat contract addresses
const localhostZkHangmanFactory = "0x994230735cd9854F192524ac435a17aB808d6790"
const localhostInitVerifier = "0xE082C13ac5a58F5f791376594558F5819a0396A6"
const localhostGuessVerifier = "0xbc8718D1559d18fcfD23A7775D4472e22607A596"

// harmony testnet contract addresses
const testZkHangmanFactory = "0x981Fa2d6C2FC41C301C89693D5908597A2F41256"
const testInitVerifier = "0x3B3341dB17b1FC79Fb4F2149F0413e7Fa9375C76"
const testGuessVerifier = "0x994230735cd9854F192524ac435a17aB808d6790"

// harmony mainnet contract addresses
const mainZkHangmanFactory = "0x295b98D5977b303d965cCcaa5e8BF888fb29e824";
const mainInitVerifier= "0xcb3729aE1C27De9b4F7826A749f49E74dC130344";
const mainGuessVerifier= "0x262201b73941709113Fb47E564C9026830476706";

function HomePage() {
  const [error, setError] = useState();
  const [dialogMessage, setDialogMessage] = useState();
  const [instance, setInstance] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [chainId, setChainId] = useState();
  const [gameAddress, setGameAddress] = useState('');
  const [hostAddress, setHostAddress] = useState('');
  const [playerAddress, setPlayerAddress] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSelectOpen, onOpen: onSelectOpen, onClose: onSelectClose } = useDisclosure();

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
        console.log("chain changed to: ", parseInt(hexChainId, 16))
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

  const switchNetwork = async (network) => {
    console.log(`Trying to switch network to: ${network}`)
    if (network == 'testnet') {
      console.log('testnet')
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
    } else if (network == 'mainnet') { // mainnet 
      console.log('mainnet')
      try {
        await provider.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: toHex(1666600000) }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
             await provider.provider.request({
              method: "wallet_addEthereumChain",
              params: [harmonyMainnetParams]
             });
          } catch (error) {
            setError(error);
          }
        }
      }
    } else if (network=='localhost' || network == 'hardhat') {
      console.log('localhost')
      try {
        await provider.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: toHex(31337) }]
        });
      } catch (switchError) {
        console.log(switchError)
        if (switchError.code === 4902) {
          try {
             await provider.provider.request({
              method: "wallet_addEthereumChain",
              params: [hardhatNodeParams]
             });
          } catch (error) {
            setError(error);
          }
        }
      }

    }


    onSelectClose();
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
    console.log(`Trying to create a game`)
    e.preventDefault();
    if (chainId == 1666700000) {
      console.log(`${chainId}`)
      var zkHangmanFactoryAddress = testZkHangmanFactory;
      var initVerifierAddress = testInitVerifier;
      var guessVerifierAddress = testGuessVerifier;
    } else if (chainId == 1666600000) {
      console.log(`${chainId}`)
      var zkHangmanFactoryAddress = mainZkHangmanFactory;
      var initVerifierAddress = mainInitVerifier;
      var guessVerifierAddress = mainGuessVerifier;
    }
    else if (chainId == 31337) {
      console.log(`${chainId}`)
      var zkHangmanFactoryAddress = localhostZkHangmanFactory;
      var initVerifierAddress = localhostInitVerifier;
      var guessVerifierAddress = localhostGuessVerifier;
    }
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
    
    onOpen();
    setDialogMessage("Awaiting transaction confirmation...");
        
    let tx = await zkHangmanFactoryContract.createGame(
      hostAddress,
      playerAddress,
      initVerifierAddress,
      guessVerifierAddress
    );

    setDialogMessage("Waiting for transaction to finalize...");

    let txFinalized = await tx.wait();

    onClose();

    let filter = zkHangmanFactoryContract.filters.GameCreated(hostAddress, playerAddress);
    let filterResults = await zkHangmanFactoryContract.queryFilter(filter, -1000);
    let newGameAddress = filterResults[filterResults.length-1].args.gameAddress;

    let href = "/game/" + newGameAddress;
    router.push(href);
  }
  
  return (
    <div>
    <Head>
      <title> zkHangman </title>
    </Head>
    <VStack h="100vh" mt={10}>
    <Heading mb={7}>zkHangman</Heading>
    <div>
   
    {
      (chainId == 31337 && account) ? (
        <Button onClick={ () => switchNetwork('mainnet')}> Switch to mainnet </Button> 
      ) : (chainId == 1666600000 && account) ? (
        <Button onClick={ () => switchNetwork('testnet')}> Switch to testnet </Button> 
      ) : (chainId == 1666600000 && account) ? (
        <Button onClick={ () => switchNetwork('mainnet')}> Switch to testnet </Button> 
      ) : <Button onClick={() => {connectWallet(); onSelectOpen();}}> Connect to Harmony </Button> 
    }
    </div>

    <div>
      { (chainId == 1666700000 && account) ? (
        <h2> You're connected to the Harmony testnet </h2>
      ) : (chainId == 1666600000 && account) ? (
        <h2> You're connected to the Harmony mainnet </h2>
      ) : (chainId == 31337 && account) ? (
        <h2> You're connected to the Hardhat testnet </h2>
      ) : <h2> Please connect to Harmony </h2>
      }
    </div>

    <div>
      {account ? (
        <h2> Account {account} </h2>
      ) : (
        <h2> Account: account not connected </h2>
      )}
    </div>

       
    { ( (chainId == 1666700000 || chainId == 1666600000 || chainId == 31337)  && account) &&
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

      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogBody align="center" py={10}>
              <Text mb={7}> {dialogMessage} </Text>
              <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" /> 
            </AlertDialogBody>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

    <AlertDialog isOpen={isSelectOpen} onClose={onSelectClose}>
       <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogBody align="center" py={10}>
              <Button mb={7} width={250} onClick={() => switchNetwork('mainnet')}> Connect to harmony mainnet </Button> 
              <Button width={250} mb={7} onClick={() => switchNetwork('testnet')}> Connect to harmony testnet </Button> 
              <Button width={250} onClick={() => switchNetwork('hardhat')}> Connect to local hardhat node </Button> 
            </AlertDialogBody>
          </AlertDialogContent>
        </AlertDialogOverlay>
    </AlertDialog>

    </VStack>
    </div>
  )
}

export default HomePage
