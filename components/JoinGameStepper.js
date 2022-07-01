import { Step, Steps, useSteps } from "chakra-ui-steps"
import { Flex, Button, Heading, Center, VStack, Text, Spinner, HStack } from "@chakra-ui/react"
import next from "next";
import { useEffect, useState } from "react";
import { CloseIcon } from '@chakra-ui/icons'

import { useRouter } from "next/router";

const steps = [
  { label: "Game", stepDetail: "Checking the game..." },
  { label: "Confirmation", stepDetail: "Waiting for the transaction confirmation..." },
  { label: "Finalization", stepDetail: "Waiting for transaction to finalize" },
];

export const JoinGameStepper = ({ currentStep, error, errorMsg }) => {
  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  })

  // console.log(`Active step: ${activeStep}, Current Step: ${currentStep}, Error: ${error}`)
  if (currentStep > activeStep) {
    nextStep()
  }

  const Contents = ({ detail, error, errorMsg }) => {
    return (
      error ? (
        <Center>
          <VStack >
            <CloseIcon w={6} h={6} color="red" />
            <Text>{errorMsg}</Text>
          </VStack >
        </Center >
      ) : (
        <Center>
          <VStack >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
            <Text>{detail}</Text>
          </VStack >
        </Center >
      )
    );
  };

  return (
    <>
      <Steps orientation="vertical" activeStep={activeStep}>
        {steps.map(({ label, stepDetail }, index) => (
          <Step width="100%" label={label} key={label}>
            <Contents detail={stepDetail} error={error} errorMsg={errorMsg} />
          </Step>
        ))}
      </Steps>

      {activeStep === steps.length ? (
        <Flex px={4} py={4} width="100%" flexDirection="column">
          <Heading fontSize="xl" textAlign="center">
								You have successfully joined the game!
          </Heading>
        </Flex>

          // <HStack mt={6} justifyContent={"center"}>
          //   <Button size="sm" onClick={goToGame}>
          //     Go To Game
          //   </Button>
          //   {/* <Button size="sm" onClick={reset}>
          //     Copy Game URL
          //   </Button> */}
          // </HStack>

      ) : (
        <Flex width="100%" justify="flex-end">
          {/* <Button
            isDisabled={activeStep === 0}
            mr={4}
            onClick={prevStep}
            size="sm"
            variant="ghost"
          >
            Prev
          </Button>
          <Button size="sm" onClick={nextStep}>
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button> */}
        </Flex>
      )}
    </>
  )
}

export default JoinGameStepper
