import { Button, Center, Box, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

export default function AlphabetList({ guesses, revealedKeys }) {
  const alphabet = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    // If qwerty is required
    // ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    // ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    // ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  // Test Word
  // const testWord = ["B", "A", "N", "A", "N", "A", "F"];

  //   Revealed Letters
  const revelaedLetters = ["A", "N", "L", "P"];

  const [selectedAlphabets, setSelectedAlphabets] = useState([]);
  const [currentAlphabet, setCurrentAlphabet] = useState("");
  const [correctAlphabets, setCorrectAlphabets] = useState([]);

  const [rightGuesses, setRightGuesses] = useState([])

  useEffect(() => {
    let _rightGuesses = [], _wrongGuesses = []
    // console.log('Use Effect')
    for (let i = 0; i < guesses.length; i++) {
      // console.log(`Guess ${i}: ${guesses[i]}`)
      if (revealedKeys.includes(guesses[i])) {
        _rightGuesses.push(guesses[i])
      }
    }

    // console.log(`Right Guesses: ${_rightGuesses}`)
    setRightGuesses(_rightGuesses)
    // console.log(`Right Guesses: ${rightGuesses}`)

  }, [])

  return (
    <div style={{ marginTop: 100, marginBottom: 100 }}>
      <Center flexDirection={"column"}>
        <Text fontWeight={"bold"} marginBottom={10}>
          Chosen Alphabet: {currentAlphabet}
        </Text>
        <Box
          backgroundColor={"whitesmoke"}
          borderRadius="2vw"
          marginRight={"18vh"}
          marginLeft={"18vh"}
          style={{ boxShadow: "4px 3px 2px grey" }}
        >
          {alphabet.map((item, index) => {
            const toDisable = guesses.includes(item.toLowerCase());
            const isCorrect = rightGuesses.includes(item.toLowerCase());
            const isSelected = currentAlphabet.includes(item);
            return (
              <Button
                colorScheme="purple"
                disabled={toDisable}
                boxSize={"5vw"}
                onClick={() => {
                  setCurrentAlphabet(item);
                  // checkCorrect(item);
                }}
                style={{
                  boxShadow: "4px 3px 2px black",
                  margin: "2em",
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
          })}
        </Box>
        <Button
          onClick={() => {
            setSelectedAlphabets([...selectedAlphabets, currentAlphabet]);
          }}
          color={"white"}
          backgroundColor={"#805AD5"}
          marginTop={5}
        >
          Submit
        </Button>
      </Center>
    </div>
  );
}
