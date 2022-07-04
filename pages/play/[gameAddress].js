import Head from "next/head";
import Web3Modal from "web3modal";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import zkHangman from "../../abis/zkHangman.json";
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
  useDisclosure,
  Center,
  PinInput,
  PinInputField,
  AlertDialogFooter,
  AlertDialogHeader,
  useToast,
} from "@chakra-ui/react";

import useWindowSize from 'react-use/lib/useWindowSize'

import TopNav from "../../components/TopNav";
import { useConnection } from "../../context/ConnectionContext";
import Figure from "../../components/Figure";
import { isValidChar } from "../../utils/wordUtils";
import { toHex } from "../../utils";
import GuessStepper from "../../components/GuessStepper";
import Confetti from "react-confetti";

import AlphabetList from "../../components/AlphabetList";
import ProcessGuess from "../../components/ProcessGuess";
import SubmitGuess from "../../components/SubmitGuess";
import RevealedLetters from "../../components/RevealedLetters";
import { getGameStatus } from "../../utils/gameUtils";
import Reveal from "../../components/Reveal";

const zkHangmanAbi = zkHangman.abi;

const providerOptions = {};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });
}

function GamePage() {
  const { instance, provider, signer, network, chainId, accountAddress } =
    useConnection();
  const { width, height } = useWindowSize()

  const toast = useToast()

  const [hostAddress, setHostAddress] = useState("");
  const [playerAddress, setPlayerAddress] = useState("");
  const [totalChars, setTotalChars] = useState(0);
  const [guesses, setGuesses] = useState([]);

  const [currentAlphabet, setCurrentAlphabet] = useState()

  const [zkHangmanContract, setZkHangmanContract] = useState(null);

  const [playerLives, setPlayerLives] = useState();
  const [correctGuesses, setCorrectGuesses] = useState(0);

  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(null);

  const [turn, setTurn] = useState(0);

  const [contractConnected, setContractConnected] = useState(false);
  const [allRevealed, setAllRevealed] = useState(false)

  const [revealedChars, setRevealedChars] = useState([]);
  const [guess, setGuess] = useState("");
  const [lastValidGuess, setLastValidGuess] = useState("");

  const [currentStep, setCurrentStep] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSelectOpen,
    onOpen: onSelectOpen,
    onClose: onSelectClose,
  } = useDisclosure();

  const [dialogMessage, setDialogMessage] = useState("");
  const [error, setError] = useState();

  const cancelRef = useRef();

  const router = useRouter();
  const { gameAddress } = router.query;
  const gameContract = gameAddress;

  const handleNextTurn = async (nextTurn) => {
    console.log(`State turn: ${turn}, Blockchain turn: ${nextTurn}`)
    if (nextTurn > turn) {
      getContractData();
    }
  };

  useEffect(() => {
    if (provider) {getContractData()}

    if (!router.isReady) return;

    if (web3Modal.cachedProvider) {
      getContractData();
    }

    if (accountAddress) {
      const _zkHangmanContract = new ethers.Contract(
        gameContract,
        zkHangmanAbi,
        signer
      );
      setZkHangmanContract(_zkHangmanContract);
      _zkHangmanContract.on("NextTurn", handleNextTurn);
    }

    return () => {
      if (zkHangmanContract) {
        zkHangmanContract.off("NextTurn", handleNextTurn);
      }
    };
  }, [router.isReady, signer, provider]);

  const getContractData = async () => {
    if (provider) {
      const gameStatus = await getGameStatus(gameContract, provider)
      // console.log(gameStatus)
      const {
        _host,
        _player,
        _gameOver,
        _totalChars,
        _playerLives,
        _correctGuesses,
        _turn,
        _revealedChars,
        _guesses,
        _allRevealed
      } = gameStatus;


      setHostAddress(_host);
      setPlayerAddress(_player);
      setTotalChars(_totalChars);
      setPlayerLives(_playerLives);
      setCorrectGuesses(_correctGuesses);
      setTurn(_turn);
      setAllRevealed(_allRevealed)
      setRevealedChars(_revealedChars);
      setGuesses(_guesses);
      setGameOver(_gameOver)

      if (_gameOver) {
        if (_playerLives > 0) {
          console.log("You WIN!")
          setGameWin(true)
        } else {
          console.log("You LOSE!")
          setGameWin(false)
        }
      }

      setContractConnected(true);

      if (_turn % 2 == 0) {
        if (_guesses.length > 0) {
          const lastGuess = _guesses[_guesses.length - 1].toUpperCase()
          // console.log(`Last guess was: ${lastGuess}`)
          setLastValidGuess(lastGuess);
        }
      }

      if (_turn % 2 == 1) {
        setLastValidGuess("");
        onClose()
      }

    }
  };

  const playNewGame = () => {
    router.push("/");
  };

  const errors = 0;
  const [openModal, setOpenModal] = useState(false);
  const [guessedLetter, setGuessedLetter] = useState("");

  return (
    <>
      <Head>
        <title> zkHangman - {gameAddress} </title>
      </Head>

      <TopNav></TopNav>

      <Center
        // overflow="hidden"
        // height={"95vh"}
        alignItems="center"
      // backgroundColor="whitesmoke"
      >
        <VStack>

          {accountAddress && !gameOver && accountAddress == playerAddress && turn % 2 == 1 && (
            <Heading marginBottom={10} marginTop={10}>Make your guess!</Heading>
          )}

          {accountAddress && !gameOver && accountAddress == playerAddress && turn % 2 == 0 && (
            <Heading marginBottom={10} marginTop={10}>Waiting to reveal guess...</Heading>
          )}

          {accountAddress && !gameOver && accountAddress == hostAddress && turn % 2 == 0 && (
            <Heading marginBottom={10} marginTop={10}>Process the guess!</Heading>
          )}
          {accountAddress && !gameOver && accountAddress == hostAddress && turn % 2 == 1 && (
            <Heading marginBottom={10} marginTop={10}>Waiting for the guess...</Heading>
          )}

          {accountAddress && gameOver && (
            <Heading marginBottom={10} marginTop={10}> {
              accountAddress == playerAddress ?
                gameWin ?
                  "Congratulations! You Won!" :
                  "Sorry! You Lost!" :
                accountAddress == hostAddress ?
                  gameWin ? "Sorry! You Lost!" :
                    "Congratulations! You Won!" :
                  "Game Over"
            }
            </Heading>
          )}

          {accountAddress && gameOver && gameWin && accountAddress == playerAddress && (
            <Confetti width={width} height={height} />
          )}

          {accountAddress && gameOver && !gameWin && accountAddress == hostAddress && (
            <Confetti width={width} height={height} />
          )}


          <Figure playerLives={playerLives} />

          <RevealedLetters
            revealedChars={revealedChars}
            totalChars={totalChars}
          />

          <AlphabetList
            guesses={guesses}
            revealedKeys={revealedChars}
            handleLetterChange={setCurrentAlphabet}
            player={accountAddress == playerAddress}
            initialLetter={lastValidGuess}
            gameOver={gameOver}
            turn={turn}
          />

          {accountAddress && !gameOver && accountAddress == playerAddress && (
            <SubmitGuess guess={currentAlphabet} turn={turn} correctGuesses={correctGuesses} playerLives={playerLives} />
          )}

          {accountAddress && !gameOver && accountAddress == hostAddress && (
            <ProcessGuess turn={turn} />
          )}

          {/* {
            toast({
              title: 'Account created.',
              description: "We've created your account for you.",
              status: 'success',
              duration: 9000,
              isClosable: true,
            })
          } */}


          {accountAddress && gameOver && accountAddress == hostAddress && !allRevealed && (
            <Reveal revealedChars={revealedChars} />
          )}

        </VStack>
      </Center>

      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            {gameOver && gameWin && (
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Congratulations! You Won!
              </AlertDialogHeader>
            )}

            {gameOver && !gameWin && (
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Sorry! You Lost!
              </AlertDialogHeader>
            )}

            <AlertDialogBody align="center" py={10}>
              {!gameOver && <GuessStepper currentStep={currentStep} />}

              {gameOver && gameWin && (
                <>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Congratulations! You Won!
                  </AlertDialogHeader>
                  <Confetti height={250} width={460}></Confetti>
                </>
              )}

              {/* <Text mb={7}> {dialogMessage} </Text>
							<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" /> */}
            </AlertDialogBody>

            {gameOver && (
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={playNewGame}>
                  Play New Game
                </Button>
              </AlertDialogFooter>
            )}
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default GamePage;
