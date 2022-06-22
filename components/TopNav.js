import {
	Box,
	Flex,
	Button,
	Stack,
	useColorModeValue,
	useDisclosure,
	Heading,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
} from '@chakra-ui/react';
import {
	ChevronDownIcon,
} from '@chakra-ui/icons';

import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
// import { zkHangmanFactoryAbi } from "../abis/zkHangmanFactory";

import { toHex, harmonyTestnetParams, harmonyMainnetParams, hardhatNodeParams, chainIdToNetworkMapping } from "../utils";

const providerOptions = {};
let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
  });
}

export default function TopNav() {

  const [error, setError] = useState();
  const [dialogMessage, setDialogMessage] = useState();
  const [instance, setInstance] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [chainId, setChainId] = useState();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSelectOpen, onOpen: onSelectOpen, onClose: onSelectClose } = useDisclosure();

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
    if (network == 'devnet') {
      console.log('devnet')
      try {
        await provider.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: toHex(1666900000) }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await provider.provider.request({
              method: "wallet_addEthereumChain",
              params: [harmonydevnetParams]
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
		<Box>
			<Flex
				bg={useColorModeValue('white', 'gray.800')}
				color={useColorModeValue('gray.600', 'white')}
				minH={'60px'}
				py={{ base: 2 }}
				px={{ base: 4 }}
				borderBottom={1}
				borderStyle={'solid'}
				borderColor={useColorModeValue('gray.200', 'gray.900')}
				align={'center'}>
				<Flex
					flex={{ base: 1, md: 'auto' }}
					ml={{ base: -2 }}
					display={{ base: 'flex', md: 'none' }}>
				</Flex>
				<Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
					<Heading>
						zkHangman
					</Heading>
					<Flex display={{ base: 'none', md: 'flex' }} ml={10}>
					</Flex>
				</Flex>

				<Stack
					flex={{ base: 1, md: 0 }}
					justify={'flex-end'}
					direction={'row'}
					spacing={6}>
					<Menu>
						<MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
						{chainIdToNetworkMapping[String(chainId)]?chainIdToNetworkMapping[String(chainId)]:'Unsupported Network'}
						</MenuButton>
						<MenuList>
							<MenuItem onClick={()=>{switchNetwork('mainnet')}}>Harmony Mainnet</MenuItem>
							<MenuItem onClick={()=>{switchNetwork('testnet')}}>Harmony Testnet</MenuItem>
							<MenuItem onClick={()=>{switchNetwork('devnet')}}>Harmony Devnet</MenuItem>
							<MenuItem>Local Testnet</MenuItem>
						</MenuList>
					</Menu>
					<Button
						onClick={connectWallet}
						fontWeight={600} >
					{account ? account : 'Connect Wallet'}
					</Button>
				</Stack>
			</Flex>
		</Box>
	);
}
