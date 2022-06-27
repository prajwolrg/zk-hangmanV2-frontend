import Head from "next/head";
import Web3Modal from "web3modal";
import { useEffect, useRef, useState } from "react";
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
	useDisclosure,
	Center,
	PinInput,
	PinInputField,
	AlertDialogFooter,
	AlertDialogHeader
} from "@chakra-ui/react";

import TopNav from "../../components/TopNav"
import { useConnection } from "../../context/ConnectionContext";
import Figure from "../../components/Figure";
import { isValidChar } from "../../utils/wordUtils";
import { toHex } from "../../utils";
import GuessStepper from "../../components/GuessStepper";
import Confetti from 'react-confetti'

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
	const [guesses, setGuesses] = useState([])

	const [playerLives, setPlayerLives] = useState();
	const [correctGuesses, setCorrectGuesses] = useState(0);

	const [gameOver, setGameOver] = useState(false)
	const [gameWin, setGameWin] = useState(null)

	const [turn, setTurn] = useState();

	const [contractConnected, setContractConnected] = useState(false);

	const [revealedChars, setRevealedChars] = useState([]);
	const [guess, setGuess] = useState('');
	const [lastValidGuess, setLastValidGuess] = useState('')

	const [currentStep, setCurrentStep] = useState(0)

	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isSelectOpen, onOpen: onSelectOpen, onClose: onSelectClose } = useDisclosure();

	const [dialogMessage, setDialogMessage] = useState('');
	const [error, setError] = useState();

	const cancelRef = useRef()


	const router = useRouter();
	const { gameAddress } = router.query;
	const gameContract = gameAddress;

	const refreshRevealedChars = async (zkHangmanContract, totalChars) => {
		console.log('Revealing chars', totalChars)
		let revealedChars = []
		for (let i = 0; i < totalChars; i++) {
			let revealedChar = parseInt(await zkHangmanContract.revealedChars(i)) + 97
			if (revealedChar < 123) {
				console.log(revealedChar)
				console.log(revealedChars)
				revealedChar = String.fromCharCode(revealedChar)
				console.log(revealedChar)
			} else {
				revealedChar = String.fromCharCode(63)
			}
			revealedChars.push(revealedChar)
		}
		setLastValidGuess('')
		console.log(revealedChars)
		setRevealedChars(revealedChars)
	}

	const refreshGuesses = async (zkHangmanContract, turn) => {
		let guesses = []
		for (let i = 0; i < Math.floor(turn / 2); i++) {
			let guess = String.fromCharCode(parseInt(await zkHangmanContract.guesses(i)) + 97)
			console.log(guess)
			guesses.push(guess)
		}
		setGuesses(guesses)
		setLastValidGuess('')
		console.log(guesses)
	}


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
		setCurrentStep(0)

		let tx = await zkHangmanContract.playerGuess(toHex(guessNumba));
		setCurrentStep(1)

		setDialogMessage("Waiting for transaction to finalize...");
		console.log("Waiting for transaction to finalize...");

		await tx.wait()
		setCurrentStep(2)

		zkHangmanContract.on("NextTurn", async (nextTurn) => {
			connectContract()
		});

	}


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

			await refreshRevealedChars(zkHangmanContract, totalChars)

			await refreshGuesses(zkHangmanContract, turn)

			setContractConnected(true);

			if (turn > 0 && turn % 2 == 0) {
				onOpen()
				setCurrentStep(2)
			}

			if (turn > 0 && turn % 2 == 1) {
				onClose()
				setLastValidGuess(null)
			}

			if (playerLives == 0) {
				onOpen()
				setGameWin(false)
				setGameOver(true)
			}

			if (playerLives > 0 && correctGuesses == totalChars) {
				onOpen()
				setGameWin(true)
				setGameOver(true)
			}


		} catch (error) {
			setError(error);
		}

	}

	const playNewGame = () => {
		router.push('/')
	}

	const errors = 0;
	const [openModal, setOpenModal] = useState(false);
	const [guessedLetter, setGuessedLetter] = useState("");

	const handleKeyDown = (e) => {
		setOpenModal(!openModal);
		if (isValidChar(e.key)) {
			setLastValidGuess(e.key)
		}
		if (e.key == 'Enter') {
			submitGuess({ guess: lastValidGuess })
		}
	};

	return (
		<>
			<Head>
				<title> zkHangman - {gameAddress} </title>
			</Head>
			<TopNav></TopNav>
			<Center
				overflow="hidden"
				height={"95vh"}
				alignItems="center"
				backgroundColor="whitesmoke"
			>
				<VStack>
					<Heading marginBottom={10}>Make your guess!</Heading>

					<HStack>
						<Heading as='h3' size='lg'>Your Guesses: </Heading>
						<PinInput autoFocus type="alphanumeric"
							marginBottom={10}
							isReadOnly
							// placeholder="hello"
							// isDisabled
							value={guesses.join('')}
						>
							{guesses.map((item, index) => (

								<PinInputField
									ringColor={"purple.500"}
									borderWidth={2}
									boxSize={"20"}
									key={index}
								/>
							))}
						</PinInput>

						<PinInput autoFocus type="alphanumeric"
							marginBottom={10}
						>
							{[1].map((item, index) => (
								<PinInputField
									onKeyDown={(e) => {
										handleKeyDown(e);
									}}
									ringColor={"red"}
									borderWidth={5}
									boxSize={"20"}
									key={index}
								/>
							))}
						</PinInput>

					</HStack>

					<Figure playerLives={playerLives} />
					<HStack style={{ marginTop: 60 }}>

						<PinInput autoFocus type="alphanumeric"
							isReadOnly
							// placeholder="hello"
							// isDisabled
							value={revealedChars.join('')}
						>
							{[...Array(totalChars)].map((item, index) => (

								<PinInputField
									onKeyDown={(e) => {
										handleKeyDown(e);
									}}
									ringColor={"purple.500"}
									borderWidth={2}
									boxSize={"20"}
									key={index}
								/>
							))}

						</PinInput>

					</HStack>
				</VStack>
			</Center>

			<AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
				<AlertDialogOverlay>

					<AlertDialogContent>
						{
							gameOver && gameWin && (
								<AlertDialogHeader fontSize='lg' fontWeight='bold'>
									Congratulations! You Won!
								</AlertDialogHeader>

							)
						}

						{
							gameOver && !gameWin && (
								<AlertDialogHeader fontSize='lg' fontWeight='bold'>
									Sorry! You Lost!
								</AlertDialogHeader>
							)
						}

						<AlertDialogBody align="center" py={10}>
							{!gameOver && (
								<GuessStepper currentStep={currentStep} />
							)}

							{
								gameOver && gameWin && (
									<>
										<AlertDialogHeader fontSize='lg' fontWeight='bold'>
											Congratulations! You Won!
										</AlertDialogHeader>
										<Confetti height={250} width={460}></Confetti>
									</>
								)
							}


							{/* <Text mb={7}> {dialogMessage} </Text>
							<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" /> */}
						</AlertDialogBody>


						{
							gameOver && (
								<AlertDialogFooter>
									<Button ref={cancelRef} onClick={playNewGame}>
										Play New Game
									</Button>
								</AlertDialogFooter>
							)
						}

					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

		</>
	)
}

export default GamePage
