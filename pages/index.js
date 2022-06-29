import Head from "next/head";
import Web3Modal from "web3modal";
import { useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";

import TopNav from "../components/TopNav";
import LandingPage from "./LandingPage";
import AlphabetList from "../components/AlphabetList";

function HomePage() {
  return (
    <div>
      <Head>
        <title> zkHangman </title>
      </Head>
      <TopNav />
      <LandingPage />
      <AlphabetList guesses={['a', 'b', 'c']} revealedKeys={['a', '?', '?', '?', '?']}/>
    </div>
  );
}

export default HomePage;
