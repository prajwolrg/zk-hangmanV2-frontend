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
	Text
} from "@chakra-ui/react";

import * as yup from 'yup'
import { ethers, wordlists } from "ethers";
import { useContractAddresses } from "../context/ContractContext";
import zkHangmanFactory from "../abis/zkHangmanFactory.json";
import { useConnection } from "../context/ConnectionContext";
import { useState } from "react";
import { useRouter } from "next/router";
import { toHex } from "../utils";

import zkHangman from "../abis/zkHangman.json"
const zkHangmanAbi = zkHangman.abi

const snarkjs = require("snarkjs");
const axios = require('axios').default

let schema = yup.object().shape({
	guess: yup.string().required().length(1),
});

export default function SubmitGuess() {

	const [dialogMessage, setDialogMessage] = useState();
	const { instance, provider, signer, network, chainId, accountAddress } = useConnection()

	const { isOpen, onOpen, onClose } = useDisclosure();

	const router = useRouter();
	const { gameAddress } = router.query;
	const gameContract = gameAddress;

	const submitGuess = async ({ guess }) => {
		const zkHangmanContract = new ethers.Contract(
			gameContract,
			zkHangmanAbi,
			signer
		);

		let guessNumba = guess.trim().toLowerCase().charCodeAt(0) - 96;

		console.log(`sending the number ${guessNumba} to the contract`);
		console.log("the guess from this number was: ", guess);

		onOpen();

		setDialogMessage("Awaiting transaction confirmation...");
		console.log("Awaiting transaction confirmation...");

		let tx = await zkHangmanContract.playerGuess(toHex(guessNumba));

		setDialogMessage("Waiting for transaction to finalize...");
		console.log("Waiting for transaction to finalize...");

		await tx.wait()

		onClose();

	}

	return (
		<Box bg="white" p={6} rounded="md" w={460}>
			<Formik
				initialValues={{
					guess: "",
				}}
				onSubmit={(values) => {
					submitGuess(values)
				}}
				validationSchema={schema}
			>
				{({ handleSubmit, errors, touched }) => (
					<form onSubmit={handleSubmit}>
						<VStack spacing={4} align="flex-start">

							<FormControl isInvalid={!!errors.guess && touched.guess}>
								<FormLabel>Guess</FormLabel>
								<Field
									as={Input}
									id="guess"
									name="guess"
									type="text"
									variant="filled"
								/>
								<FormErrorMessage>{errors.guess}</FormErrorMessage>
							</FormControl>

							<Button type="submit" colorScheme="purple" width="full">
								Submit Guess
							</Button>
						</VStack>
					</form>
				)}

			</Formik>

		</Box>
	);
}