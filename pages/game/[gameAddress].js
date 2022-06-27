import Head from "next/head";
import Web3Modal from "web3modal";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import zkHangman from "../../abis/zkHangman.json"
import { ethers } from "ethers";
import {
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Spinner,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogBody,
  useDisclosure
} from "@chakra-ui/react";

import TopNav from "../../components/TopNav"
import InitializeGame from "../../components/InitializeGame";
import SubmitGuess from "../../components/SubmitGuess";
import GameStats from "../../components/GameStats";
import ProcessGuess from "../../components/ProcessGuess";
import { useConnection } from "../../context/ConnectionContext";

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

function GamePage() {
  const { instance, provider, signer, network, chainId, accountAddress } = useConnection()

  const [hostAddress, setHostAddress] = useState('');
  const [playerAddress, setPlayerAddress] = useState('');
  const [totalChars, setTotalChars] = useState(0)

  const [playerLives, setPlayerLives] = useState();
  const [correctGuesses, setCorrectGuesses] = useState(0);

  const [turn, setTurn] = useState();

  const [contractConnected, setContractConnected] = useState(false);

  const [revealedChars, setRevealedChars] = useState([]);
  const [guess, setGuess] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSelectOpen, onOpen: onSelectOpen, onClose: onSelectClose } = useDisclosure();

  const [dialogMessage, setDialogMessage] = useState('');
  const [error, setError] = useState();

  const router = useRouter();
  const { gameAddress } = router.query;
  const gameContract = gameAddress;


  useEffect(() => {
    console.log('GameStats useEffect')
    if (!router.isReady) return;

    if (web3Modal.cachedProvider) {
      connectContract();
    }

  }, [router.isReady, signer])

  const connectContract = async () => {
    console.log('Connecting contract')
    console.log(gameContract, zkHangmanAbi, signer)
    try {
      const zkHangmanContract = new ethers.Contract(
        gameContract,
        zkHangmanAbi,
        signer
      );

      let host = await zkHangmanContract.host();
      console.log("host:", host)
      setHostAddress(host);

      let player = await zkHangmanContract.player();
      console.log("player:", player)
      setPlayerAddress(player);

      let totalChars = parseInt(await zkHangmanContract.totalChars(), 16)
      setTotalChars(totalChars)
      console.log("total chars: ", totalChars);

      let playerLives = parseInt(await zkHangmanContract.playerLives(), 16);
      console.log("player Lives: ", playerLives);
      setPlayerLives(playerLives);

      let _correctGuesses = parseInt(await zkHangmanContract.correctGuesses(), 16);
      console.log("correct guesses: ", _correctGuesses);
      setCorrectGuesses(_correctGuesses)

      let turn = parseInt((await zkHangmanContract.turn())._hex, 16);
      console.log("turn", turn)
      setTurn(turn);

      let guesses = []
      for (let i = 0; i < Math.floor(turn / 2); i++) {
        let guess = String.fromCharCode(parseInt(await zkHangmanContract.guesses(i), 16) + 97)
        console.log(guess)
        guesses.push(guess)
      }
      console.log(guesses)

      let revealedChars = []
      for (let i = 0; i < totalChars; i++) {
        let revealedChar = parseInt(await zkHangmanContract.revealedChars(i)) + 97
        if (revealedChar < 123) {
          revealedChar = String.fromCharCode(revealedChar)
        } else {
          revealedChar = String.fromCharCode(63)
        }
        revealedChars.push(revealedChar)
      }
      console.log(revealedChars)
      setRevealedChars(revealedChars)

      setContractConnected(true);

    } catch (error) {
      setError(error);
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

        <GameStats
          playerLives={playerLives}
          correctGuesses={correctGuesses}
          turn={turn}
        />

        {accountAddress == hostAddress && turn > 0 && turn % 2 == 0 && (
          <ProcessGuess turn={turn}></ProcessGuess>
        )}

        {accountAddress == hostAddress && turn == 0 && (
          <InitializeGame></InitializeGame>
        )}

        {accountAddress == playerAddress && turn % 2 == 1 && (
          <SubmitGuess></SubmitGuess>
        )}

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
