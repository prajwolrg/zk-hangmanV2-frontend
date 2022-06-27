import { ethers } from 'ethers';
import React, { createContext, useContext, useState } from 'react';

const ConnectionContext = createContext()
const ConnectionUpdateContext = createContext()

export function useConnection() {
	return useContext(ConnectionContext)
}

export function useUpdateConnection() {
	return useContext(ConnectionUpdateContext)
}

export function ConnectionProvider({children}) {
	const [currentConnection, setCurrentConnection] = useState({instance: null, provider: null, signer: null, network: null, chainId: null, accountAddress: null, isNetworkSupported: false})

	return (
		<ConnectionContext.Provider value={currentConnection}>
			<ConnectionUpdateContext.Provider value={setCurrentConnection}>
				{children}
			</ConnectionUpdateContext.Provider>
		</ConnectionContext.Provider>
	)
}