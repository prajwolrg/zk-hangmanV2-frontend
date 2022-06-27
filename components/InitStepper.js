import { Flex, Button, Heading, Center, VStack, Text, Spinner } from "@chakra-ui/react"
import { Step, Steps, useSteps } from "chakra-ui-steps"

const steps = [
  { label: "Word", stepDetail: "Validating the word.." },
  { label: "Proof", stepDetail: "Creating Proof..." },
  { label: "Confirmation", stepDetail: "Waiting for the transaction confirmation..." },
  { label: "Finalization", stepDetail: "Waiting for transaction to finalize" },
];


export const InitStepper = () => {
	const { nextStep, prevStep, reset, activeStep } = useSteps({
		initialStep: 0,
	})

	const Contents = ({detail}) => {
		return (
			<Center>
				<VStack marginTop={10}>
					<Spinner
						thickness="4px"
						speed="0.65s"
						emptyColor="gray.200"
						color="blue.500"
						size="xl"
					/>
					<Text>{detail}</Text>
				</VStack>
			</Center>
		);
	};


	return (
		<Flex flexDir="column" width="100%">

			<Steps activeStep={activeStep}>
				{steps.map(({ label, stepDetail }, index) => (
					<Step label={label} key={label}>
						<Contents index={index} detail={stepDetail} />
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
			)}
		</Flex>
	)
}

export default InitStepper
