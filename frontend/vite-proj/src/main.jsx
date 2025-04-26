// src/main.jsx (Should look something like this)
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

import Landing from './Landing.jsx'; // Fixed component name to match Landing.jsx
import Navbar from './components/NavBar.jsx'; // Your Navbar
import './index.css';

// Create the Thirdweb client using ONLY the clientId
const client = createThirdwebClient({
  clientId: "595d02ef4db520c332937163acaa1009", // Your Client ID
  secretKey: "npRfS00ltxhMuFZAe7NeeAxFvU_hU6Xpoa9nRQOc2YUdPnCAjrE_HvFIbFil_4bbiTr3GL3eSwnd1TBpYRlxuw"
});

// Define the chain for contract interactions (Base Sepolia)
// You'll pass this chain object to contract-related hooks/functions later
// import { baseSepolia } from "thirdweb/chains";
// const activeChain = baseSepolia; // Or define chain object manually if needed

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThirdwebProvider> {/* No props needed like the old provider */}
      <Navbar /> {/* Render Navbar */}
      <Landing /> {/* Fixed component name to match Landing.jsx */}
    </ThirdwebProvider>
  </React.StrictMode>
);




