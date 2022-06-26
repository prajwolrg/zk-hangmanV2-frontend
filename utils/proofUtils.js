const snarkjs = require("snarkjs");

const toHex = (num) => {
    const val = BigInt(num);
    return "0x" + val.toString(16);
}

const getProofParams = async (inputObject, wasmPath, zkeyPath, verificationKeyPath) => {
	const { proof, publicSignals } =
		await snarkjs.groth16.fullProve(inputObject, wasmPath, zkeyPath);

	const vkey = await fetch(verificationKeyPath).then((res) => {
		return res.json();
	})

	const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
	console.log("proof result: ", res);

	console.log(proof);
	console.log(publicSignals);

	const _a = [toHex(proof.pi_a[0]), toHex(proof.pi_a[1])];
	const _b = [
		[
			toHex(proof.pi_b[0][1]),
			toHex(proof.pi_b[0][0])
		],
		[
			toHex(proof.pi_b[1][1]),
			toHex(proof.pi_b[1][0])
		]
	];
	const _c = [toHex(proof.pi_c[0]), toHex(proof.pi_c[1])];

	const _input = publicSignals.map(x => toHex(x));

	return { _a, _b, _c, _input };
}

export const getInitProofParams = async (inputObject) => {
	const wasmPath = "/init.wasm"
	const zkeyPath = "/init_0001.zkey"
	const verificationKeyPath = "/init_verification_key.json"
	return getProofParams(inputObject, wasmPath, zkeyPath, verificationKeyPath)
}

export const getGuessProofParams = async (inputObject) => {
	const wasmPath = "/guess.wasm"
	const zkeyPath = "/guess_0001.zkey"
	const verificationKeyPath = "/guess_verification_key.json"
	return getProofParams(inputObject, wasmPath, zkeyPath, verificationKeyPath)
}

