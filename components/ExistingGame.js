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
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogBody,
    useDisclosure,
    useShortcut,
} from "@chakra-ui/react";

import * as yup from "yup";
import { ethers } from "ethers";
import { useContractAddresses } from "../context/ContractContext";
import zkHangmanFactory from "../abis/zkHangmanFactory.json";
import zkHangman from "../abis/zkHangman.json";
import { useConnection } from "../context/ConnectionContext";
import { useState } from "react";
import { useRouter } from "next/router";
import { JoinGameStepper } from "./JoinGameStepper";

const zkHangmanFactoryAbi = zkHangmanFactory.abi;
const zkHangmanAbi = zkHangman.abi;

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

export default function ExistingGame({ gameAddress }) {
    const { instance, provider, signer, network, chainId, accountAddress, networkName } =
        useConnection();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // console.log(networkName)

    const [currentStep, setCurrentStep] = useState(0);

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();

    const joinGame = async ({ gameAddress }) => {
        //Checking if the game exists
        setError(false);
        setErrorMsg("");
        setCurrentStep(0);

        onOpen();
        const zkHangmanContract = new ethers.Contract(
            gameAddress,
            zkHangmanAbi,
            signer
        );

        try {
            let player = await zkHangmanContract.player();
            let host = await zkHangmanContract.host();
            console.log(player);
            setCurrentStep(1);
            if (player == ethers.constants.AddressZero) {
                if (accountAddress == host) {
                    setError(true);
                    setErrorMsg("Host cannot join as player!");
                } else {
                    try {
                        let tx = await zkHangmanContract.joinGame();
                        setCurrentStep(2);
                        let txFinalized = await tx.wait();
                        setCurrentStep(3);
                        router.push(`/play/${gameAddress}/?network=${networkName}`);
                    } catch (err) {
                        // console.log(JSON.stringify(err))
                        setError(true)
                        setErrorMsg(err.message)
                        if (err.code == "TRANSACTION_REPLACED" && err.cancelled == false) {
                            setError(false)
                            setCurrentStep(3);
                            router.push(`/play/${gameAddress}/?network=${networkName}`);
                        }
                    }
                }
            } else if (player == accountAddress) {
                // console.log("Continue the game!")
                // router.push(`/play/${gameAddress}`)
                setCurrentStep(3);
                router.push(`/play/${gameAddress}/?network=${networkName}`);
            } else {
                setError(true);
                setErrorMsg("Someone else has already joined!");
            }
        } catch (err) {
            console.log(err);
            setError("Not a valid game");
        }
    };

    const gotoGame = ({ gameAddress }) => {
        let href = "/play/" + gameAddress;
        router.push(href);
    };

    return (
        <>
            <Box bg="white" p={6} rounded="md" w={"30vw"}>
                <Formik
                    initialValues={{
                        gameAddress: gameAddress,
                    }}
                    onSubmit={(values) => {
                        // gotoGame(values);
                        joinGame(values);
                    }}
                    validationSchema={schema}
                >
                    {({ handleSubmit, errors, touched }) => (
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={9} align="flex-start">
                                <FormControl
                                    isInvalid={
                                        !!errors.gameAddress &&
                                        touched.gameAddress
                                    }
                                >
                                    <FormLabel>Game Address</FormLabel>
                                    <Field
                                        as={Input}
                                        id="gameAddress"
                                        name="gameAddress"
                                        type="text"
                                        variant="filled"
                                    />
                                    <FormErrorMessage>
                                        {errors.gameAddress}
                                    </FormErrorMessage>
                                </FormControl>

                                <Button
                                    type="submit"
                                    colorScheme="purple"
                                    width="full"
                                >
                                    Join Game
                                </Button>
                            </VStack>
                        </form>
                    )}
                </Formik>
            </Box>

            <Box bg="transparent" p={6} rounded="md" w={640}>
                <AlertDialog
                    isOpen={isOpen}
                    onClose={onClose}
                    closeOnOverlayClick={error}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogBody align="center" py={10}>
                                <JoinGameStepper
                                    currentStep={currentStep}
                                    error={error}
                                    errorMsg={errorMsg}
                                    gameAddress={gameAddress}
                                ></JoinGameStepper>
                            </AlertDialogBody>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </Box>
        </>
    );
}
