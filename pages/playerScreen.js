import {
  Flex,
  Tab,
  Text,
  VStack,
  HStack,
  PinInput,
  PinInputField,
  Spacer,
  Center,
  Heading,
} from "@chakra-ui/react";
import React, { useState } from "react";
import TopNav from "../components/TopNav";
import { withRouter } from "next/router";
import Figure from "../components/Figure";
import ModalComponent from "../components/ModalComponent";
function playerScreen() {
  const wordLength = 10;
  const errors = 0;
  const [openModal, setOpenModal] = useState(false);
  const [guessedLetter, setGuessedLetter] = useState("");
  const handleKeyDown = (e) => {
    setOpenModal(!openModal);
    setGuessedLetter(e.key);
  };
  return (
    <>
      <TopNav />
      <Center
        overflow="hidden"
        height={"95vh"}
        alignItems="center"
        backgroundColor="whitesmoke"
      >
        <ModalComponent guessedLetter={guessedLetter} openModal={openModal} />
        <VStack>
          <Heading marginBottom={20}>Make your guess!</Heading>
          <Figure errors={errors} />
          <HStack style={{ marginTop: 60 }}>
            <PinInput autoFocus type="alphanumeric">
              {[...Array(wordLength)].map((item, index) => (
                <PinInputField
                  onKeyDown={(e) => {
                    handleKeyDown(e);
                  }}
                  ringColor={"purple.500"}
                  borderWidth={2}
                  boxSize={"20"}
                  key={index}
                />
              ))}
            </PinInput>
          </HStack>
        </VStack>
      </Center>
    </>
  );
}

export default withRouter(playerScreen);
