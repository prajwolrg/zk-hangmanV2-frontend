import { Box, Input, Flex, Text, Heading, Img, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ExistingGame from "../components/ExistingGame";
import CreateNewGame from "../components/CreateGame";
import { useConnection } from "../context/ConnectionContext";
export default function LandingPage() {
  const [selectedMode, setSelectedMode] = useState("Host");
  const [isConnected, setIsConnected] = useState(false);
  const { accountAddress } = useConnection();

  useEffect(() => {
    if (accountAddress !== null) {
      setIsConnected(true);
    }
  }, [accountAddress]);
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

      <Box boxShadow="xl" w="40vw" h="70vh" rounded="md" bg="white">
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
              Please Connect Your Wallet to Begin
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
            <ExistingGame />
          </VStack>
        ) : null}
      </Box>
    </Flex>
  );
}
