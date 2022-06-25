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

import { chainIdToNetworkMapping, contractAddreses, SUPPORTED_NETWORKS, SUPPORTED_NETWORKS_PARAMS } from "../utils";

import { useConnection, useUpdateConnection } from '../context/ConnectionContext';
import { useUpdateContractAddresses } from '../context/ContractContext';

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

  const { instance, provider, signer, network, chainId, accountAddress } = useConnection()
  const updateConnection = useUpdateConnection()
  const updateContractAddresses = useUpdateContractAddresses()

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSelectOpen, onOpen: onSelectOpen, onClose: onSelectClose } = useDisclosure();

  useEffect(() => {
    if (instance?.on) {
      const handleAccountsChanged = (accounts) => {
        connectWallet()
      };

      // const handleDisconnect = () => {
      //   // console.log("disconnect", error);
      //   disconnect();
      // }

      const handleChainChanged = (hexChainId) => {
        // updateConnection({ ...useConnection, chainId: parseInt(hexChainId, 16) })
        connectWallet()
        // console.log("chain changed to: ", parseInt(hexChainId, 16))
        // setChainId(parseInt(hexChainId, 16));
      };

      instance.on("accountsChanged", handleAccountsChanged);
      instance.on("chainChanged", handleChainChanged);
      // instance.on("disconnect", handleDisconnect);

      return () => {
        if (instance.removeListener) {
          instance.removeListener("accountsChanged", handleAccountsChanged);
          instance.removeListener("chainChanged", handleChainChanged);
          // instance.removeListener("disconnect", handleDisconnect);
        }
      }
    }
  }, [instance])

  // // This is used when the provider has already been selected previously
  // useEffect(() => {
  //   if (web3Modal.cachedProvider) {
  //     connectWallet();
  //   }
  // }, [])

  // useEffect(() => {
  //   console.log(error);
  // })

  const connectWallet = async () => {
    try {
      console.log('connecting wallet')
      const instance = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();
      updateConnection({ instance: instance, provider: provider, signer: signer, network: network, chainId: network.chainId, accountAddress: accounts[0] })

      console.log(Number(network.chainId))
      console.log(chainIdToNetworkMapping[Number(network.chainId)])
      console.log(contractAddreses[chainIdToNetworkMapping[Number(network.chainId)]])
      updateContractAddresses(contractAddreses[chainIdToNetworkMapping[Number(network.chainId)]])
    } catch (error) {
      setError(error);
    }
  }

  // const disconnect = async () => {
  //   console.log('disconnect')
  //   await web3Modal.clearCachedProvider();
  //   updateConnection({ ...useConnection, accountAddress: null, chainId: null, network: null })
  //   // setAccount();
  //   // setChainId();
  //   // setNetwork("");
  // }

  // const handleNetwork = (e) => {
  //   setChainId(Number(e.target.value));
  // }

  const supportedNetworks = SUPPORTED_NETWORKS.map((network) =>
    <MenuItem key={network} onClick={() => { switchNetwork(network) }}>{SUPPORTED_NETWORKS_PARAMS[network]['chainName']}</MenuItem>
  );

  const switchNetwork = async (network) => {
    // console.log(network)
    // console.log(SUPPORTED_NETWORKS)
    // console.log(SUPPORTED_NETWORKS.includes(network))
    if (SUPPORTED_NETWORKS.includes(network)) {
      // console.log('trying to switch to ', network)
      try {
        // console.log('trying to switch to chainId', SUPPORTED_NETWORKS_PARAMS[network]['chainId'])
        await provider.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SUPPORTED_NETWORKS_PARAMS[network]['chainId'] }]
        });
      } catch (switchError) {
        // console.log(switchError)
        // console.log(switchError.code)
        if (switchError.code === 4902) {
          try {
            await provider.provider.request({
              method: "wallet_addEthereumChain",
              params: [SUPPORTED_NETWORKS_PARAMS[network]]
            });
          } catch (error) {
            // console.log(error)
            setError(error);
          }
        }
      }
    } else {
      console.log(`${network} not supported`)
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

          {accountAddress && (

            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {chainIdToNetworkMapping[String(chainId)] ? SUPPORTED_NETWORKS_PARAMS[chainIdToNetworkMapping[String(chainId)]]['chainName'] : 'Unsupported Network'}
              </MenuButton>
              <MenuList>
                {supportedNetworks}
              </MenuList>
            </Menu>
          )}

          <Button
            onClick={connectWallet}
            fontWeight={600} >
            {accountAddress ? accountAddress : 'Connect Wallet'}
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
}