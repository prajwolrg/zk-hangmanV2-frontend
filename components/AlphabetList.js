import { Button, Center, Box, Text } from "@chakra-ui/react";
import React, { useState } from "react";

export default function AlphabetList() {
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
  const testWord = ["B", "A", "N", "A", "N", "A"];

  const [selectedAlphabet, setSelectedAlphabet] = useState([]);
  const [currentAlphabet, setCurrentAlphabet] = useState("");
  const [correctAlphabet, setCorrectAlphabet] = useState([]);

  function checkCorrect(item) {
    if (testWord.includes(item)) {
      return setCorrectAlphabet([...correctAlphabet, item]);
    }
  }

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
            const toDisable = selectedAlphabet.includes(item);
            const isCorrect = correctAlphabet.includes(item);
            return (
              <Button
                disabled={toDisable ? true : false}
                boxSize={20}
                onClick={() => {
                  setSelectedAlphabet([...selectedAlphabet, item]);
                  setCurrentAlphabet(item);
                  checkCorrect(item);
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
                    : "#805AD5"
                }
                key={index}
              >
                {item}
              </Button>
            );
          })}
        </Box>
      </Center>
    </div>
  );
}
