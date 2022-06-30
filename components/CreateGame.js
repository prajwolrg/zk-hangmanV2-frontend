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

import { getInitProofParams } from "../utils/proofUtils";
import { checkWordValidity, getParsedChars } from "../utils/wordUtils";
import { InitStepper } from "./InitStepper";
import InitStepperV from "./InitStepperV";

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

yup.addMethod(yup.string, "validEnglishWord", function (errMsg) {
  return this.test(`test-valid-english-word`, errMsg, async function (value) {
    const { path, createError } = this;
    const wordDetails = await checkWordValidity(value)
    return (
      wordDetails[0] ||
      createError({
        path,
        message: errMsg ? errMsg : "Enter a valid English word",
      })
    );
  });
});


let schema = yup.object().shape({
  playerAddress: yup.string().required().ethereumAddress(),
  // word: yup.string().required().min(2).max(25).validEnglishWord(),
  word: yup.string().required().min(2).max(25),
  secret: yup.string().required().min(2).max(25),
});

export default function CreateNewGame() {
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [dialogMessage, setDialogMessage] = useState();
  const [currentStep, setCurrentStep] = useState(0);
  const {
    ZK_HANGMAN_FACTORY_ADDRESS,
    INIT_VERIFIER_ADDRESS,
    GUESS_VERIFIER_ADDRESS,
  } = useContractAddresses();
  const { instance, provider, signer, network, chainId, accountAddress } =
    useConnection();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const router = useRouter();

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const createGame = async ({ playerAddress, word, secret }) => {
    setError(false)
    setErrorMsg("")
    setCurrentStep(0)

    console.log("creating game");
    onOpen();
    console.log(`Trying to create a game`);

    setDialogMessage(`Trying to validate word`);

    const [valid, res] = await checkWordValidity(word);

    // console.log("player address: ", playerAddress);
    // console.log("init verifier address: ", INIT_VERIFIER_ADDRESS);
    // console.log("guess verifier address: ", GUESS_VERIFIER_ADDRESS);

    if (valid) {
      console.log("valid");
      setCurrentStep(1);

      setDialogMessage(`Generating Proof...`);

      let modSecret = ethers.utils.id(secret);
      modSecret = ethers.BigNumber.from(modSecret);
      console.log("Secret Hash: ", modSecret);
      const parsedChars = getParsedChars(res.word);
      console.log(res.word);
      console.log(parsedChars);

      const inputObject = {
        secret: BigInt(modSecret),
        char: parsedChars,
      };
      const { _a, _b, _c, _input } = await getInitProofParams(inputObject);
      setCurrentStep(2);

      // e.preventDefault();
      const zkHangmanFactoryContract = new ethers.Contract(
        ZK_HANGMAN_FACTORY_ADDRESS,
        zkHangmanFactoryAbi,
        signer
      );

      console.log(zkHangmanFactoryContract);

      setDialogMessage("Awaiting transaction confirmation...");

      try {
        let tx = await zkHangmanFactoryContract.createGame(
          playerAddress,
          INIT_VERIFIER_ADDRESS,
          GUESS_VERIFIER_ADDRESS,
          _a,
          _b,
          _c,
          _input,
          word.length
        );
        setCurrentStep(3);

        setDialogMessage("Waiting for transaction to finalize...");

        let txFinalized = await tx.wait();
        setCurrentStep(4);

        onClose();

        let filter = zkHangmanFactoryContract.filters.GameCreated(
          accountAddress,
          playerAddress
        );
        let filterResults = await zkHangmanFactoryContract.queryFilter(
          filter,
          -1000
        );
        let newGameAddress =
          filterResults[filterResults.length - 1].args.gameAddress;

        let href = "/game/" + newGameAddress;
        router.push(href);

      } catch (err) {
        setError(true)
        console.log(err)
        setErrorMsg("User denied transaction signature!")
      }
    }
    else {
      setError(true)
      setErrorMsg("Not a valid word. Try again!")
    }
  };

  return (
    <>
      <Box bg="white" p={(0, 6, 0, 6)} rounded="md" w={"30vw"}>
        <Formik
          initialValues={{
            playerAddress: "0x1F39D6a90AFb5B7C27034196A87EB399939E1df4",
            word: "apple",
            secret: "apple",
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

                <FormControl isInvalid={!!errors.word && touched.word}>
                  <FormLabel>Select a word</FormLabel>
                  <Field
                    as={Input}
                    id="word"
                    name="word"
                    type="text"
                    variant="filled"
                  />
                  <FormErrorMessage>{errors.word}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.secret && touched.secret}>
                  <FormLabel>Secret</FormLabel>
                  <Field
                    as={Input}
                    id="secret"
                    name="secret"
                    type="text"
                    variant="filled"
                  />
                  <FormErrorMessage>{errors.secret}</FormErrorMessage>
                </FormControl>

                <Button type="submit" colorScheme="purple" width="full">
                  Create Game
                </Button>
              </VStack>
            </form>
          )}
        </Formik>
      </Box>

      <Box bg="transparent" p={6} rounded="md" w={640}>
        <AlertDialog isOpen={isOpen} onClose={onClose} closeOnOverlayClick={error}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogBody align="center" py={10}>
                {/* <Text mb={7}> {dialogMessage} </Text> */}
                <InitStepperV currentStep={currentStep} error={error} errorMsg={errorMsg}></InitStepperV>
                {/* <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                /> */}
              </AlertDialogBody>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </>
  );
}
