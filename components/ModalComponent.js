import React, { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Text,
} from "@chakra-ui/react";
import Stepper from "./Stepper";
import { useRouter } from "next/router";

export default function ModalComponent({ openModal, guessedLetter }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const href = "/playerScreen";
  useEffect(() => {
    onOpen();
  }, [openModal]);
  useEffect(() => {
    onClose();
  }, []);
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Processing ...</ModalHeader>
          <ModalBody>
            <Stepper
              setCloseModal={() => {
                onClose();
              }}
              guessedLetter={guessedLetter}
            />
          </ModalBody>

          {/* <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </>
  );
}
