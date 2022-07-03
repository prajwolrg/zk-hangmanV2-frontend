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
	HStack,
	Heading
} from "@chakra-ui/react";
import { Formik, Field } from "formik";
import { getGuessProofParams } from "../utils/proofUtils";

import * as yup from 'yup'
import { ethers, wordlists } from "ethers";
import { useContractAddresses } from "../context/ContractContext";
import zkHangmanFactory from "../abis/zkHangmanFactory.json";
import { useConnection } from "../context/ConnectionContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toHex } from "../utils";

import Web3Modal from "web3modal";

import zkHangman from "../abis/zkHangman.json"
import Figure from "./Figure";
import GuessProcessStepper from "./GuessProcessStepper";
const zkHangmanAbi = zkHangman.abi

let schema = yup.object().shape({
	secret: yup.string().required()
});

const providerOptions = {};

let web3Modal;
if (typeof window !== 'undefined') {
	web3Modal = new Web3Modal({
		cacheProvider: true,
		providerOptions
	});
}

export default function ProcessGuess({ turn }) {

	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isSelectOpen, onOpen: onSelectOpen, onClose: onSelectClose } = useDisclosure();
	const [dialogMessage, setDialogMessage] = useState('');
	const { instance, provider, signer, network, chainId, accountAddress } = useConnection()

	const [error, setError] = useState(false)
	const [errorMsg, setErrorMsg] = useState("")

	const [secret, setSecret] = useState(null)

	const [currentStep, setCurrentStep] = useState(0)

	const router = useRouter();
	const { gameAddress } = router.query;
	const gameContract = gameAddress;

	useEffect(() => {
		try {
			let _secret = localStorage.getItem(gameAddress)
			console.log(`Stored secret for ${gameAddress}: ${_secret}`)
			setSecret(_secret)
		} catch (err) {
			console.log(err)
		}
	}, [])

	const processGuessFromFormik = async ({secret}) => {
		const _secret = ethers.BigNumber.from(ethers.utils.id(secret))
		processGuess(_secret)
	}

	const processGuessFromLocalStorage = async () => {
		const _secret = secret;
		processGuess(_secret)
	}

	const processGuess = async (secret) => {

		setError(false)
		setErrorMsg("")
		setCurrentStep(0)
		console.log("secret: ", secret);

		// setDialogMessage("Generating proof...");
		// console.log("Generating proof...");
		onOpen();

		const zkHangmanContract = new ethers.Contract(
			gameContract,
			zkHangmanAbi,
			signer
		)

		let hexLatestGuess = await zkHangmanContract.guesses(Math.floor((turn - 1) / 2));
		let hexSecretHash = await zkHangmanContract.secretHash()

		console.log("turn: ", turn);
		console.log("index: ", Math.floor((turn - 1) / 2));
		console.log("hex latest guess: ", hexLatestGuess._hex);

		console.log(parseInt(hexLatestGuess))

		let inputObject = {
			char: BigInt(parseInt(hexLatestGuess._hex)),
			secret: BigInt(secret)
		}

		// console.log(inputObject);

		const { _a, _b, _c, _input } = await getGuessProofParams(inputObject)

		console.log(`Secret Hash Stored: ${BigInt(hexSecretHash)}`)
		console.log(`Secret Hash Generated: ${BigInt(_input[0])}`)
		if (BigInt(hexSecretHash) == BigInt(_input[0])) {
			setCurrentStep(1)
			setDialogMessage("Awaiting transaction confirmation...");
			console.log("Awaiting transaction confirmation...");

			try {
				let tx = await zkHangmanContract.processGuess(_a, _b, _c, _input);
				setCurrentStep(2)

				setDialogMessage("Waiting for transaction to finalize...");
				console.log("Waiting for transaction to finalize...");

				console.log(tx);

				let txFinalized = await tx.wait();

				onClose();

				console.log(txFinalized);
			} catch (err) {
				setError(true)
				console.log(err)
				setErrorMsg("User denied transaction signature")
			}
		}
		else {
			setError(true)
			setErrorMsg("Use the same secret used to create the game!")
		}
	}


	return (
		<> {
			!secret && (
				<Formik
					initialValues={{
						secret: "",
					}}
					onSubmit={(values) => {
						processGuessFromFormik(values)
					}}
					validationSchema={schema}
				>
					{({ handleSubmit, errors, touched }) => (
						<form onSubmit={handleSubmit}>
							<VStack spacing={4} align="flex-start">

								<FormControl isInvalid={!!errors.secret && touched.secret}>
									<FormLabel>Secret</FormLabel>
									<Field
										as={Input}
										id="secret"
										name="secret"
										type="text"
										variant="filled"
									/>
									<FormErrorMessage>{errors.secret}</FormErrorMessage>
								</FormControl>

								<Button type="submit" colorScheme="blue" width="full">
									Process Guess
								</Button>
							</VStack>
						</form>
					)}
				</Formik>
			)
		}

		<Button colorScheme={"blue"} onClick={processGuessFromLocalStorage}>Process Guess</Button>

			<AlertDialog isOpen={isOpen} onClose={onClose}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogBody align="center" py={10}>
							<GuessProcessStepper currentStep={currentStep} error={error} errorMsg={errorMsg} />
							{/* <Text mb={7}> {dialogMessage} </Text>
							<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" /> */}
						</AlertDialogBody>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>

	);
}