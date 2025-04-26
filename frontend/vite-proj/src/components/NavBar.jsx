import React from 'react';
import { Database } from "lucide-react"; // Assuming you are using lucide-react for icons

// Imports for the new Thirdweb SDK v5
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";

// 1. Define the client (Replace "...." with your actual Client ID)
// NOTE: Ideally, create the client once in your app's entry point (e.g., main.jsx)
// and pass it down or use context, rather than redefining it here.
const client = createThirdwebClient({
  clientId: "595d02ef4db520c332937163acaa1009", // <-- Replace with your actual Client ID
});

// 2. Define the supported wallets
// NOTE: This configuration can also be defined higher up and passed down.
const wallets = [
  inAppWallet({ // Embedded Wallet / Social Login
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        "farcaster",
        "email",
        "x",
        "passkey",
        "phone",
      ],
    },
  }),
  createWallet("io.metamask"), // MetaMask
  createWallet("com.coinbase.wallet"), // Coinbase Wallet
  createWallet("me.rainbow"), // Rainbow Wallet
  createWallet("io.rabby"), // Rabby Wallet
  // Add other wallets as needed: createWallet("...")
];


/**
 * Final Navbar component for the DataDEX application.
 * Displays the application logo/name and the Thirdweb ConnectButton.
 * Uses the newer `thirdweb/react` (v5) SDK components.
 */
export default function NavBar() {
  return (
    // Navigation bar container
    <nav className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 md:px-12 bg-gray-900 bg-opacity-50 border-b border-gray-700">

      {/* Left Section: Logo and Application Name */}
      <div className="flex items-center mb-3 sm:mb-0">
        <Database className="mr-2 h-6 w-6 text-blue-400" />
        <span className="text-xl font-bold text-white">DataDEX</span>
      </div>

      {/* Right Section: Connect Button */}
      <div className="mt-2 sm:mt-0">
        {/*
          Thirdweb's v5 ConnectButton component:
          - Requires the `client` created with your Client ID.
          - Takes the `wallets` array to define connection options.
          - Handles connection flow, displays state, allows disconnect/switch.
        */}
        <ConnectButton
          client={client}
          wallets={wallets}
          theme={"dark"} // Optional: set theme
          connectModal={{ size: "compact" }} // Optional: configure modal
        />
      </div>
    </nav>
  );
}
