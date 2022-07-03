import { Step, Steps, useSteps } from "chakra-ui-steps"
import { Flex, Button, Heading, Center, VStack, Text, Spinner, HStack, useClipboard } from "@chakra-ui/react"
import next from "next";
import { useEffect, useState } from "react";
import { CloseIcon } from '@chakra-ui/icons'

import {
  FacebookShareCount,
  PinterestShareCount,
  VKShareCount,
  OKShareCount,
  RedditShareCount,
  TumblrShareCount,
  HatenaShareCount,
  FacebookShareButton,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  LinkedinShareButton,
  TwitterShareButton,
  PinterestShareButton,
  VKShareButton,
  OKShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  RedditShareButton,
  EmailShareButton,
  TumblrShareButton,
  LivejournalShareButton,
  MailruShareButton,
  ViberShareButton,
  WorkplaceShareButton,
  LineShareButton,
  WeiboShareButton,
  PocketShareButton,
  InstapaperShareButton,
  HatenaShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  PinterestIcon,
  VKIcon,
  OKIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
  TumblrIcon,
  MailruIcon,
  EmailIcon,
  LivejournalIcon,
  ViberIcon,
  WorkplaceIcon,
  LineIcon,
  PocketIcon,
  InstapaperIcon,
  WeiboIcon,
  HatenaIcon,
} from 'react-share';
import { useRouter } from "next/router";
import { useConnection } from "../context/ConnectionContext";

const steps = [
  { label: "Word", stepDetail: "Validating the word..." },
  { label: "Proof", stepDetail: "Creating Proof..." },
  { label: "Confirmation", stepDetail: "Waiting for the transaction confirmation..." },
  { label: "Finalization", stepDetail: "Waiting for transaction to finalize" },
];

export const InitStepperV = ({ currentStep, error, errorMsg, gameAddress }) => {
  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  })

  const {networkName} = useConnection()

  const [gameUrl, setGameUrl] = useState()

  const {hasCopied, onCopy} = useClipboard(gameUrl)

  // console.log(`Active step: ${activeStep}, Current Step: ${currentStep}, Error: ${error}`)
  if (currentStep > activeStep) {
    nextStep()
  }

  const router = useRouter()
  const goToGame=() => {
    router.push(`play/${gameAddress}`)
  }

  useEffect(()=> {
    let newGameURL = `${window.location.hostname}/?mode=player&network=${networkName}&gameAddress=${gameAddress}`
    setGameUrl(newGameURL)
  }, [gameAddress])



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
            The game is successfully created!
          </Heading>

          <HStack mt={6} justifyContent={"center"}>
            <Button size="sm" onClick={goToGame}>
              Go To Game
            </Button>
            <Button size="sm" onClick={onCopy}>
            {hasCopied? 'Invitation Link Copied' : 'Copy Invitation Link'}
            </Button>
          </HStack>

          <Heading fontSize="xl" textAlign="center" marginTop={10}>Invite your friend for a challenge!</Heading>
          <HStack justifyContent={"center"} marginTop={5}>
            <FacebookShareButton
              url={gameUrl}
              quote={"Guess the letters!"}
              hashtag={"ZeroKnowledge"}
            >
              <FacebookIcon size={32} round />
            </FacebookShareButton>

            <LinkedinShareButton
              url={gameUrl}
              title={"Guess the letters!"}
            >
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>

            <TelegramShareButton
              url={gameUrl}
              title={"Guess the letters!"}
            >
              <TelegramIcon size={32} round />
            </TelegramShareButton>

            <RedditShareButton
              url={gameUrl}
              title={"Guess the letters!"}
            >
              <RedditIcon size={32} round />
            </RedditShareButton>

            <TwitterShareButton
              url={gameUrl}
              title={"Guess the letters!"}
              hashtags={["hangman", "zeroknowledge", "harmonyzku"]}
            >
              <TwitterIcon size={32} round />
            </TwitterShareButton>

            <ViberShareButton
              url={gameUrl}
              title={"Guess the letters!"}
            >
              <ViberIcon size={32} round />
            </ViberShareButton>

            <WhatsappShareButton
              url={gameUrl}
              title={"Guess the letters!"}
            >
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
          </HStack>

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

export default InitStepperV
