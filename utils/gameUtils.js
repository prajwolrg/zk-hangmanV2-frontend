import { ethers } from "ethers"
import zkHangman from "../abis/zkHangman.json"
const zkHangmanAbi = zkHangman.abi

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
	return revealedChars
}

const refreshGuesses = async (zkHangmanContract, turn) => {
	let guesses = []
	for (let i = 0; i < Math.floor(turn / 2); i++) {
		let guess = String.fromCharCode(parseInt(await zkHangmanContract.guesses(i)) + 97)
		console.log(guess)
		guesses.push(guess)
	}
	return guesses
}

export const getGameStatus = async (gameContractAddress, signer) => {
	console.log('Getting contract data')
	console.log(gameContractAddress, zkHangmanAbi, signer)
	try {
		const zkHangmanContract = new ethers.Contract(
			gameContractAddress,
			zkHangmanAbi,
			signer
		);

		let host = await zkHangmanContract.host();
		console.log("host:", host)

		let player = await zkHangmanContract.player();
		console.log("player:", player)

		let totalChars = parseInt(await zkHangmanContract.totalChars(), 16)
		console.log("total chars: ", totalChars);

		let playerLives = parseInt(await zkHangmanContract.playerLives(), 16);
		console.log("player Lives: ", playerLives);

		let correctGuesses = parseInt(await zkHangmanContract.correctGuesses(), 16);
		console.log("correct guesses: ", correctGuesses);

		let turn = parseInt((await zkHangmanContract.turn())._hex, 16);
		console.log("turn", turn)

		let revealedChars = await refreshRevealedChars(zkHangmanContract, totalChars)

		let guesses = await refreshGuesses(zkHangmanContract, turn)

		return {
			host,
			player,
			totalChars,
			playerLives,
			correctGuesses,
			turn,
			revealedChars,
			guesses
		}


	} catch (error) {
		console.error(error);
	}

}
