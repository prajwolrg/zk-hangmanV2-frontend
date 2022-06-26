import { Formik, Field } from "formik";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  useDisclosure,
  useShortcut,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogBody,
  Spinner,
  Text,
} from "@chakra-ui/react";

import * as yup from "yup";
import { ethers } from "ethers";
import { useContractAddresses } from "../context/ContractContext";
import zkHangmanFactory from "../abis/zkHangmanFactory.json";
import { useConnection } from "../context/ConnectionContext";
import { useState } from "react";
import { useRouter } from "next/router";
const zkHangmanFactoryAbi = zkHangmanFactory.abi;

yup.addMethod(yup.string, "ethereumAddress", function (errMsg) {
  return this.test(`test-ethereum-address`, errMsg, function (value) {
    const { path, createError } = this;

    return (
      ethers.utils.isAddress(value) ||
      createError({
        path,
        message: errMsg ? errMsg : "Enter a valid Ethereum Address",
      })
    );
  });
});

let schema = yup.object().shape({
  hostAddress: yup.string().required().ethereumAddress(),
  playerAddress: yup.string().required().ethereumAddress(),
});

export default function CreateNewGame() {
  const [dialogMessage, setDialogMessage] = useState();
  const {
    ZK_HANGMAN_FACTORY_ADDRESS,
    INIT_VERIFIER_ADDRESS,
    GUESS_VERIFIER_ADDRESS,
  } = useContractAddresses();
  const { instance, provider, signer, network, chainId, accountAddress } =
    useConnection();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const router = useRouter();

  const createGame = async ({ hostAddress, playerAddress }) => {
    console.log(`Trying to create a game`);

    console.log("host address: ", hostAddress);
    console.log("player address: ", playerAddress);
    console.log("init verifier address: ", INIT_VERIFIER_ADDRESS);
    console.log("guess verifier address: ", GUESS_VERIFIER_ADDRESS);

    // e.preventDefault();
    const zkHangmanFactoryContract = new ethers.Contract(
      ZK_HANGMAN_FACTORY_ADDRESS,
      zkHangmanFactoryAbi,
      signer
    );

    console.log(zkHangmanFactoryContract);

    onOpen();
    setDialogMessage("Awaiting transaction confirmation...");

    let tx = await zkHangmanFactoryContract.createGame(
      hostAddress,
      playerAddress,
      INIT_VERIFIER_ADDRESS,
      GUESS_VERIFIER_ADDRESS
    );

    setDialogMessage("Waiting for transaction to finalize...");

    let txFinalized = await tx.wait();

    onClose();

    let filter = zkHangmanFactoryContract.filters.GameCreated(
      hostAddress,
      playerAddress
    );
    let filterResults = await zkHangmanFactoryContract.queryFilter(
      filter,
      -1000
    );
    let newGameAddress =
      filterResults[filterResults.length - 1].args.gameAddress;

    let href = "/gamee/" + newGameAddress;
    router.push(href);
  };

  return (
    <Box bg="white" p={6} rounded="md" w={460}>
      <Formik
        initialValues={{
          hostAddress: accountAddress,
          playerAddress: "",
        }}
        onSubmit={(values) => {
          createGame(values);
        }}
        validationSchema={schema}
      >
        {({ handleSubmit, errors, touched }) => (
          <form onSubmit={handleSubmit}>
            <VStack spacing={9} align="flex-start">
              <FormControl
                isInvalid={!!errors.hostAddress && touched.hostAddress}
              >
                <FormLabel>Host Address</FormLabel>
                <Field
                  as={Input}
                  id="hostAddress"
                  name="hostAddress"
                  type="text"
                  variant="filled"
                />
                <FormErrorMessage>{errors.hostAddress}</FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={!!errors.playerAddress && touched.playerAddress}
              >
                <FormLabel>Player Address</FormLabel>
                <Field
                  as={Input}
                  id="playerAddress"
                  name="playerAddress"
                  type="text"
                  variant="filled"
                />
                <FormErrorMessage>{errors.playerAddress}</FormErrorMessage>
              </FormControl>
              <Button type="submit" colorScheme="purple" width="full">
                Create Game
              </Button>
            </VStack>
          </form>
        )}
      </Formik>
      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogBody align="center" py={10}>
              <Text mb={7}> {dialogMessage} </Text>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            </AlertDialogBody>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
