
import Head from "next/head";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toHex, harmonyTestnetParams, harmonyMainnetParams, hardhatNodeParams } from "../utils";
import {
	HStack,
	VStack,
	Heading,
	Button,
	useDisclosure,
} from "@chakra-ui/react"

const providerOptions = {};

let web3Modal;
if (typeof window !== 'undefined') {
	web3Modal = new Web3Modal({
		cacheProvider: true,
		providerOptions
	});
}

function TopNav() {
	const [instance, setInstance] = useState();
	const [provider, setProvider] = useState();
	const [account, setAccount] = useState();
	const [chainId, setChainId] = useState();

	useEffect(() => {
		if (instance?.on) {
			const handleAccountsChanged = (accounts) => {
				console.log("accounts changed", accounts);
				if (accounts) setAccount(accounts[0]);
			};

			const handleDisconnect = () => {
				console.log("disconnect", error);
				disconnect();
			}

			const handleChainChanged = (hexChainId) => {
				console.log("chain changed to: ", parseInt(hexChainId, 16))
				setChainId(parseInt(hexChainId, 16));
			};

			instance.on("accountsChanged", handleAccountsChanged);
			instance.on("chainChanged", handleChainChanged);
			instance.on("disconnect", handleDisconnect);

			return () => {
				if (instance.removeListener) {
					instance.removeListener("accountsChanged", handleAccountsChanged);
					instance.removeListener("chainChanged", handleChainChanged);
					instance.removeListener("disconnect", handleDisconnect);
				}
			}
		}
	}, [instance])

	useEffect(() => {
		if (web3Modal.cachedProvider) {
			connectWallet();
		}
	}, [])

	useEffect(() => {
		console.log(error);
	})

	const connectWallet = async () => {
		try {
			const instance = await web3Modal.connect()
			const provider = new ethers.providers.Web3Provider(instance);
			const signer = provider.getSigner();
			const accounts = await provider.listAccounts();
			const network = await provider.getNetwork();
			setInstance(instance);
			setProvider(provider);
			setSigner(signer);
			setNetwork(network);
			setChainId(network.chainId);
			if (accounts) setAccount(accounts[0]);
		} catch (error) {
			setError(error);
		}
	}

	const disconnect = async () => {
		await web3Modal.clearCachedProvider();
		setAccount();
		setChainId();
		setNetwork("");

	}

	const handleNetwork = (e) => {
		setChainId(Number(e.target.value));
	}

	const switchNetwork = async (network) => {
		console.log(`Trying to switch network to: ${network}`)
		if (network == 'testnet') {
			console.log('testnet')
			try {
				await provider.provider.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: toHex(1666700000) }]
				});
			} catch (switchError) {
				if (switchError.code === 4902) {
					try {
						await provider.provider.request({
							method: "wallet_addEthereumChain",
							params: [harmonyTestnetParams]
						});
					} catch (error) {
						setError(error);
					}
				}
			}
		} else if (network == 'mainnet') { // mainnet 
			console.log('mainnet')
			try {
				await provider.provider.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: toHex(1666600000) }]
				});
			} catch (switchError) {
				if (switchError.code === 4902) {
					try {
						await provider.provider.request({
							method: "wallet_addEthereumChain",
							params: [harmonyMainnetParams]
						});
					} catch (error) {
						setError(error);
					}
				}
			}
		} else if (network == 'localhost' || network == 'hardhat') {
			console.log('localhost')
			try {
				await provider.provider.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: toHex(31337) }]
				});
			} catch (switchError) {
				console.log(switchError)
				if (switchError.code === 4902) {
					try {
						await provider.provider.request({
							method: "wallet_addEthereumChain",
							params: [hardhatNodeParams]
						});
					} catch (error) {
						setError(error);
					}
				}
			}
		}
		onSelectClose();
	};

	return (
		<div>

			<div>

				{
					(chainId == 31337 && account) ? (
						<Button onClick={() => switchNetwork('mainnet')}> Switch to mainnet </Button>
					) : (chainId == 1666600000 && account) ? (
						<Button onClick={() => switchNetwork('testnet')}> Switch to testnet </Button>
					) : (chainId == 1666600000 && account) ? (
						<Button onClick={() => switchNetwork('mainnet')}> Switch to testnet </Button>
					) : <Button onClick={() => { connectWallet(); onSelectOpen(); }}> Connect to Harmony </Button>
				}
			</div>

			<div>
				{(chainId == 1666700000 && account) ? (
					<h2> You're connected to the Harmony testnet </h2>
				) : (chainId == 1666600000 && account) ? (
					<h2> You're connected to the Harmony mainnet </h2>
				) : (chainId == 31337 && account) ? (
					<h2> You're connected to the Hardhat testnet </h2>
				) : <h2> Please connect to Harmony </h2>
				}
			</div>

			<div>
				{account ? (
					<h2> Account {account} </h2>
				) : (
					<h2> Account: account not connected </h2>
				)}
			</div>
		</div>
	)
}

export default TopNav