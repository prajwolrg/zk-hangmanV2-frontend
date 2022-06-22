import { ethers } from 'ethers';
import React, { createContext, useContext, useState } from 'react';

const ConnectionContext = createContext()
const ConnectionUpdateContext = createContext()

export function useAccount() {
	return useContext(ConnectionContext)
}

export function useUpdateAccount() {
	return useContext(ConnectionUpdateContext)
}

export function AccountProvider({children}) {
	const [currentConnection, setCurrentConnection] = useState({accountAddress: ethers.constants.AddressZero, isConnected: false, isAdmin: false})

	return (
		<ConnectionContext.Provider value={currentConnection}>
			<ConnectionUpdateContext.Provider value={setCurrentConnection}>
				{children}
			</ConnectionUpdateContext.Provider>
		</ConnectionContext.Provider>
	)
}