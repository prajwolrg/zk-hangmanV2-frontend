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
} from "@chakra-ui/react";

import TopNav from "../../components/TopNav";
import { useConnection } from "../../context/ConnectionContext";
import Figure from "../../components/Figure";
import { isValidChar } from "../../utils/wordUtils";
import { toHex } from "../../utils";
import GuessStepper from "../../components/GuessStepper";
import Confetti from "react-confetti";

import AlphabetList from "../../components/AlphabetList";
import ProcessGuess from "../../components/ProcessGuess";
import RevealedLetters from "../../components/RevealedLetters";
import { getGameStatus } from "../../utils/gameUtils";
import next from "next";

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

  const [hostAddress, setHostAddress] = useState("");
  const [playerAddress, setPlayerAddress] = useState("");
  const [totalChars, setTotalChars] = useState(0);
  const [guesses, setGuesses] = useState([]);

  const [zkHangmanContract, setZkHangmanContract] = useState(null);

  const [playerLives, setPlayerLives] = useState();
  const [correctGuesses, setCorrectGuesses] = useState(0);

  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(null);

  const [turn, setTurn] = useState(0);

  const [contractConnected, setContractConnected] = useState(false);

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

  const handleGuessSubmit = (e) => {
    console.log(e);
    console.log(typeof e);
    submitGuess({ guess: e });
  };

  const router = useRouter();
  const { gameAddress } = router.query;
  const gameContract = gameAddress;

  const submitGuess = async ({ guess }) => {
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
    console.log("Awaiting transaction confirmation...");
    setCurrentStep(0);

    let tx = await zkHangmanContract.playerGuess(toHex(guessNumba));
    setCurrentStep(1);

    setDialogMessage("Waiting for transaction to finalize...");
    console.log("Waiting for transaction to finalize...");

    await tx.wait();
    setCurrentStep(2);
  };

  const handleNextTurn = async (nextTurn) => {
    console.log(`State turn: ${turn}, Blockchain turn: ${nextTurn}`)
    if (nextTurn > turn) {
      getContractData();
    }
  };

  useEffect(() => {
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
  }, [router.isReady, signer]);

  const getContractData = async () => {
    if (accountAddress) {
      const {
        _host,
        _player,
        _totalChars,
        _playerLives,
        _correctGuesses,
        _turn,
        _revealedChars,
        _guesses,
      } = await getGameStatus(gameContract, signer);

      setHostAddress(_host);
      setPlayerAddress(_player);
      setTotalChars(_totalChars);
      setPlayerLives(_playerLives);
      setCorrectGuesses(_correctGuesses);
      setTurn(_turn);
      setRevealedChars(_revealedChars);
      setGuesses(_guesses);

      setContractConnected(true);

      if (_turn % 2 == 0) {
        if (_guesses.length > 0) {
          const lastGuess = _guesses[_guesses.length - 1].toUpperCase()
          console.log(`Last guess was: ${lastGuess}`)
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
        backgroundColor="whitesmoke"
      >
        <VStack>
          {accountAddress && accountAddress == playerAddress && turn % 2 == 1 && (
            <Heading marginBottom={10}>Make your guess!</Heading>
          )}

          {accountAddress && accountAddress == hostAddress && turn % 2 == 0 && (
            <Heading marginBottom={10}>Process the guess!</Heading>
          )}

          <Figure playerLives={playerLives} />

          <RevealedLetters
            revealedChars={revealedChars}
            totalChars={totalChars}
          />

          <AlphabetList
            guesses={guesses}
            revealedKeys={revealedChars}
            handleSubmit={handleGuessSubmit}
            player={accountAddress == playerAddress}
            initialLetter={lastValidGuess}
          />

          {accountAddress && accountAddress == hostAddress && turn % 2 == 0 && (
            <ProcessGuess turn={turn} />
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
