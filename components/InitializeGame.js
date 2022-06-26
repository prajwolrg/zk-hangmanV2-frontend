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
import { ethers, wordlists } from "ethers";
import { useContractAddresses } from "../context/ContractContext";
import zkHangmanFactory from "../abis/zkHangmanFactory.json";
import { useConnection } from "../context/ConnectionContext";
import { useState } from "react";
import { useRouter } from "next/router";
import { toHex } from "../utils";

import zkHangman from "../abis/zkHangman.json";
const zkHangmanAbi = zkHangman.abi;

const snarkjs = require("snarkjs");
const axios = require("axios").default;

let schema = yup.object().shape({
  secret: yup.string().required().min(2).max(25),
  word: yup.string().required().min(2).max(25),
});

export default function InitializeGame() {
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
  const { gameAddress } = router.query;
  const gameContract = gameAddress;

  const checkWordValidity = async (word) => {
    const endpoint = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    console.log(endpoint);
    try {
      const res = await axios.get(endpoint);
      console.log(res.data);
      return [true, res.data[0]];
    } catch (err) {
      console.log(err);
      return [false, err];
    }
  };

  const getParsedChars = (word) => {
    const parsedChars = [];
    let i = 0;
    for (i; i < word.length; i++) {
      const charAscii = word.charCodeAt(i);
      const parsedChar = charAscii - 97;
      parsedChars.push(BigInt(parsedChar));
    }
    for (i; i < 25; i++) {
      parsedChars.push(BigInt(0));
    }
    return parsedChars;
  };

  const getProofParams = async (inputObject) => {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputObject,
      "/init.wasm",
      "/init_0001.zkey"
    );

    const vkey = await fetch("/init_verification_key.json").then((res) => {
      return res.json();
    });

    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    console.log("proof result: ", res);

    console.log(proof);
    console.log(publicSignals);

    const _a = [toHex(proof.pi_a[0]), toHex(proof.pi_a[1])];
    const _b = [
      [toHex(proof.pi_b[0][1]), toHex(proof.pi_b[0][0])],
      [toHex(proof.pi_b[1][1]), toHex(proof.pi_b[1][0])],
    ];
    const _c = [toHex(proof.pi_c[0]), toHex(proof.pi_c[1])];

    const _input = publicSignals.map((x) => toHex(x));

    return { _a, _b, _c, _input };
  };

  const initializeGame = async ({ secret, word }) => {
    console.log(`Trying to initialize a game`);

    const [valid, res] = await checkWordValidity(word);
    if (valid) {
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
      const { _a, _b, _c, _input } = await getProofParams(inputObject);

      const zkHangmanContract = new ethers.Contract(
        gameContract,
        zkHangmanAbi,
        signer
      );
      console.log(zkHangmanContract);

      let tx = await zkHangmanContract.initializeGame(_a, _b, _c, _input, 5);
      console.log(tx);

      let txFinalized = await tx.wait();

      console.log(txFinalized);
    }
  };

  return (
    <Box bg="white" p={6} rounded="md" w={460}>
      <Formik
        initialValues={{
          secret: "",
          word: "",
        }}
        onSubmit={(values) => {
          initializeGame(values);
        }}
        validationSchema={schema}
      >
        {({ handleSubmit, errors, touched }) => (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="flex-start">
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

              <FormControl isInvalid={!!errors.word && touched.word}>
                <FormLabel>Word</FormLabel>
                <Field
                  as={Input}
                  id="word"
                  name="word"
                  type="text"
                  variant="filled"
                />
                <FormErrorMessage>{errors.word}</FormErrorMessage>
              </FormControl>
              <Button type="submit" colorScheme="purple" width="full">
                Initialize Game
              </Button>
            </VStack>
          </form>
        )}
      </Formik>
    </Box>
  );
}
