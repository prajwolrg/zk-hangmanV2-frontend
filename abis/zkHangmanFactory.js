export const zkHangmanFactoryAbi = [
  {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "host",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "gameAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "initVerifier",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "guessVerifier",
                "type": "address"
            }
        ],
        "name": "GameCreated",
        "type": "event"
    },
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
        "name": "createGame",
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
        "name": "games",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];