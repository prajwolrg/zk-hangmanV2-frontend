import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { zkHangmanAbi } from "../../abis/zkHangman";

const snarkjs = require("snarkjs");

const providerOptions = {};

const toHex = (num) => {
  const val = BigInt(num);
  return "0x" + val.toString(16);
}

const harmonyTestnetParams = {
    chainId: toHex(1666700000),
    rpcUrls: ["https://api.s0.b.hmny.io"],
    chainName: "Harmony Testnet",
    nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
    blockExplorerUrls: ["https://explorer.pops.one/"],
    iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"]
  }

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
  });
}

const initVerifierAddress = "0xcb3729aE1C27De9b4F7826A749f49E74dC130344";
const guessVerifierAddress = "0x262201b73941709113Fb47E564C9026830476706";

function HomePage() {
  const [error, setError] = useState();
  const [instance, setInstance] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [chainId, setChainId] = useState();
  const [hostAddress, setHostAddress] = useState('');
  const [playerAddress, setPlayerAddress] = useState('');
  const [contract, setContract] = useState();

  const [turn, setTurn] = useState();
  const [lives, setLives] = useState();
  const [contractConnected, setContractConnected] = useState(false);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [revealedChars, setRevealedChars] = useState([]);
  const [revealedChars2, setRevealedChars2] = useState([]);
  const [charDisplay, setCharDisplay] = useState(['_', '_', '_', '_', '_']);
  const [guess, setGuess] = useState('');
  const [latestGuess, setLatestGuess] = useState();

  const [secret, setSecret] = useState('');
  const [char1, setChar1] = useState('');
  const [char2, setChar2] = useState('');
  const [char3, setChar3] = useState('');
  const [char4, setChar4] = useState('');
  const [char5, setChar5] = useState('');

  const [rev1, setRev1] = useState();
  const [rev2, setRev2] = useState();
  const [rev3, setRev3] = useState();
  const [rev4, setRev4] = useState();
  const [rev5, setRev5] = useState();

  const router = useRouter();
  const { gameAddress } = router.query;
  const gameContract = gameAddress;

  
  useEffect(() => {
    if (instance?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accounts changed", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      }

      const handleChainChanged = (hexChainId) => {
        console.log("chain changed")
        setChainId(parseInt(hexChainId, 16));
      };

      instance.on("accountsChanged", handleAccountsChanged);
      instance.on("chainChanged", handleChainChanged);
      instance.on("disconnect", handleDisconnect);
      

      return () => {
        if (instance.removeListener) {
          instance.removeListener("accountsChanged", handleAccountsChanged);
          instance.removeListener("chainChanged", handleChainChanged);
          instance.removeListener("disconnect", handleDisconnect);
        }
      }
    }
  }, [instance])

  useEffect(() => {
    if(!router.isReady) return;
    
    if (web3Modal.cachedProvider) {
      connectWallet();
    }

    
  }, [router.isReady])

  useEffect(() => {
    console.log(error);
  })

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = await provider.getSigner();
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();
      setInstance(instance);
      setProvider(provider);
      setSigner(signer);
      setNetwork(network);
      setChainId(network.chainId);
      if (accounts) setAccount(accounts[0]);

      console.log("le gameAddress: ", gameContract);
      console.log("le signer: ", signer);

      const zkHangmanContract = new ethers.Contract(
        gameContract,
        zkHangmanAbi,
        signer
      );

      zkHangmanContract.on("NextTurn", async (nextTurn) => {
        console.log("The turn is now: ", nextTurn);
        let decTurn = parseInt(nextTurn._hex, 16);
        setTurn(decTurn);

        let _correctGuesses = parseInt(await zkHangmanContract.correctGuesses(), 16);
        setCorrectGuesses(_correctGuesses);

        const revealed1 = await zkHangmanContract.revealedChars(0);
        setRev1(revealed1);
        console.log(revealed1);

        const revealed2 = await zkHangmanContract.revealedChars(1);
        setRev2(revealed2);

        const revealed3 = await zkHangmanContract.revealedChars(2);
        setRev3(revealed3);

        const revealed4 = await zkHangmanContract.revealedChars(3);
        setRev4(revealed4);

        const revealed5 = await zkHangmanContract.revealedChars(4);
        setRev5(revealed5);
        let bruh = []

        let playerLives = parseInt(await zkHangmanContract.playerLives(), 16);
        setLives(playerLives);

        /*

        for (let i = 0; i < 5; i++) {
          let revealedChar = BigInt(parseInt((await zkHangmanContract.revealedChars(i))._hex, 16));
          bruh.push(revealedChar);
          console.log("bruh: ", bruh, "bruh length: ", bruh.length);
          if (bruh.length == 5) {
            setRevealedChars(bruh)
          }
        };


        console.log("revealed chars:", revealedChars);
        */
        
      });

      setContract(zkHangmanContract);

      console.log(zkHangmanContract);

      let playerLives = parseInt(await zkHangmanContract.playerLives(), 16);
      let turn = parseInt(await zkHangmanContract.turn(), 16);
      let _correctGuesses = parseInt(await zkHangmanContract.correctGuesses(), 16);
      console.log("correct guesses: ", _correctGuesses);
      let host = await zkHangmanContract.host();
      let player = await zkHangmanContract.player();

      console.log("initVerifier: ", await zkHangmanContract.initVerifier());
      console.log("guessVerifier: ", await zkHangmanContract.guessVerifier());

      setLives(playerLives);
      setTurn(turn);
      setContractConnected(true);
      setCorrectGuesses(_correctGuesses)
      setHostAddress(host);
      setPlayerAddress(player);


      /*
      let bruh = [];

      for (let i = 0; i < 5; i++) {
        let revealedChar = BigInt(parseInt((await zkHangmanContract.revealedChars(i))._hex, 16));
        bruh.push(revealedChar);
        console.log("bruh: ", bruh, "bruh length: ", bruh.length);
        if (bruh.length == 5) {
          console.log("PINGAS");
          console.log("PINGAS BRUH: ", bruh);
          setRevealedChars(bruh)
        }
      };
      */
      const revealed1 = await zkHangmanContract.revealedChars(0);
      setRev1(revealed1);
      console.log(revealed1);

      const revealed2 = await zkHangmanContract.revealedChars(1);
      setRev2(revealed2);

      const revealed3 = await zkHangmanContract.revealedChars(2);
      setRev3(revealed3);

      const revealed4 = await zkHangmanContract.revealedChars(3);
      setRev4(revealed4);

      const revealed5 = await zkHangmanContract.revealedChars(4);
      setRev5(revealed5);

      

    } catch (error) {
      setError(error);
    }

    
  }

  const clearState = () => {
    setAccount();
    setChainId();
    setNetwork("");
  }

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    clearState();
  }

  const handleNetwork = (e) => {
    setChainId(Number(e.target.value));
  }

  const switchNetwork = async () => {
    try {
      await provider.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(1666700000) }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await provider.provider.request({
            method: "wallet_addEthereumChain",
            params: [harmonyTestnetParams]
          });
        } catch (error) {
          setError(error);
        }
      }
    }
  };

  const gotoGame = (e) => {
    e.preventDefault();
  }

  const connectToContract = async (e) => {
    const zkHangmanContract = new ethers.Contract(
      gameContract,
      zkHangmanAbi,
      signer
    )

    setContract(zkHangmanContract);

    zkHangmanContract.on("NextTurn", (nextTurn) => {
      console.log("The turn is now: ", nextTurn);
      setTurn(parseInt(nextTurn._hex, 16));
    });

    let playerLives = parseInt(await zkHangmanContract.playerLives(), 16);
    let turn = parseInt(await zkHangmanContract.turn(), 16);
    let _correctGuesses = parseInt(await zkHangmanContract.correctGuesses, 16);
    let host = await zkHangmanContract.host();
    let player = await zkHangmanContract.player();

    console.log("initVerifier: ", await zkHangmanContract.initVerifier());
    console.log("guessVerifier: ", await zkHangmanContract.guessVerifier());

    setLives(playerLives);
    setTurn(turn);
    setContractConnected(true);
    setCorrectGuesses(_correctGuesses)
    setHostAddress(host);
    setPlayerAddress(player);

    setRevealedChars([]);

    for (let i = 0; i < 5; i++) {
      let revealedChar = parseInt((await zkHangmanContract.revealedChars(i))._hex, 16);
      revealedChars.push(revealedChar);
      console.log(revealedChars);
    }
    
  }

  const createGame = async (e) => {
    e.preventDefault();
    const zkHangmanFactoryContract = new ethers.Contract(
      zkHangmanFactoryAddress,
      zkHangmanFactoryAbi,
      signer
    )

    console.log(zkHangmanFactoryContract);
    
    console.log("host address: ", hostAddress);
    console.log("player address: ", playerAddress);
    console.log("init verifier address: ", initVerifierAddress);
    console.log("guess verifier address: ", guessVerifierAddress);
    
        
    let tx = await zkHangmanFactoryContract.createGame(
      hostAddress,
      playerAddress,
      initVerifierAddress,
      guessVerifierAddress
    );

    let txFinalized = await tx.wait();

    let filter = zkHangmanFactoryContract.filters.GameCreated(hostAddress, playerAddress);
    let filterResults = await zkHangmanFactoryContract.queryFilter(filter, -1000);
    let newGameAddress = filterResults[filterResults.length-1].args.gameAddress;
    
    alert(newGameAddress);
  }

  const secretChange = (e) => {
    e.preventDefault();
    setSecret(e.target.value);
  }

  const char1Change = (e) => {
    e.preventDefault();
    setChar1(e.target.value);
  }

  const char2Change = (e) => {
    e.preventDefault();
    setChar2(e.target.value);
  }

  const char3Change = (e) => {
    e.preventDefault();
    setChar3(e.target.value);
  }

  const char4Change = (e) => {
    e.preventDefault();
    setChar4(e.target.value);
  }

  const char5Change = (e) => {
    e.preventDefault();
    setChar5(e.target.value);
  }

  const guessChange = (e) => {
    e.preventDefault();
    setGuess(e.target.value);
  }

  const processGuess = async (e) => {
    e.preventDefault();

    console.log("secret: ", secret);

    const zkHangmanContract = new ethers.Contract(
      gameContract,
      zkHangmanAbi,
      signer
    )

    /*

    console.log("dec turn: ", turn);
    console.log("hex dec output: ", toHex(Math.floor( (turn-1) / 2 ))); 
    */
    let hexLatestGuess = await zkHangmanContract.guesses( toHex(Math.floor( (turn-1) / 2 )) );
    setLatestGuess(parseInt(hexLatestGuess, 16));
    console.log("latest guess: ", parseInt(hexLatestGuess, 16));


    let inputObject = {
      char: BigInt(parseInt(hexLatestGuess, 16)),
      secret: BigInt(secret)
    }

    console.log(inputObject);

    const { proof, publicSignals } =
      await snarkjs.groth16.fullProve(inputObject, "/guess.wasm", "/guess_0001.zkey");

    /*
    const { proof, publicSignals } =
      await groth16.prove("/init_0001.zkey", witness);
      */

    const vkey = await fetch("/guess_verification_key.json").then( (res) => {
      return res.json();
    })

    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    console.log("proof result: ", res);

    console.log(proof);
    console.log(publicSignals);

    const _a = [ toHex(proof.pi_a[0]), toHex(proof.pi_a[1])];
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
    const _c = [ toHex(proof.pi_c[0]), toHex(proof.pi_c[1])];

    const _input = publicSignals.map(x => toHex(x));


    console.log(_a, _b, _c, _input);

    //let tx = await contract.initializeGame([proof.pi_a[0], proof.pi_a[1]], [proof.pi_b[0], proof.pi_b[1]],
    //  [proof.pi_c[0], proof.pi_c[1]], publicSignals);

    let tx = await zkHangmanContract.processGuess(_a, _b, _c, _input);

    console.log(tx);

    let txFinalized = await tx.wait();

    console.log(txFinalized);


  }

  // generate proof for init and call initializeGame
  const generateProof = async (e) => {
    e.preventDefault();

    console.log(secret, char1, char2, char3, char4, char5);
    let parsedChar1 = (char1.toLowerCase()).charCodeAt(0) - 97
    let parsedChar2 = (char2.toLowerCase()).charCodeAt(0) - 97
    let parsedChar3 = (char3.toLowerCase()).charCodeAt(0) - 97
    let parsedChar4 = (char4.toLowerCase()).charCodeAt(0) - 97
    let parsedChar5 = (char5.toLowerCase()).charCodeAt(0) - 97
    console.log(parsedChar1, parsedChar2, parsedChar3, parsedChar4, parsedChar5);

    let inputObject = {
      secret: BigInt(secret),
      char: [BigInt(parsedChar1), BigInt(parsedChar2), BigInt(parsedChar3), 
        BigInt(parsedChar4), BigInt(parsedChar5)]
    }

    console.log(inputObject);

    const zkHangmanContract = new ethers.Contract(
      gameContract,
      zkHangmanAbi,
      signer
    )

    /*
    let witness = await generateWitness(inputObject).then().
      catch( (e) => {
        console.error(e);
      });

    console.log(witness);
    */

    const { proof, publicSignals } =
      await snarkjs.groth16.fullProve(inputObject, "/init.wasm", "/init_0001.zkey");

    /*
    const { proof, publicSignals } =
      await groth16.prove("/init_0001.zkey", witness);
      */

    const vkey = await fetch("/init_verification_key.json").then( (res) => {
      return res.json();
    })

    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    console.log("proof result: ", res);

    console.log(proof);
    console.log(publicSignals);

    const _a = [ toHex(proof.pi_a[0]), toHex(proof.pi_a[1])];
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
    const _c = [ toHex(proof.pi_c[0]), toHex(proof.pi_c[1])];

    const _input = publicSignals.map(x => toHex(x));


    console.log(_a, _b, _c, _input);

    //let tx = await contract.initializeGame([proof.pi_a[0], proof.pi_a[1]], [proof.pi_b[0], proof.pi_b[1]],
    //  [proof.pi_c[0], proof.pi_c[1]], publicSignals);

    let tx = await zkHangmanContract.initializeGame(_a, _b, _c, _input);

    console.log(tx);

    let txFinalized = await tx.wait();

    console.log(txFinalized);
  }

  const submitGuess = async (e) => {
    e.preventDefault();

    const zkHangmanContract = new ethers.Contract(
      gameContract,
      zkHangmanAbi,
      signer
    );

    let guessNumba = (guess.toLowerCase()).charCodeAt(0) - 97;

    let tx = await zkHangmanContract.playerGuess(toHex(guessNumba));

    await tx.wait()
  }

  const parseHex = (hex) => {
    let num = parseInt(hex, 16);
    if (num == 99) {
      return "?";
    } else {
      return String.fromCharCode(97 + num);
    }
  }

  return (
    <>
    <h1>Welcome to zk-hangman (WIP)</h1>
    <div>
    {!account ? ( 
      <button onClick={connectWallet}> connect ur wallet </button> 
    ) : (
      <button onClick={disconnect}> disconnect </button>
    )
    }
    </div>
    <div>
      {account ? (
        <h2> Account {account} </h2>
      ) : (
        <h2> Account: account not connected </h2>
      )}
    </div>
    <div>
    <h2> chainID : {chainId} </h2>
    </div>
    { (chainId != 1666700000 && account) &&
      <button onClick={switchNetwork}> Connect to harmony testnet </button> 
    }
    {
      !contractConnected && (
        <h1> Connecting to contract... </h1>
      )
    }
    <h1> Word characters revealed so far </h1>
    <h2 style={{display:"inline"}}> { rev1 && parseHex(rev1._hex) } </h2>
    <h2 style={{display:"inline"}}> { rev2 && parseHex(rev2._hex) } </h2>
    <h2 style={{display:"inline"}}> { rev3 && parseHex(rev3._hex) } </h2>
    <h2 style={{display:"inline"}}> { rev4 && parseHex(rev4._hex) } </h2>
    <h2 style={{display:"inline"}}> { rev5 && parseHex(rev5._hex) } </h2>

    { (contractConnected && chainId == 1666700000 && account ) &&
      (
      <div>
      <h1> Player lives: { lives } </h1>
      <h1> Correct guesses: { correctGuesses } </h1>
      { account == hostAddress && <h2> Secret: { secret } </h2> }
      <h2> Turn: { turn } </h2>
        { turn == 0 ? <h1> Waiting for host to choose a word and initialize game </h1>
          : turn % 2 == 1 ? <h1> Player's turn! </h1> : <h1> Host's turn! </h1> } 
      </div>
      )
    }
    {
      (contractConnected && chainId == 1666700000 && account == playerAddress && turn % 2 == 1 ) && 
      (
        <div>
        <h1> You're the player. Make a guess! </h1>
          <form onSubmit={submitGuess}>
          <label>
            Guess:
            <input type="text" value={guess} onChange={guessChange} />
          </label>

          <input type="submit" value="Submit" />

        </form>

        </div>
      )
    }
    {
      (contractConnected && chainId == 1666700000 && account == hostAddress && 
        turn != 0 && turn % 2 == 0 ) && (
          <div>
          <h1> you are the host. process the guess. if the value of the secret field above
          is empty, enter the secret you set in the init process! otherwise feel free to
          click submit</h1>
         <label>
            Secret:
            <input type="number" value={secret} onChange={secretChange} />
          </label>
          <button onClick={ processGuess }> PROCESS GUESS </button>
          </div>
        )
    }
    {
      (contractConnected && chainId == 1666700000 && account == hostAddress && turn == 0) && 
      (
        <div>
        <h1> you're the host. initialize the game with a secret word of 5 characters </h1>
        <form onSubmit={generateProof}>
          <label>
            Secret:
            <input type="text" value={secret} onChange={secretChange} />
          </label>
          <label>
            char1:
            <input type="text" value={char1} onChange={char1Change} />
          </label>
          <label>
            char2:
            <input type="text" value={char2} onChange={char2Change} />
          </label>
          <label>
            char3:
            <input type="text" value={char3} onChange={char3Change} />
          </label>
          <label>
            char4:
            <input type="text" value={char4} onChange={char4Change} />
          </label>
          <label>
            char5:
            <input type="text" value={char5} onChange={char5Change} />
          </label>

          <input type="submit" value="Submit" />

        </form>
        </div>
      )
    }


    </>
  )
}

export default HomePage
