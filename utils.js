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