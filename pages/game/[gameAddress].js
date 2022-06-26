import Head from "next/head";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// import { zkHangmanAbi } from "../../abis/zkHangman";
import zkHangman from "../../abis/zkHangman.json"
import { toHex, harmonyDevnetParams } from "../../utils";
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
  useDisclosure
} from "@chakra-ui/react";

import Figure from "../../components/Figure"
import TopNav from "../../components/TopNav"
import InitializeGame from "../../components/InitializeGame";

const snarkjs = require("snarkjs");

const zkHangmanAbi = zkHangman.abi

const providerOptions = {};

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
  });
}

// mainnet and testnet verifier addresses are the same so we don't need to store them both
const initVerifierAddress = "0xcb3729aE1C27De9b4F7826A749f49E74dC130344";
const guessVerifierAddress = "0x262201b73941709113Fb47E564C9026830476706";

function GamePage() {
  const [error, setError] = useState();
  const [dialogMessage, setDialogMessage] = useState('');
  const [instance, setInstance] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [chainId, setChainId] = useState();
  const [hostAddress, setHostAddress] = useState('');
  const [playerAddress, setPlayerAddress] = useState('');

  const [turn, setTurn] = useState();
  const [lives, setLives] = useState();
  const [contractConnected, setContractConnected] = useState(false);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [revealedChars, setRevealedChars] = useState([]);
  const [guess, setGuess] = useState('');

  const [secret, setSecret] = useState('');
  const [char1, setChar1] = useState('');
  const [char2, setChar2] = useState('');
  const [char3, setChar3] = useState('');
  const [char4, setChar4] = useState('');
  const [char5, setChar5] = useState('');

  const [rev1, setRev1] = useState();
  const [rev2, setRev2] = useState();
  const [rev3, setRev3] = useState();
  const [rev4, setRev4] = useState();
  const [rev5, setRev5] = useState();

  const router = useRouter();
  const { gameAddress } = router.query;
  const gameContract = gameAddress;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSelectOpen, onOpen: onSelectOpen, onClose: onSelectClose } = useDisclosure();

  useEffect(() => {
    if (!router.isReady) return;

    if (web3Modal.cachedProvider) {
      connectWallet();
    }


  }, [router.isReady])

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = await provider.getSigner();
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();
      setInstance(instance);
      setProvider(provider);
      setSigner(signer);
      setNetwork(network);
      setChainId(network.chainId);
      if (accounts) setAccount(accounts[0]);

      console.log("le gameAddress: ", gameContract);
      console.log("le signer: ", signer);

      const zkHangmanContract = new ethers.Contract(
        gameContract,
        zkHangmanAbi,
        signer
      );

      zkHangmanContract.on("NextTurn", async (nextTurn) => {
        console.log("The turn is now: ", nextTurn);
        let decTurn = parseInt(nextTurn._hex, 16);
        setTurn(decTurn);

        console.log('Getting correct guesses')
        const cGuesses = await zkHangmanContract.correctGuesses()
        console.log(cGuesses)

        let _correctGuesses = parseInt(await zkHangmanContract.correctGuesses(), 16);
        setCorrectGuesses(_correctGuesses);

        refreshRevealed(zkHangmanContract);

        let playerLives = parseInt(await zkHangmanContract.playerLives(), 16);
        setLives(playerLives);
      });

      let playerLives = parseInt(await zkHangmanContract.playerLives(), 16);
      let turn = parseInt((await zkHangmanContract.turn())._hex, 16);
      console.log("turn: ", turn);
      let _correctGuesses = parseInt(await zkHangmanContract.correctGuesses(), 16);
      console.log("correct guesses: ", _correctGuesses);
      let host = await zkHangmanContract.host();
      let player = await zkHangmanContract.player();

      console.log("initVerifier: ", await zkHangmanContract.initVerifier());
      console.log("guessVerifier: ", await zkHangmanContract.guessVerifier());

      setLives(playerLives);
      setTurn(turn);
      setContractConnected(true);
      setCorrectGuesses(_correctGuesses)
      setHostAddress(host);
      setPlayerAddress(player);

      refreshRevealed(zkHangmanContract);

    } catch (error) {
      setError(error);
    }

  }

  const refreshRevealed = async (contract) => {
    const revealed1 = await contract.revealedChars(0);
    setRev1(revealed1);

    const revealed2 = await contract.revealedChars(1);
    setRev2(revealed2);

    const revealed3 = await contract.revealedChars(2);
    setRev3(revealed3);

    const revealed4 = await contract.revealedChars(3);
    setRev4(revealed4);

    const revealed5 = await contract.revealedChars(4);
    setRev5(revealed5);
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

  const secretChange = (e) => {
    e.preventDefault();
    setSecret(e.target.value);
  }

  const char1Change = (e) => {
    e.preventDefault();
    setChar1(e.target.value);
  }

  const char2Change = (e) => {
    e.preventDefault();
    setChar2(e.target.value);
  }

  const char3Change = (e) => {
    e.preventDefault();
    setChar3(e.target.value);
  }

  const char4Change = (e) => {
    e.preventDefault();
    setChar4(e.target.value);
  }

  const char5Change = (e) => {
    e.preventDefault();
    setChar5(e.target.value);
  }

  const guessChange = (e) => {
    e.preventDefault();
    setGuess(e.target.value);
  }

  const processGuess = async (e) => {
    e.preventDefault();

    console.log("secret: ", secret);

    setDialogMessage("Generating proof...");
    onOpen();

    const zkHangmanContract = new ethers.Contract(
      gameContract,
      zkHangmanAbi,
      signer
    )

    let hexLatestGuess = await zkHangmanContract.guesses(toHex(Math.floor((turn - 1) / 2)));
    console.log("turn: ", turn);
    console.log("index: ", Math.floor((turn - 1) / 2));
    console.log("hex latest guess: ", hexLatestGuess._hex);

    let inputObject = {
      char: BigInt(parseInt(hexLatestGuess._hex, 16)),
      secret: BigInt(secret)
    }

    console.log(inputObject);

    const { proof, publicSignals } =
      await snarkjs.groth16.fullProve(inputObject, "/guess.wasm", "/guess_0001.zkey");

    const vkey = await fetch("/guess_verification_key.json").then((res) => {
      return res.json();
    })

    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    console.log("proof result: ", res);


    console.log(proof);
    console.log(publicSignals);

    const _a = [toHex(proof.pi_a[0]), toHex(proof.pi_a[1])];
    const _b = [
      [
        toHex(proof.pi_b[0][1]),
        toHex(proof.pi_b[0][0])
      ],
      [
        toHex(proof.pi_b[1][1]),
        toHex(proof.pi_b[1][0])
      ]
    ];
    const _c = [toHex(proof.pi_c[0]), toHex(proof.pi_c[1])];

    const _input = publicSignals.map(x => toHex(x));


    console.log(_a, _b, _c, _input);

    setDialogMessage("Awaiting transaction confirmation...");

    let tx = await zkHangmanContract.processGuess(_a, _b, _c, _input);

    setDialogMessage("Waiting for transaction to finalize...");

    console.log(tx);

    let txFinalized = await tx.wait();

    onClose();

    console.log(txFinalized);

  }

  // generate proof for init and call initializeGame
  const generateProof = async (e) => {
    e.preventDefault();

    setDialogMessage("Generating proof...");
    onOpen();

    console.log(secret, char1, char2, char3, char4, char5);
    let parsedChar1 = (char1.toLowerCase()).charCodeAt(0) - 97
    let parsedChar2 = (char2.toLowerCase()).charCodeAt(0) - 97
    let parsedChar3 = (char3.toLowerCase()).charCodeAt(0) - 97
    let parsedChar4 = (char4.toLowerCase()).charCodeAt(0) - 97
    let parsedChar5 = (char5.toLowerCase()).charCodeAt(0) - 97
    console.log(parsedChar1, parsedChar2, parsedChar3, parsedChar4, parsedChar5);

    let remainingChars = []
    for (var i = 0; i < 20; i++) {
      remainingChars.push(BigInt(0))
    }

    let inputObject = {
      secret: BigInt(secret),
      char: [BigInt(parsedChar1), BigInt(parsedChar2), BigInt(parsedChar3),
      BigInt(parsedChar4), BigInt(parsedChar5), ...remainingChars]
    }

    console.log(inputObject);

    const zkHangmanContract = new ethers.Contract(
      gameContract,
      zkHangmanAbi,
      signer
    )

    const { proof, publicSignals } =
      await snarkjs.groth16.fullProve(inputObject, "/init.wasm", "/init_0001.zkey");

    const vkey = await fetch("/init_verification_key.json").then((res) => {
      return res.json();
    })

    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    console.log("proof result: ", res);

    console.log(proof);
    console.log(publicSignals);

    const _a = [toHex(proof.pi_a[0]), toHex(proof.pi_a[1])];
    const _b = [
      [
        toHex(proof.pi_b[0][1]),
        toHex(proof.pi_b[0][0])
      ],
      [
        toHex(proof.pi_b[1][1]),
        toHex(proof.pi_b[1][0])
      ]
    ];
    const _c = [toHex(proof.pi_c[0]), toHex(proof.pi_c[1])];

    const _input = publicSignals.map(x => toHex(x));

    console.log(_a, _b, _c, _input);

    setDialogMessage("Awaiting transaction confirmation...");

    let tx = await zkHangmanContract.initializeGame(_a, _b, _c, _input, 5);

    console.log(tx);
    setDialogMessage("Waiting for transaction to finalize...");

    let txFinalized = await tx.wait();

    onClose();

    console.log(txFinalized);
  }

  const submitGuess = async (e) => {
    e.preventDefault();

    const zkHangmanContract = new ethers.Contract(
      gameContract,
      zkHangmanAbi,
      signer
    );

    let guessNumba = guess.trim().toLowerCase().charCodeAt(0) - 97;

    console.log(`sending the number ${guessNumba} to the contract`);
    console.log("the guess from this number was: ", guess);

    onOpen();

    setDialogMessage("Awaiting transaction confirmation...");

    let tx = await zkHangmanContract.playerGuess(toHex(guessNumba));

    setDialogMessage("Waiting for transaction to finalize...");

    await tx.wait()

    onClose();
  }

  const parseHex = (hex) => {
    let num = parseInt(hex, 16);
    if (num == 99) {
      return "?";
    } else {
      return String.fromCharCode(97 + num);
    }
  }

  return (
    <>
      <Head>
        <title> zkHangman - {gameAddress} </title>
      </Head>
      <TopNav></TopNav>
      <VStack mt={10}>
        <Heading mb={7}>zkHangman</Heading>

        {
          (correctGuesses == 5) && (
            <h1> GAME OVER. PLAYER HAS WON! </h1>
          )
        }
        {
          !contractConnected && (
            <h1> Connecting to contract... </h1>
          )
        }

    //
        // Characters revealed
        //
        {
          (contractConnected && (chainId == 1666900000 || chainId == 1666600000 || chainId == 31337)) && (
            <VStack width={500} pt="20px">
              <Heading size="md"> Characters revealed so far </Heading>
              <HStack>
                <Text fontSize="xl"> {rev1 && parseHex(rev1._hex)} </Text>
                <Text fontSize="xl"> {rev2 && parseHex(rev2._hex)} </Text>
                <Text fontSize="xl"> {rev3 && parseHex(rev3._hex)} </Text>
                <Text fontSize="xl"> {rev4 && parseHex(rev4._hex)} </Text>
                <Text fontSize="xl"> {rev5 && parseHex(rev5._hex)} </Text>
              </HStack>
            </VStack>
          )
        }

    //
        // Game stats
        //
        {(contractConnected && (chainId == 1666900000 || chainId == 1666600000 || chainId == 31337) && account) &&
          (
            <>

              <HStack width={500} justify="space-evenly" py="15px">

                <VStack>
                  <Heading size="md"> Correct Guesses </Heading>
                  <Text> {correctGuesses} </Text>
                </VStack>


                <VStack>
                  <Heading size="md"> Player lives </Heading>
                  <Text> {lives} </Text>
                </VStack>


                <VStack>
                  <Heading size="md"> Turn number</Heading>
                  <Text> {turn} </Text>
                </VStack>

                <VStack>
                  <Figure errors={6 - lives}></Figure>
                </VStack>

              </HStack>

              <VStack width={500}>
                {turn == 0 ? <Heading size="lg"> Waiting for host to choose a word and initialize game </Heading>
                  : (turn % 2 == 1 && account != playerAddress) ? <Heading size="lg"> Player's turn! </Heading> :
                    (turn % 2 == 0 && account != hostAddress) ? <Heading size="lg"> Host's turn! </Heading> : <> </>}
              </VStack>
            </>
          )
        }

    //
        // PLAYER SUBMIT GUESS
        //
        {
          (contractConnected && (chainId == 1666900000 || chainId == 1666600000 || chainId == 31337) && account == playerAddress && turn % 2 == 1) &&
          (
            <VStack width={500}>
              <Heading size="lg"> You're the player. Make a guess! </Heading>
              <form onSubmit={submitGuess}>
                <FormLabel>
                  Guess:
                </FormLabel>
                <Input mb="5px" type="text" value={guess} onChange={guessChange} />

                <Input type="submit" value="Submit" />

              </form>

            </VStack>
          )
        }

    //
        // HOST PROCESS GUESS
        //
        {
          (contractConnected && (chainId == 1666900000 || chainId == 1666600000 || chainId == 31337) && account == hostAddress &&
            turn != 0 && turn % 2 == 0) && (
            <VStack width={500}>
              <Heading size="md"> You are the host. Process the guess. If the value of the secret field below
                is empty, enter the secret you set in the init process! </Heading>
              <form onSubmit={processGuess}>

                <FormLabel>
                  Secret number:
                </FormLabel>
                <Input mb={3} width={500} type="number" value={secret} onChange={secretChange} />
                <Input type="submit" onClick={processGuess} value="Process guess" />
              </form>
            </VStack>
          )
        }

    //
        // HOST INITIAL SETUP
        //
        {
          (contractConnected && (chainId == 1666900000 || chainId == 1666600000 || chainId == 31337) && account == hostAddress && turn == 0) &&
          (
            <InitializeGame></InitializeGame>
            // <VStack width={500}>
            //   <form onSubmit={generateProof}>


            //     <FormControl>
            //       <FormLabel>
            //         Secret:
            //       </FormLabel>
            //       <Input width={500} mb="5px" type="text" value={secret} onChange={secretChange} />
            //       <FormLabel>
            //         Enter characters from a-z that make up your five letter word
            //       </FormLabel>
            //       <HStack width={500} mb={5}>
            //         <Input type="text" value={char1} onChange={char1Change} />
            //         <Input type="text" value={char2} onChange={char2Change} />
            //         <Input type="text" value={char3} onChange={char3Change} />
            //         <Input type="text" value={char4} onChange={char4Change} />
            //         <Input type="text" value={char5} onChange={char5Change} />
            //       </HStack>
            //       <Input width={500} type="submit" value="Submit" />
            //     </FormControl>

            //   </form>
            // </VStack>
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
      </VStack>

      <AlertDialog isOpen={isSelectOpen} onClose={onSelectClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogBody align="center" py={10}>
              <Button mb={7} width={250} onClick={() => switchNetwork(true)}> Connect to harmony mainnet </Button>
              <Button width={250} onClick={() => switchNetwork(false)}> Connect to harmony testnet </Button>
            </AlertDialogBody>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>


    </>
  )
}

export default GamePage
