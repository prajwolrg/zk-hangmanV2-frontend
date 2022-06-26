import { Step, Steps, useSteps } from "chakra-ui-steps";
import { Flex, Heading, Button, Text, VStack, Center } from "@chakra-ui/react";

const steps = [
  { label: "Step 1", stepDetail: "Processing through metamask" },
  { label: "Step 2", stepDetail: "Finalizing transaction" },
  { label: "Step 3", stepDetail: "Waiting for the host" },
  { label: "Step 4", stepDetail: "Completion" },
];

export const Stepper = ({ guessedLetter, setCloseModal }) => {
  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  var delayTime = 5000;

  setTimeout(function () {
    nextStep();
  }, delayTime);

  const Contents = (item) => {
    return (
      <Center>
        <VStack marginTop={10}>
          <Text fontSize={30}>{item.stepDetail}</Text>
          <Text fontSize={25}>Your guessed letter is: {guessedLetter}</Text>
          {item.index == 3 ? setCloseModal(true) : null}
        </VStack>
      </Center>
    );
  };

  return (
    <Flex flexDir="column" width="100%">
      <Steps activeStep={activeStep}>
        {steps.map(({ label, stepDetail }, index) => (
          <Step key={label}>
            <Contents stepDetail={stepDetail} index={index} />
          </Step>
        ))}
      </Steps>
      {/* {activeStep === steps.length ? (
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
          <Button
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
          </Button>
        </Flex>
      )} */}
    </Flex>
  );
};

export default Stepper;
