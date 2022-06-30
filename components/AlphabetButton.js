import { Button } from "@chakra-ui/react";

const AlphabetButton = ({item, index, key, toDisable, isCorrect, isSelected, handleClick }) => {
	return (
		<Button
			colorScheme="purple"
			disabled={toDisable}
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
			backgroundColor={
				isCorrect && toDisable
					? "green"
					: toDisable
						? "red.400"
						: isSelected
							? "purple"
							: "#805AD5"
			}
			// key={index}
		>
			{item}
		</Button>

	);
}

export default AlphabetButton;