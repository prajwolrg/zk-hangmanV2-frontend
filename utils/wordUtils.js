const axios = require('axios').default

export const checkWordValidity = async (word) => {
	const endpoint = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
	console.log(endpoint)
	try {
		const res = await axios.get(endpoint)
		console.log(res.data)
		return [true, res.data[0]]
	} catch (err) {
		console.log(err)
		return [false, err]
	}
}

export const getParsedChars = (word) => {
	const parsedChars = []
	let i = 0;
	for (i; i < word.length; i++) {
		const charAscii = word.charCodeAt(i)
		const parsedChar = charAscii - 97
		parsedChars.push(BigInt(parsedChar))
	}
	for (i; i < 25; i++) {
		parsedChars.push(BigInt(0))
	}
	return parsedChars
}
