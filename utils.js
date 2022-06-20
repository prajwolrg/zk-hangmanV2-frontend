export const toHex = (num) => {
  const val = BigInt(num);
  return "0x" + val.toString(16);
}

export const harmonyTestnetParams = {
    chainId: toHex(1666700000),
    rpcUrls: ["https://api.s0.b.hmny.io"],
    chainName: "Harmony Testnet",
    nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
    blockExplorerUrls: ["https://explorer.pops.one/"],
    iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"]
}

export const harmonyMainnetParams = {
    chainId: toHex(1666600000),
    rpcUrls: ["https://api.harmony.one"],
    chainName: "Harmony Mainnet",
    nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
    blockExplorerUrls: ["https://explorer.harmony.one/"],
    iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"]
}

export const hardhatNodeParams = {
    chainId: toHex(31337),
    rpcUrls: ["http://127.0.0.1:8545"],
    chainName: "Hardhat Node",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    blockExplorerUrls: [],
}
