import { ethers } from 'ethers';
import React, { createContext, useContext, useState } from 'react';

// Contract Names
const ZK_HANGMAN_FACTORY_ADDRESS = "ZK_HANGMAN_FACTORY"
const INIT_VERIFIER_ADDRESS = "INIT_VERIFIER"
const GUESS_VERIFIER_ADDRESS = "GUESS_VERIFIER"

const ContractContext = createContext()
const ContractUpdateContext = createContext()

export function useContractAddresses() {
	return useContext(ContractContext)
}

export function useUpdateContractAddresses() {
	return useContext(ContractUpdateContext)
}

export function ConnectionProvider({children}) {
	const [contractAddresses, setContractAddresses] = useState({ZK_HANGMAN_FACTORY_ADDRESS: null, INIT_VERIFIER_ADDRESS: null, GUESS_VERIFIER_ADDRESS: null})

	return (
		<ContractContext.Provider value={contractAddresses}>
			<ContractUpdateContext.Provider value={setContractAddresses}>
				{children}
			</ContractUpdateContext.Provider>
		</ContractContext.Provider>
	)
}