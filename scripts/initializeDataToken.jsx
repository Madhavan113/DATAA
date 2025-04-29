import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb/chains";

async function initializeDataToken() {
  const client = createThirdwebClient({
    clientId: "595d02ef4db520c332937163acaa1009", // your real Client ID
  });

  const contract = getContract({
    client,
    chain: defineChain(11155111), // Sepolia
    address: "0x9028ACe5350461A50e2F1A810Ec71d10C9eBB3D0", // your contract address
  });

  const tx = prepareContractCall({
    contract,
    method: "initialize",
    params: [
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "Data Token",          // name
      "DATA",                // symbol
      "",                    // contractURI (leave blank for now)
      [],                    // trustedForwarders (empty)
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // primarySaleRecipient
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // platformFeeRecipient
      0,                     // platformFeeBps
    ],
  });

  const result = await sendTransaction({
    transaction: tx,
    account: undefined, // will open wallet to sign
  });

  console.log("✅ Transaction hash:", result.transactionHash);
}

// call it
initializeDataToken();
