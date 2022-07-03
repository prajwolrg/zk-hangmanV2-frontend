// Contract Names
const ZK_HANGMAN_FACTORY_ADDRESS = "ZK_HANGMAN_FACTORY"
const INIT_VERIFIER_ADDRESS = "INIT_VERIFIER"
const GUESS_VERIFIER_ADDRESS = "GUESS_VERIFIER"

//  Network Names
const HARMONY_MAINNET = "HARMONY_MAINNET"
const HARMONY_DEVNET = "HARMONY_DEVNET"
const HARMONY_TESTNET = "HARMONY_TESTNET"
const LOCAL_HARDHAT = "LOCAL_HARDHAT"

export const SUPPORTED_NETWORKS = [
    // HARMONY_MAINNET,
    HARMONY_DEVNET,
    // HARMONY_TESTNET
]

export const toHex = (num) => {
    const val = BigInt(num);
    return "0x" + val.toString(16);
}

const harmonyDevnetParams = {
    chainId: toHex(1666900000),
    rpcUrls: ["https://api.s0.ps.hmny.io"],
    chainName: "Harmony Devnet",
    nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
    blockExplorerUrls: ["https://explorer.ps.hmny.io/"],
    iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"]
}


const harmonyTestnetParams = {
    chainId: toHex(1666700000),
    rpcUrls: ["https://api.s0.b.hmny.io"],
    chainName: "Harmony Testnet",
    nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
    blockExplorerUrls: ["https://explorer.pops.one/"],
    iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"]
}

const harmonyMainnetParams = {
    chainId: toHex(1666600000),
    rpcUrls: ["https://api.harmony.one"],
    chainName: "Harmony Mainnet",
    nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
    blockExplorerUrls: ["https://explorer.harmony.one/"],
    iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"]
}

const hardhatNodeParams = {
    chainId: toHex(31337),
    rpcUrls: ["http://127.0.0.1:8545"],
    chainName: "Hardhat Node",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    blockExplorerUrls: [],
}

export const chainIdToNetworkMapping = {
    // "1": "Ethereum Mainnet",
    // "31337": "Local Hardhat Node",
    // "1666600000": HARMONY_MAINNET,
    // "1666700000": HARMONY_TESTNET,
    "1666900000": HARMONY_DEVNET,
}

export const SUPPORTED_NETWORKS_PARAMS = {
    // HARMONY_MAINNET: harmonyMainnetParams,
    HARMONY_DEVNET: harmonyDevnetParams,
    // HARMONY_TESTNET: harmonyTestnetParams
}

// local hardhat contract addresses
const localZkHangmanFactory = "0x997691EA886836FB59F547E915D5C1b7EE236A17"
const localInitVerifier = "0xCf1aFDe70a43EBe93f4224aa239DD828353Ae1c7"
const localGuessVerifier = "0x1D9317911CF1003B42a965574c29f18a87A2858c"

// harmony testnet contract addresses
const devZkHangmanFactory = "0x86fEa3E8A610653AE01384458E035D3641C40e05"
const devInitVerifier = "0xf5f2Ef303e2c2082681D661A4fb9628035A66533"
const devGuessVerifier = "0x3635c17146D00d8D32DDEc4E3021aA1b3C5EC03b"

// harmony mainnet contract addresses
const mainZkHangmanFactory = null;
const mainInitVerifier = null;
const mainGuessVerifier = null;

export const contractAddreses = {
    // HARMONY_MAINNET: {
    //     ZK_HANGMAN_FACTORY_ADDRESS: mainZkHangmanFactory,
    //     INIT_VERIFIER_ADDRESS: mainInitVerifier,
    //     GUESS_VERIFIER_ADDRESS: mainGuessVerifier,
    //     ZK_HANGMAN_GAME_ADDRESS: null
    // },
    HARMONY_DEVNET: {
        ZK_HANGMAN_FACTORY_ADDRESS: devZkHangmanFactory,
        INIT_VERIFIER_ADDRESS: devInitVerifier,
        GUESS_VERIFIER_ADDRESS: devGuessVerifier,
        ZK_HANGMAN_GAME_ADDRESS: null
    },
}

export const isNetworkSupported = (chainId) => {
    return Object.keys(chainIdToNetworkMapping).includes(chainId)
}