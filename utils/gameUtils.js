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

		let _host = await zkHangmanContract.host();
		console.log("host:", _host)

		let _player = await zkHangmanContract.player();
		console.log("player:", _player)

		let _totalChars = parseInt(await zkHangmanContract.totalChars())
		console.log("total chars: ", _totalChars);

		let _playerLives = parseInt(await zkHangmanContract.playerLives());
		console.log("player Lives: ", _playerLives);

		let _correctGuesses = parseInt(await zkHangmanContract.correctGuesses());
		console.log("correct guesses: ", _correctGuesses);

		let _turn = parseInt((await zkHangmanContract.turn())._hex);
		console.log("turn", _turn)

		let _revealedChars = await refreshRevealedChars(zkHangmanContract, _totalChars)

		let _guesses = await refreshGuesses(zkHangmanContract, _turn)

		return {
			_host,
			_player,
			_totalChars,
			_playerLives,
			_correctGuesses,
			_turn,
			_revealedChars,
			_guesses
		}


	} catch (error) {
		console.error(error);
	}

}
