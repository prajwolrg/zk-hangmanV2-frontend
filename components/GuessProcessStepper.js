import { Step, Steps, useSteps } from "chakra-ui-steps"
import { Flex, Button, Heading, Center, VStack, Text, Spinner } from "@chakra-ui/react"
import { useEffect } from "react";
import { CloseIcon } from "@chakra-ui/icons";

const steps = [
  { label: "Proof", stepDetail: "Generating proof to process the guess..." },
  { label: "Confirmation", stepDetail: "Waiting for the transaction confirmation..." },
  { label: "Finalization", stepDetail: "Waiting for transaction to finalize..." },
];


export const GuessProcessStepper = ({currentStep, error, errorMsg}) => {
  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  })

  // console.log(activeStep, currentStep)
  if (currentStep > activeStep) {
    nextStep()
  }

  const Contents = ({detail}) => {
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
            Woohoo! All steps completed!
          </Heading>
          <Button mx="auto" mt={6} size="sm" onClick={reset}>
            Reset
          </Button>
        </Flex>
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

export default GuessProcessStepper
