import { Box, Input, Flex, Text, Heading, Img, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ExistingGame from "../components/ExistingGame";
import CreateNewGame from "../components/CreateGame";
import { useConnection } from "../context/ConnectionContext";
import { useRouter } from "next/router";
import { chainIdToNetworkMapping, SUPPORTED_NETWORKS, SUPPORTED_NETWORKS_PARAMS } from "../utils";
import { connect } from "formik";
export default function LandingPage() {

  const [selectedMode, setSelectedMode] = useState("Host");
  const [isConnected, setIsConnected] = useState(false);
  const { accountAddress, isNetworkSupported, network } = useConnection();

  const [rightNetwork, setRightNetwork] = useState(false)
  const [gameAddress, setGameAddress] = useState("");
  const [connectionMsg, setConnectionMsg] = useState("")

  const router = useRouter()

  useEffect(() => {
    // console.log(`Network support: ${isNetworkSupported}`);
    // console.log(`Selected Mode: ${selectedMode}`)
    if (accountAddress == null) {
      setIsConnected(false);
      setConnectionMsg("Please connect the wallet!")
    } else if (!isNetworkSupported) {
      setIsConnected(false);
      setConnectionMsg("Select a supported network!")
    } else {
      setIsConnected(true);
    }

    if (router.query) {
      const mode = router.query.mode
      const gameAddress = router.query.gameAddress
      const networkName = router.query.network
      if (mode) {
        if (mode == 'player' || mode == 'Player') {
          setSelectedMode('Player')
          if (gameAddress) {
            setGameAddress(gameAddress)
          }
        }
      }

      if (networkName && network) {
        if (SUPPORTED_NETWORKS.includes(networkName)) {
          if (networkName != chainIdToNetworkMapping[network.chainId]) {
            setIsConnected(false)
            setConnectionMsg(`Switch to ${SUPPORTED_NETWORKS_PARAMS[networkName]['chainName']} to play!`)
          }
        }
      }
    }

  }, [accountAddress, isNetworkSupported, network]);
  return (
    <Flex
      style={{
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        backgroundColor: "whitesmoke",
        height: "98vh",
      }}
    >
      <Img
        height={"85vh"}
        width={"40vw"}
        src="./LandingImage.png"
        alt="homepage"
      />

      <Box
        paddingBottom={"3vh"}
        overflow={"auto"}
        boxShadow="xl"
        w="40vw"
        minH={"73%"}
        rounded="md"
        bg="white"
      >
        <Flex flexDirection={"row"} justifyContent={"space-between"}>
          <Box
            textAlign="center"
            padding="3vh"
            rounded={"md"}
            flex={0.5}
            boxShadow="xl"
            bgColor={selectedMode === "Host" ? "#805AD5" : "whitesmoke"}
            color={selectedMode === "Host" ? "white" : "black"}
            onClick={() => {
              setSelectedMode("Host");
            }}
            cursor={"pointer"}
          >
            <Text fontSize="xl">Host</Text>
          </Box>
          <Box
            textAlign="center"
            padding="3vh"
            rounded={"md"}
            flex={0.5}
            boxShadow="xl"
            bg={selectedMode === "Player" ? "#805AD5" : "whitesmoke"}
            color={selectedMode === "Player" ? "white" : "black"}
            onClick={() => {
              setSelectedMode("Player");
            }}
            cursor={"pointer"}
          >
            <Text fontSize="xl">Player</Text>
          </Box>
        </Flex>
        {!isConnected ? (
          <Flex
            justifyContent="center"
            alignItems="center"
            flexDirection={"column"}
            marginTop="5vh"
          >
            <Img
              w="25vw"
              h="25vw"
              src={"./noConnection.gif"}
              alt="noConnection"
            />
            <Text fontWeight="bold" fontSize="1.4vw">
              {connectionMsg}
            </Text>
          </Flex>
        ) : selectedMode === "Host" ? (
          <VStack marginTop="5vh">
            <Heading mb="10px"> Create new game </Heading>
            <CreateNewGame />
          </VStack>
        ) : selectedMode === "Player" ? (
          <VStack marginTop="5vh">
            <Heading mb="10px"> Join existing game </Heading>
            <ExistingGame gameAddress={gameAddress} />
          </VStack>
        ) : null}
      </Box>
    </Flex>
  );
}
