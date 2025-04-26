import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers'; // For handling token amounts (BigNumber, parseUnits)

// --- Thirdweb v5 Imports ---
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, createThirdwebClient, prepareContractCall } from "thirdweb"; // Import prepareContractCall
import { approve, allowance } from "thirdweb/extensions/erc20"; // Specific functions for ERC20
// We likely don't need prepareTransaction or encodeFunctionData anymore for createTask

// Import configuration from Landing component
import {
  DATA_DEX_CONTRACT_ADDRESS,
  DATA_TOKEN_CONTRACT_ADDRESS,
  CHAIN,
  CLIENT_ID,
} from '../Landing'; // Fixed import path
import { DATA_DEX_ABI } from '../abis/DataDEX.abi.js';


// --- ABI Definition ---
// It's good practice to keep this here or import from a JSON file
// Ensure it includes 'createTask' function definition


/**
 * CreateTaskForm Component
 * Allows requestors to create new annotation tasks, handling token approval
 * and the task creation transaction.
 */
export default function CreateTaskForm() {
  // --- Hooks ---
  const account = useActiveAccount(); // Get connected account details
  // NOTE: Ideally, the client should be created once higher up and passed down/context used.
  const client = createThirdwebClient({ clientId: CLIENT_ID }); // Create client instance

  // --- State Variables ---
  const [instructions, setInstructions] = useState('');
  const [reward, setReward] = useState(''); // User input for reward (string)
  const [ipfsCid, setIpfsCid] = useState(''); // For dataset CID (using text input for demo)
  const [isApproved, setIsApproved] = useState(false); // Tracks if sufficient allowance is set
  const [checkingAllowance, setCheckingAllowance] = useState(false); // Loading state for allowance check
  const [allowanceAmount, setAllowanceAmount] = useState(ethers.BigNumber.from(0)); // Current allowance
  // Keep using ethers.BigNumber for calculations if needed, but convert for prepareContractCall
  const [rewardAmountWei, setRewardAmountWei] = useState(ethers.BigNumber.from(0));

  // --- Contract Instances ---
  // Memoize contract instances to avoid re-creation on every render
  const dataDexContract = React.useMemo(() => {
    if (!client) return null; // Handle client potentially being undefined initially
    return getContract({
      client,
      chain: CHAIN,
      address: DATA_DEX_CONTRACT_ADDRESS,
      abi: DATA_DEX_ABI // <-- Pass the ABI here as per Docs Option B
    });
  }, [client]); // Dependencies: client

  const tokenContract = React.useMemo(() => {
    if (!client) return null;
    // We still need the token contract for approval
    return getContract({
      client,
      chain: CHAIN,
      address: DATA_TOKEN_CONTRACT_ADDRESS
      // ABI for approve/allowance is usually inferred or standard
    });
  }, [client]); // Dependencies: client

  // --- Handlers ---
  // Update reward state and convert to Wei
  const handleRewardChange = (e) => {
    const value = e.target.value;
    setReward(value);
    setIsApproved(false); // Reset approval status when amount changes
    try {
      // Still use parseUnits for internal state representation if helpful
      const amountInWei = ethers.utils.parseUnits(value || "0", 18); // Assuming 18 decimals
      setRewardAmountWei(amountInWei);
    } catch (error) {
      console.error("Invalid reward amount format:", error);
      setRewardAmountWei(ethers.BigNumber.from(0));
    }
  };

  // --- Check Allowance Effect ---
  // (This effect remains largely the same, checking allowance against rewardAmountWei)
  useEffect(() => {
    if (!account?.address || !tokenContract || rewardAmountWei.isZero()) {
      setIsApproved(false);
      setAllowanceAmount(ethers.BigNumber.from(0));
      return;
    }

    const check = async () => {
      setCheckingAllowance(true);
      setIsApproved(false); // Assume not approved until check confirms
      try {
        const currentAllowance = await allowance({
          contract: tokenContract,
          owner: account.address,
          spender: DATA_DEX_CONTRACT_ADDRESS,
        });
        // Use ethers.BigNumber for comparison logic
        const allowanceBN = ethers.BigNumber.from(currentAllowance);
        setAllowanceAmount(allowanceBN); // Store current allowance as BigNumber
        if (allowanceBN.gte(rewardAmountWei)) {
          setIsApproved(true);
          console.log("Allowance sufficient:", ethers.utils.formatUnits(allowanceBN, 18));
        } else {
           console.log("Insufficient allowance:", ethers.utils.formatUnits(allowanceBN, 18), "needed:", ethers.utils.formatUnits(rewardAmountWei, 18));
        }
      } catch (error) {
        console.error("Failed to check allowance:", error);
        setAllowanceAmount(ethers.BigNumber.from(0)); // Reset on error
      } finally {
        setCheckingAllowance(false);
      }
    };

    check();
    // Dependencies: check when account, contracts, or reward amount changes
  }, [account?.address, tokenContract, rewardAmountWei]); // Removed dataDexContract dependency as it's not used here

  // --- Prepare Transactions ---
  // Prepare the Approval Transaction (Uses approve extension - no change needed here)
  const prepareApprovalTx = useCallback(() => {
    if (isApproved || rewardAmountWei.isZero() || !account || !tokenContract) return undefined;

    console.log(`Preparing approval for ${rewardAmountWei.toString()} wei`);
    // Use the specific `approve` function from thirdweb/extensions/erc20
    return approve({ // This is already a prepared transaction helper
        contract: tokenContract,
        spender: DATA_DEX_CONTRACT_ADDRESS,
        amountWei: rewardAmountWei.toString(), // Approve expects string or bigint
    });
    // Note: `approve` helper likely doesn't need explicit prepareTransaction wrapper,
    // but check docs if TransactionButton requires it. If approve returns the prepared tx,
    // this is simpler. Assuming TransactionButton handles the extension format.
  }, [account, tokenContract, rewardAmountWei, isApproved]); // Removed client & dataDexContract from deps

  // Prepare the Create Task Transaction using prepareContractCall
  const prepareCreateTaskTx = useCallback(() => {
    // Don't prepare if not approved, missing info, reward is zero, or not connected
    // Also check if dataDexContract instance is ready
    if (!isApproved || !ipfsCid || rewardAmountWei.isZero() || !account || !dataDexContract) {
        return undefined;
    }

    // Convert rewardAmountWei (ethers.BigNumber) to string for prepareContractCall params
    const rewardString = rewardAmountWei.toString();

    console.log(`Preparing createTask with: CID=${ipfsCid}, Reward=${rewardString}, Instructions=${instructions}`);

    // Use prepareContractCall
    return prepareContractCall({
        contract: dataDexContract, // The contract instance (with ABI included via getContract)
        method: "createTask",     // Method name (autocompletion if ABI provided)
        params: [                 // Params array in correct order
            ipfsCid,
            rewardString,         // Pass reward amount as string
            instructions || ""
        ],
    });
  }, [account, dataDexContract, isApproved, ipfsCid, rewardAmountWei, instructions]); // Dependencies


  // --- Render ---
  return (
    <div className="space-y-5">
      {/* Instructions Input */}
      <div className="mb-4">
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-300 mb-1">
          Task Instructions:
        </label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          rows={4}
          placeholder="Provide clear instructions for the annotator..."
        />
      </div>

      {/* IPFS CID Input (Placeholder for demo - replace with actual upload logic) */}
      <div className="mb-4">
        <label htmlFor="ipfsCid" className="block text-sm font-medium text-gray-300 mb-1">
          Dataset IPFS CID:
        </label>
        <input
          type="text"
          id="ipfsCid"
          value={ipfsCid}
          onChange={(e) => setIpfsCid(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          placeholder="Qm... or bafy..."
        />
        <p className="text-xs text-gray-500 mt-1">For demo, paste a valid IPFS CID here.</p>
      </div>

      {/* Reward Amount Input */}
      <div className="mb-4">
        <label htmlFor="reward" className="block text-sm font-medium text-gray-300 mb-1">
          Reward Amount ($DATA):
        </label>
        <input
          type="number"
          id="reward"
          value={reward}
          onChange={handleRewardChange} // Use the handler to update Wei value
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          placeholder="e.g., 100"
          min="0"
          step="any" // Allow decimals in input
        />
        {/* Display current allowance status */}
        {account && !rewardAmountWei.isZero() && (
            <p className={`text-xs mt-1 ${isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
                {checkingAllowance ? 'Checking allowance...' :
                 isApproved ? `Allowance sufficient (${ethers.utils.formatUnits(allowanceAmount, 18)} $DATA)` :
                 `Needs approval. Current allowance: ${ethers.utils.formatUnits(allowanceAmount, 18)} $DATA`
                }
            </p>
        )}
      </div>

      {/* --- Transaction Buttons --- */}
      <div className="flex flex-col space-y-3 pt-2">
        {/* 1. Approve Button */}
        {!isApproved && !rewardAmountWei.isZero() && (
          <TransactionButton
            transaction={prepareApprovalTx} // Pass the prepared approval tx from the 'approve' extension
            disabled={checkingAllowance} // Disable while checking
            theme="light"
            className={`w-full px-4 py-2 rounded font-semibold transition duration-150 ease-in-out shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 ${checkingAllowance ? 'bg-gray-500 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 text-black'}`}
            onTransactionConfirmed={() => {
              console.log("Approval successful!");
              setIsApproved(true); // Set state to allow task creation
              // Update displayed allowance optimistically
              setAllowanceAmount(rewardAmountWei);
              alert("Approval successful! You can now create the task.");
            }}
            onError={(error) => {
              console.error("Approval failed:", error);
              alert(`Approval failed: ${error.message}`);
            }}
          >
            {checkingAllowance ? 'Checking...' : `1. Approve ${reward || '0'} $DATA`}
          </TransactionButton>
        )}

        {/* 2. Create Task Button */}
        <TransactionButton
            transaction={prepareCreateTaskTx} // Pass the prepared create task tx using prepareContractCall
            disabled={!isApproved || !ipfsCid || rewardAmountWei.isZero() || !account}
            theme="dark"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:opacity-70 disabled:cursor-not-allowed transition duration-150 ease-in-out py-2.5 px-4 rounded font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            onTransactionConfirmed={() => {
                console.log("Task creation successful!");
                alert("Task created successfully!");
                // Reset form state after successful creation
                setInstructions('');
                setReward('');
                setIpfsCid('');
                setIsApproved(false);
                setRewardAmountWei(ethers.BigNumber.from(0));
                setAllowanceAmount(ethers.BigNumber.from(0));
            }}
            onError={(error) => {
                console.error("Task creation failed:", error);
                alert(`Task creation failed: ${error.message}`);
            }}
        >
          {isApproved ? '2. Create Task' : 'Create Task (Approval Needed)'}
        </TransactionButton>
      </div>

    </div>
  );
}