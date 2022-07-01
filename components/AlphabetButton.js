import { Button } from "@chakra-ui/react";

const AlphabetButton = ({ item, index, toDisable, isCorrect, player, isSelected, handleClick }) => {
	// console.log(`${key} is correct: ${isCorrect}`)
	return (
		<Button
			// colorScheme="purple"

			colorScheme={toDisable && isCorrect ?
				"green" :
				toDisable ?
					"red" :
					"purple"
			}

			disabled={toDisable || !player}
			boxSize={"2.5vw"}
			onClick={() => {
				handleClick(item);
				// checkCorrect(item);
			}}
			style={{
				boxShadow: "4px 3px 2px black",
				margin: "1em",
			}}
			color={"white"}

		// backgroundColor={
		// 	isCorrect && toDisable
		// 		? "green"
		// 		: toDisable
		// 			? "red.400"
		// 			: isSelected
		// 				? "purple"
		// 				: "#805AD5"
		// }
		// key={index}
		>
			{item}
		</Button>

	);
}

export default AlphabetButton;