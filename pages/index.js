import Head from "next/head";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// import { zkHangmanFactoryAbi } from "../abis/zkHangmanFactory";
import zkHangmanFactory from "../abis/zkHangmanFactory.json";
import {
  toHex,
  harmonyTestnetParams,
  harmonyMainnetParams,
  hardhatNodeParams,
} from "../utils";
import {
  HStack,
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
} from "@chakra-ui/react";

import TopNav from "../components/TopNav";
import { useConnection } from "../context/ConnectionContext";
import { useContractAddresses } from "../context/ContractContext";
import Login from "../components/Login";
import ExistingGame from "../components/ExistingGame";
import LandingPage from "./LandingPage";
import Stepper from "../components/Stepper";
import ModalComponent from "../components/ModalComponent";
import PlayerScreen from "./playerScreen";

const zkHangmanFactoryAbi = zkHangmanFactory.abi;

const providerOptions = {};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });
}

// local hardhat contract addresses
const localZkHangmanFactory = "0x997691EA886836FB59F547E915D5C1b7EE236A17";
const localInitVerifier = "0xCf1aFDe70a43EBe93f4224aa239DD828353Ae1c7";
const localGuessVerifier = "0x1D9317911CF1003B42a965574c29f18a87A2858c";

// harmony testnet contract addresses
const devZkHangmanFactory = "0x22A4212DeF5d3aA83c68beaAb0650307A01A08eB";
const devInitVerifier = "0x130F9B984165CD444E35af37b26e5BC4F8fFF26d";
const devGuessVerifier = "0x0AdB1582DC1f288C178137A3ec8d229127bfEaCe";

// harmony mainnet contract addresses
const mainZkHangmanFactory = "0x295b98D5977b303d965cCcaa5e8BF888fb29e824";
const mainInitVerifier = "0xcb3729aE1C27De9b4F7826A749f49E74dC130344";
const mainGuessVerifier = "0x262201b73941709113Fb47E564C9026830476706";

function HomePage() {
  const [error, setError] = useState();
  const [dialogMessage, setDialogMessage] = useState();
  const [gameAddress, setGameAddress] = useState("");
  const [hostAddress, setHostAddress] = useState("");
  const [playerAddress, setPlayerAddress] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSelectOpen,
    onOpen: onSelectOpen,
    onClose: onSelectClose,
  } = useDisclosure();

  const { instance, provider, signer, network, chainId, accountAddress } =
    useConnection();
  const {
    ZK_HANGMAN_FACTORY_ADDRESS,
    INIT_VERIFIER_ADDRESS,
    GUESS_VERIFIER_ADDRESS,
  } = useContractAddresses();
  console.log(chainId);
  console.log(ZK_HANGMAN_FACTORY_ADDRESS);
  console.log(INIT_VERIFIER_ADDRESS);
  console.log(GUESS_VERIFIER_ADDRESS);

  const gameAddressChange = (e) => {
    setGameAddress(e.target.value);
  };

  const hostAddressChange = (e) => {
    setHostAddress(e.target.value);
  };

  const playerAddressChange = (e) => {
    setPlayerAddress(e.target.value);
  };

  const router = useRouter();

  const gotoGame = (e) => {
    e.preventDefault();
    let href = "/game/" + gameAddress;
    router.push(href);
  };

  const createGame = async (e) => {
    console.log(`Trying to create a game`);

    console.log("host address: ", hostAddress);
    console.log("player address: ", playerAddress);
    console.log("init verifier address: ", INIT_VERIFIER_ADDRESS);
    console.log("guess verifier address: ", GUESS_VERIFIER_ADDRESS);

    e.preventDefault();
    const zkHangmanFactoryContract = new ethers.Contract(
      ZK_HANGMAN_FACTORY_ADDRESS,
      zkHangmanFactoryAbi,
      signer
    );

    console.log(zkHangmanFactoryContract);

    onOpen();
    setDialogMessage("Awaiting transaction confirmation...");

    let tx = await zkHangmanFactoryContract.createGame(
      hostAddress,
      playerAddress,
      INIT_VERIFIER_ADDRESS,
      GUESS_VERIFIER_ADDRESS
    );

    setDialogMessage("Waiting for transaction to finalize...");

    let txFinalized = await tx.wait();

    onClose();

    let filter = zkHangmanFactoryContract.filters.GameCreated(
      hostAddress,
      playerAddress
    );
    let filterResults = await zkHangmanFactoryContract.queryFilter(
      filter,
      -1000
    );
    let newGameAddress =
      filterResults[filterResults.length - 1].args.gameAddress;

    let href = "/game/" + newGameAddress;
    router.push(href);
  };

  return (
    <div>
      <Head>
        <title> zkHangman </title>
      </Head>
      <TopNav />
      <Button
        onClick={() => {
          router.push("/playerScreen");
        }}
      >
        Checkout Player Screen
      </Button>
      <LandingPage />
      {/* <VStack h="100vh" mt={10}>
        {(chainId == 1666900000 || chainId == 1666600000 || chainId == 31337) &&
          accountAddress && (
            <VStack>
              <Heading mb="10px"> Create new game </Heading>
              <Login></Login>
              <Heading mb="10px">Join Existing Game</Heading>
              <ExistingGame></ExistingGame>

              <Box my="30px" width={460}>
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
          )}

        <AlertDialog isOpen={isOpen} onClose={onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogBody align="center" py={10}>
                <Text mb={7}> {dialogMessage} </Text>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
              </AlertDialogBody>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        <AlertDialog isOpen={isSelectOpen} onClose={onSelectClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogBody align="center" py={10}>
                <Button
                  mb={7}
                  width={250}
                  onClick={() => switchNetwork("mainnet")}
                >
                  {" "}
                  Connect to harmony mainnet{" "}
                </Button>
                <Button
                  width={250}
                  mb={7}
                  onClick={() => switchNetwork("devnet")}
                >
                  {" "}
                  Connect to harmony devnet{" "}
                </Button>
                <Button width={250} onClick={() => switchNetwork("hardhat")}>
                  {" "}
                  Connect to local hardhat node{" "}
                </Button>
              </AlertDialogBody>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </VStack> */}
    </div>
  );
}

export default HomePage;
