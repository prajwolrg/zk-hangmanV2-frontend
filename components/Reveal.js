import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogOverlay, Button, useDisclosure } from "@chakra-ui/react";
import { ethers } from "ethers";
import { isAssetError } from "next/dist/client/route-loader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useConnection } from "../context/ConnectionContext";
import { getGuessProofParams, getInitProofParams } from "../utils/proofUtils";
import { getParsedChar } from "../utils/wordUtils";
import RevealStepper from "./RevealStepper";

import zkHangman from "../abis/zkHangman.json"
const zkHangmanAbi = zkHangman.abi

const Reveal = ({ revealedChars }) => {
	const [gameAddress, setGameAddress] = useState(null)
	const [word, setWord] = useState(null)
	const [secret, setSecret] = useState(null)
	const [currentStep, setCurrentStep] = useState(-1)
	const [currentLetter, setCurrentLetter] = useState("")

	const { instance, provider, signer, network, chainId, accountAddress } = useConnection()
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [error, setError] = useState(false)
	const [errorMsg, setErrorMsg] = useState("")

	const router = useRouter()

	useEffect(() => {
		if (router.query) {
			const gameAddress = router.query.gameAddress
			if (gameAddress) {
				setGameAddress(gameAddress)
			}
		}

		try {
			let _word = localStorage.getItem(`${gameAddress}_word`)
			let _secret = localStorage.getItem(`${gameAddress}_secret`)
			console.log(_word)
			console.log(_secret)
			setWord(_word)
			setSecret(_secret)
		} catch (err) {
			console.error(err)
		}
	}, [])

	const getLettersToReveal = (revealedChars) => {
		if (revealedChars.length != word.length) {
			throw ("Revealed letters must be equal to word length")
		}
		let toReveal = []
		for (let i = 0; i < revealedChars.length; i++) {
			if (revealedChars[i] == '?' || revealedChars[i] != word[i]) {
				toReveal.push(word[i])
			}
		}
		console.log(toReveal)
		return toReveal;
	}

	const generateProof = async (char) => {
		let inputObject = {
			secret: BigInt(secret),
			char: BigInt(getParsedChar(char)),
		};

		const {_a, _b, _c, _input} = await getGuessProofParams(inputObject)

		return {_a, _b, _c, _input}
	}

	const revealLetters = async () => {
		console.log(revealedChars)
		// console.log(gameAddress)

		if (gameAddress) {
			// console.log(word)
			const chars = getLettersToReveal(revealedChars)
			const proofs = []

			onOpen()
			setCurrentStep(0)
			for (let i = 0; i < chars.length; i++) {
				setCurrentLetter(chars[i].toUpperCase())
				const {_a, _b, _c, _input} = await generateProof(chars[i])
				proofs.push({_a, _b, _c, _input})
			}
			setCurrentStep(1)

			const zkHangmanContract = new ethers.Contract(
				gameAddress,
				zkHangmanAbi,
				signer
			)

			try {
				console.log(proofs)
				let tx = await zkHangmanContract.reveal(proofs)
				setCurrentStep(2)
				let txRecipt = await tx.wait()
				setCurrentStep(3)
			} catch (err) {
				console.error(err)
			}

		}
	}

	return (
		<>
		<Button onClick={revealLetters}>Reveal Letters</Button>

			<AlertDialog isOpen={isOpen} onClose={onClose} closeOnOverlayClick={error || currentStep >= 1}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogBody align="center" py={10}>
							<RevealStepper currentStep={currentStep} currentLetter={currentLetter} error={error} errorMsg={errorMsg} />
							{/* <Text mb={7}> {dialogMessage} </Text>
							<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" /> */}
						</AlertDialogBody>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>



	);
}

export default Reveal;