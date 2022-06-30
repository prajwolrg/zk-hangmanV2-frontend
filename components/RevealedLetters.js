import { HStack, PinInput, PinInputField } from "@chakra-ui/react";

const RevealedLetters = ({totalChars, revealedChars}) => {
	return (
		<HStack style={{ marginTop: 60 }}>
			<PinInput autoFocus type="alphanumeric"
				isReadOnly
				// placeholder="hello"
				// isDisabled
				value={revealedChars.join('')}
			>
				{[...Array(totalChars)].map((item, index) => (

					<PinInputField
						onKeyDown={(e) => {
							handleKeyDown(e);
						}}
						ringColor={"purple.500"}
						borderWidth={2}
						boxSize={"20"}
						key={index}
					/>
				))}
			</PinInput>
		</HStack>

	);
}

export default RevealedLetters;