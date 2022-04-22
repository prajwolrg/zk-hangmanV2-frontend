export const zkHangmanAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_host",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_player",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_initVerifier",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_guessVerifier",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "nextTurn",
                "type": "uint256"
            }
        ],
        "name": "NextTurn",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "characterHashes",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "correctGuesses",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "gameOver",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "guessVerifier",
        "outputs": [
            {
                "internalType": "contract GuessVerifier",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "guesses",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "host",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "initVerifier",
        "outputs": [
            {
                "internalType": "contract InitVerifier",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[2]",
                "name": "_a",
                "type": "uint256[2]"
            },
            {
                "internalType": "uint256[2][2]",
                "name": "_b",
                "type": "uint256[2][2]"
            },
            {
                "internalType": "uint256[2]",
                "name": "_c",
                "type": "uint256[2]"
            },
            {
                "internalType": "uint256[6]",
                "name": "_input",
                "type": "uint256[6]"
            }
        ],
        "name": "initializeGame",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "player",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_guess",
                "type": "uint256"
            }
        ],
        "name": "playerGuess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "playerLives",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[2]",
                "name": "_a",
                "type": "uint256[2]"
            },
            {
                "internalType": "uint256[2][2]",
                "name": "_b",
                "type": "uint256[2][2]"
            },
            {
                "internalType": "uint256[2]",
                "name": "_c",
                "type": "uint256[2]"
            },
            {
                "internalType": "uint256[3]",
                "name": "_input",
                "type": "uint256[3]"
            }
        ],
        "name": "processGuess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "revealedChars",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "secretHash",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "turn",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
