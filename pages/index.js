import { ethers } from "ethers";
import { useEffect } from "react";
import Script from "next/script";

function HomePage() {
  useEffect(() => {
      
  }
  return (
      <>
      <Script
        src="snarkjs.min.js"
      />
      <div>Welcome to Next.js!</div>
      </>
  )
}

export default HomePage
