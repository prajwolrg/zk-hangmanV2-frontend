import Head from "next/head";
import Web3Modal from "web3modal";
import { useEffect, useState } from "react";
import {
  Button,
} from "@chakra-ui/react";

import TopNav from "../components/TopNav";
import LandingPage from "./LandingPage";

function HomePage() {
  return (
    <div>
      <Head>
        <title> zkHangman </title>
      </Head>
      <TopNav />
      <LandingPage />
    </div>
  );
}

export default HomePage;
