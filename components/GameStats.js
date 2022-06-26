
import {
	VStack,
	useDisclosure,
	Text,
	HStack,
	Heading
} from "@chakra-ui/react";

import * as yup from 'yup'
import { useConnection } from "../context/ConnectionContext";
import { useEffect, useState } from "react";

import Web3Modal from "web3modal";

import zkHangman from "../abis/zkHangman.json"
import Figure from "./Figure";
const zkHangmanAbi = zkHangman.abi

const snarkjs = require("snarkjs");
const axios = require('axios').default

let schema = yup.object().shape({
	guess: yup.string().required().length(1),
});

const providerOptions = {};

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
  });
}

export default function GameStats({playerLives, correctGuesses, turn}) {
	const [dialogMessage, setDialogMessage] = useState();
	const { instance, provider, signer, network, chainId, accountAddress } = useConnection()

	const { isOpen, onOpen, onClose } = useDisclosure();
  const [error, setError] = useState();

	// const router = useRouter();
	// const { gameAddress } = router.query;
	// const gameContract = gameAddress;


	return (
		<>

			<HStack width={500} justify="space-evenly" py="15px">

				<VStack>
					<Heading size="md"> Correct Guesses </Heading>
					<Text> {correctGuesses} </Text>
				</VStack>


				<VStack>
					<Heading size="md"> Player lives </Heading>
					<Text> {playerLives} </Text>
				</VStack>


				<VStack>
					<Heading size="md"> Turn number</Heading>
					<Text> {turn} </Text>
				</VStack>

				<VStack>
					<Figure errors={6 - playerLives}></Figure>
				</VStack>

			</HStack>

			{/* <VStack width={500}>
				{turn == 0 ? <Heading size="lg"> Waiting for host to choose a word and initialize game </Heading>
					: (turn % 2 == 1 && accountAddress != playerAddress) ? <Heading size="lg"> Player's turn! </Heading> :
						(turn % 2 == 0 && accountAddress != hostAddress) ? <Heading size="lg"> Host's turn! </Heading> : <> </>}
			</VStack> */}
		</>

	);
}