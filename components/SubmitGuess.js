import { Formik, Field } from "formik";
import {
	Box,
	Button,
	Checkbox,
	Flex,
	FormControl,
	FormLabel,
	FormErrorMessage,
	Input,
	VStack,
	useDisclosure,
	useShortcut,
	AlertDialog,
	AlertDialogOverlay,
	AlertDialogContent,
	AlertDialogBody,
	Spinner,
	Text,
	Tooltip
} from "@chakra-ui/react";

import * as yup from 'yup'
import { ethers, wordlists } from "ethers";
import { useContractAddresses } from "../context/ContractContext";
import zkHangmanFactory from "../abis/zkHangmanFactory.json";
import { useConnection } from "../context/ConnectionContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toHex } from "../utils";

import zkHangman from "../abis/zkHangman.json"
import GuessStepper from "./GuessStepper";
const zkHangmanAbi = zkHangman.abi

const snarkjs = require("snarkjs");
const axios = require('axios').default

let schema = yup.object().shape({
	guess: yup.string().required().length(1),
});

export default function SubmitGuess({ guess, turn, playerLives, correctGuesses }) {

	const [dialogMessage, setDialogMessage] = useState();
	const { instance, provider, signer, network, chainId, accountAddress } = useConnection()

	const [_playerLives, setPlayerLives] = useState(6)
	const [_correctGuesses, setCorrectGuesses] = useState(0)

	const [_guess, setGuess] = useState("")
	const [rightGuess, setRightGuess] = useState(false)
	const [wrongGuess, setWrongGuess] = useState(false)

	const [error, setError] = useState(false)
	const [errorMsg, setErrorMsg] = useState("")

	const [currentStep, setCurrentStep] = useState(-1)

	const { isOpen, onOpen, onClose } = useDisclosure();

	const router = useRouter();
	const { gameAddress } = router.query;
	const gameContract = gameAddress;

	useEffect(() => {
		if (playerLives < _playerLives) {
			setPlayerLives(playerLives);
			console.log(`Your guess was: ${guess} && wrong`)
			setWrongGuess(true)
			setRightGuess(false)
			setGuess(guess)
		}
		if (correctGuesses > _correctGuesses) {
			setCorrectGuesses(correctGuesses)
			console.log(`Your guess was: ${guess} && right`)
			setWrongGuess(false)
			setRightGuess(true)
			setGuess(guess)
		}
		setCurrentStep(3)

	}, [playerLives, correctGuesses, guess])

	// console.log(`${guess} is selected for submission`)

	const submitGuess = async () => {
		setError(false)
		setErrorMsg("")
		setCurrentStep(0)

		onOpen();

		console.log('Calling submit guess with ', guess)
		const zkHangmanContract = new ethers.Contract(
			gameContract,
			zkHangmanAbi,
			signer
		);

		let guessNumba = guess.trim().toLowerCase().charCodeAt(0) - 96;

		let tx
		try {
			tx = await zkHangmanContract.playerGuess(toHex(guessNumba));
			setCurrentStep(1)
			await tx.wait()
			setCurrentStep(2)

		} catch (err) {
			setError(true)
			setErrorMsg(err.message)
			if (err.code == "TRANSACTION_REPLACED" && err.cancelled == false) {
				setError(false)
				setCurrentStep(2);
			}
		}
	}

	return (
		<>
			<Tooltip
				label={turn % 2 == 0 ? "It is host's turn to process the guess" : guess.length < 1 ? "Select a letter to make a guess" : ""}
				shouldWrapChildren>
				<Button
					colorScheme="blue"
					onClick={submitGuess}
					isLoading={!error && currentStep >= 0 && currentStep < 2}
					loadingText={"Submitting Guess"}
					disabled={guess.length < 1 || turn % 2 == 0}
				>
					Submit Guess
				</Button>
			</Tooltip>

			<AlertDialog isOpen={isOpen} onClose={onClose} closeOnOverlayClick={error || currentStep >= 2}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogBody align="center" py={10}>
							<GuessStepper currentStep={currentStep} error={error} errorMsg={errorMsg} guess={_guess} right={rightGuess} wrong={wrongGuess} />
							{/* <Text mb={7}> {dialogMessage} </Text>
							<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" /> */}
						</AlertDialogBody>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

		</>
	);
}