import { Button, Center, Box, Text, VStack, HStack, Tooltip } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import AlphabetButton from "./AlphabetButton";

export default function AlphabetList({ guesses, revealedKeys, player, turn, initialLetter, gameOver, handleLetterChange }) {
  const alphabet = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  ];

  const abcd = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]
  const nopq = ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

  // If qwerty is required
  const querty = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
  const asdf = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
  const zxcv = ["Z", "X", "C", "V", "B", "N", "M"];

  // Test Word
  // const testWord = ["B", "A", "N", "A", "N", "A", "F"];

  //   Revealed Letters
  // const revelaedLetters = ["A", "N", "L", "P"];

  const [selectedAlphabets, setSelectedAlphabets] = useState([]);
  const [currentAlphabet, setCurrentAlphabet] = useState(initialLetter);
  const [correctAlphabets, setCorrectAlphabets] = useState([]);

  useEffect(() => {
    handleLetterChange(currentAlphabet);
  }, [currentAlphabet])

  // console.log(`Player: ${player}`)

  const [rightGuesses, setRightGuesses] = useState([]);
  // console.log(`Turn: ${turn}`)

  useEffect(() => {
    let _rightGuesses = [],
      _wrongGuesses = [];
    // console.log('Use Effect')
    for (let i = 0; i < guesses.length; i++) {
      // console.log(`Guess ${i}: ${guesses[i]}`)
      if (revealedKeys.includes(guesses[i])) {
        _rightGuesses.push(guesses[i]);
      }
    }

    // console.log(`Right Guesses: ${_rightGuesses}`)
    setRightGuesses(_rightGuesses);
    // console.log(`Right Guesses: ${rightGuesses}`)
    setCurrentAlphabet(initialLetter)
  }, [guesses, revealedKeys, initialLetter]);

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <Center flexDirection={"column"}>
        {/* <Text fontWeight={"bold"} marginBottom={5}>
          Chosen Alphabet: {currentAlphabet}
        </Text> */}
        <Box
          // backgroundColor={"whitesmoke"}
          borderRadius="2vw"
          marginRight={"18vh"}
          marginLeft={"18vh"}
        // style={{ boxShadow: "4px 3px 2px grey" }}
        >
          <VStack>

            <HStack>
              {abcd.map((item, index) => {
                const toDisable = guesses.includes(item.toLowerCase());
                const isCorrect = rightGuesses.includes(item.toLowerCase());
                const isSelected = currentAlphabet.includes(item);
                return (
                  <Tooltip
                    label={
                      toDisable && isCorrect ?
                        `${item} is already guessed and is correct.` :
                        toDisable && !isSelected ?
                          `${item} is already guessed and is incorrect` :
                          gameOver ?
                            `Game is over!` :
                            isSelected ?
                              `${item} is the chosen alphabet` :
                              player && turn % 2 == 0 ?
                                `Previous guess is not yet processed` :
                                player ?
                                  "Click to choose the alphabet" :
                                  "Only player can make a guess"
                    }
                    shouldWrapChildren>

                    <AlphabetButton
                      key={item}
                      item={item}
                      toDisable={toDisable}
                      turn={turn}
                      player={player}
                      gameOver={gameOver}
                      isCorrect={isCorrect}
                      isSelected={isSelected}
                      index={index}
                      handleClick={setCurrentAlphabet}
                    />
                  </Tooltip>
                );
              })}
            </HStack>

            <HStack>
              {nopq.map((item, index) => {
                const toDisable = guesses.includes(item.toLowerCase());
                const isCorrect = rightGuesses.includes(item.toLowerCase());
                const isSelected = currentAlphabet.includes(item);
                return (
                  <Tooltip
                    label={
                      toDisable && isCorrect ?
                        `${item} is already guessed and is correct.` :
                        toDisable && !isSelected ?
                          `${item} is already guessed and is incorrect` :
                          gameOver ?
                            `Game is over!` :
                            isSelected ?
                              `${item} is the chosen alphabet` :
                              player && turn % 2 == 0 ?
                                `Previous guess is not yet processed` :
                                player ?
                                  "Click to choose the alphabet" :
                                  "Only player can make a guess"
                    }
                    shouldWrapChildren>

                    <AlphabetButton
                      key={item}
                      item={item}
                      toDisable={toDisable}
                      turn={turn}
                      player={player}
                      gameOver={gameOver}
                      isCorrect={isCorrect}
                      isSelected={isSelected}
                      index={index}
                      handleClick={setCurrentAlphabet}
                    />
                  </Tooltip>
                );
              })}
            </HStack>

            {/* <HStack>
              {zxcv.map((item, index) => {
                const toDisable = guesses.includes(item.toLowerCase());
                const isCorrect = rightGuesses.includes(item.toLowerCase());
                const isSelected = currentAlphabet.includes(item);
                return (
                  <AlphabetButton
                    key={item}
                    item={item}
                    toDisable={toDisable}
                    isCorrect={isCorrect}
                    isSelected={isSelected}
                    index={index}
                    handleClick={setCurrentAlphabet}
                  />
                );
              })}
            </HStack> */}

          </VStack>

          {/* {alphabet.map((item, index) => {
            const toDisable = guesses.includes(item.toLowerCase());
            const isCorrect = rightGuesses.includes(item.toLowerCase());
            const isSelected = currentAlphabet.includes(item);
            return (
              <Button
                colorScheme="purple"
                disabled={toDisable}
                boxSize={"2.5vw"}
                onClick={() => {
                  setCurrentAlphabet(item);
                  // checkCorrect(item);
                }}
                style={{
                  boxShadow: "4px 3px 2px black",
                  margin: "1em",
                }}
                color={"white"}
                backgroundColor={
                  isCorrect && toDisable
                    ? "green"
                    : toDisable
                      ? "red.400"
                      : isSelected
                        ? "purple"
                        : "#805AD5"
                }
                key={index}
              >
                {item}
              </Button>
            );
          })} */}
        </Box>

        {/* <Tooltip
          label={player ? "" : "Only player can submit the guess"}
          placement="bottom"
          shouldWrapChildren
        >
          <Button
            onClick={() => {
              setSelectedAlphabets([...selectedAlphabets, currentAlphabet]);
              handleSubmit(currentAlphabet);
            }}
            colorScheme={"purple"}
            // color={"white"}
            // backgroundColor={"#805AD5"}
            marginTop={5}
            isDisabled={!player}
          >
            Submit Guess
          </Button>
        </Tooltip> */}

        {/* {
          player && !gameOver && (
            <Button
              onClick={() => {
                setSelectedAlphabets([...selectedAlphabets, currentAlphabet]);
                handleSubmit(currentAlphabet);
              }}
              colorScheme={"blue"}
              // color={"white"}
              // backgroundColor={"#805AD5"}
              marginTop={10}
            >
              Submit Guess
            </Button>
          )
        } */}

      </Center>
    </div>
  );
}
