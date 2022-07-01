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
  gameAddress: yup.string().required().ethereumAddress(),
});

export default function ExistingGame() {
  const router = useRouter();

  const gotoGame = ({ gameAddress }) => {
    let href = "/play/" + gameAddress;
    router.push(href);
  };

  return (
    <Box bg="white" p={6} rounded="md" w={"30vw"}>
      <Formik
        initialValues={{
          gameAddress: "",
          playerAddress: "",
        }}
        onSubmit={(values) => {
          gotoGame(values);
        }}
        validationSchema={schema}
      >
        {({ handleSubmit, errors, touched }) => (
          <form onSubmit={handleSubmit}>
            <VStack spacing={9} align="flex-start">
              <FormControl
                isInvalid={!!errors.gameAddress && touched.gameAddress}
              >
                <FormLabel>Game Address</FormLabel>
                <Field
                  as={Input}
                  id="gameAddress"
                  name="gameAddress"
                  type="text"
                  variant="filled"
                />
                <FormErrorMessage>{errors.gameAddress}</FormErrorMessage>
              </FormControl>

              <Button type="submit" colorScheme="purple" width="full">
                Join Game
              </Button>
            </VStack>
          </form>
        )}
      </Formik>
    </Box>
  );
}
