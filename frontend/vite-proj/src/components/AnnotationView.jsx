import React, { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers'; // For formatting amounts

// --- Thirdweb v5 Imports ---
import { useReadContract, useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, createThirdwebClient } from "thirdweb"; // <-- Import prepareContractCall

// Import configuration from Landing component
import { DATA_DEX_CONTRACT_ADDRESS, CHAIN, CLIENT_ID } from '../Landing'; // Fixed import path

// --- Import ABI ---
// Assuming you created this file and exported the ABI constant
import { DATA_DEX_ABI } from '../abis/DataDEX.abi.js';

// Mapping for Task Status Enum
const TASK_STATUS_MAP = ['Created', 'Claimed', 'Submitted', 'Verified', 'Canceled', 'Rejected'];

/**
 * AnnotationView Component
 * Displays details of a selected task and allows the annotator to submit their work or claim rewards.
 */
export default function AnnotationView({ taskId, onBack }) {
  const account = useActiveAccount(); // Get connected account info
  // NOTE: Ideally, the client should be created once higher up and passed down/context used.
  const client = createThirdwebClient({ clientId: CLIENT_ID });

  // State for the annotation result (using simple text input for CID placeholder)
  const [resultCid, setResultCid] = useState('');
  // TODO: Add state for actual annotation data and IPFS upload logic

  // --- Contract Instance ---
  // Memoize contract instance, using the imported ABI
  const contract = useMemo(() => {
    // Ensure client is defined before creating contract instance
    if (!client) return null;
    return getContract({
      client,
      chain: CHAIN,
      address: DATA_DEX_CONTRACT_ADDRESS,
      abi: DATA_DEX_ABI, // <-- Use imported ABI here
    });
  }, [client]); // Dependency: client

  // --- Read Task Details ---
  const {
    data: taskDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
    // Consider adding refetch capability if needed after actions
  } = useReadContract({
    contract: contract, // Pass contract instance with ABI
    method: "getTaskDetails", // Function name from ABI
    params: [taskId], // Pass the taskId as argument
    // Ensure taskId is in a compatible format (number, string, bigint)
  });

  // --- Handlers ---
  const handleDownload = () => {
    if (taskDetails?.ipfsCid) {
      // Basic IPFS gateway link - replace with your preferred gateway or direct fetch logic
      const url = `https://ipfs.io/ipfs/${taskDetails.ipfsCid}`;
      window.open(url, '_blank');
      console.log(`Opening dataset from IPFS: ${url}`);
    } else {
      alert("Dataset IPFS CID not available.");
    }
  };

  // --- Prepare Submit Annotation Transaction using prepareContractCall ---
  const prepareSubmitTx = useCallback(() => {
    // Basic validation
    if (!account || !taskId || !resultCid || !contract) {
        return undefined;
    }

    // Basic validation for CID format (optional but recommended)
    if (!resultCid.startsWith('Qm') && !resultCid.startsWith('bafy')) {
        console.warn("Result CID might not be in a valid IPFS format.");
    }

    console.log("Preparing submitAnnotation transaction with:", { taskId, resultCid });

    // Use prepareContractCall
    return prepareContractCall({
        contract: contract,       // Contract instance with ABI
        method: "submitAnnotation", // Method name string from ABI
        params: [taskId, resultCid] // Params array - ensure taskId is compatible type
    });
  }, [account, taskId, resultCid, contract]); // Dependencies

  // --- Prepare Claim Reward Transaction using prepareContractCall ---
  const prepareClaimRewardTx = useCallback(() => {
    // Ensure all necessary data is available
    if (!account || !taskId || !contract || taskDetails?.status !== 3 || taskDetails?.annotator !== account?.address) {
        return undefined;
    }
    console.log("Preparing claimReward transaction for task:", taskId);

    // Use prepareContractCall for claimReward
    return prepareContractCall({
        contract: contract,
        method: "claimReward", // Method name for claiming from ABI
        params: [taskId]       // Params for claimReward
    });
  }, [account, taskId, contract, taskDetails?.status, taskDetails?.annotator]);


  // --- Render Logic ---

  // Loading state for task details
  if (isLoadingDetails) {
    return (
      <div className="p-4 text-center text-gray-400">Loading task details...</div>
    );
  }

  // Error state for task details
  if (detailsError) {
    return (
      <div className="m-4 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded" role="alert">
        <strong className="font-bold">Error loading details:</strong>
        <span className="block sm:inline"> {detailsError.message}</span>
        <button onClick={onBack} className="ml-4 text-sm underline">Back to list</button>
      </div>
    );
  }

  // If contract instance isn't ready yet (client might still be initializing)
  if (!contract) {
    return <div className="p-4 text-center text-gray-400">Initializing contract...</div>;
  }

  // If task details not found or invalid ID (handle potential undefined taskDetails)
  if (!taskDetails || !taskDetails.id || ethers.BigNumber.from(taskDetails.id).isZero()) {
     return (
       <div className="p-4 text-center text-gray-500">
         Task not found or invalid Task ID.
         <button onClick={onBack} className="block mx-auto mt-2 text-sm text-blue-400 underline">Back to list</button>
       </div>
     );
  }

  // Check if the current user is the assigned annotator (needed for submission/claim checks)
  // Use lowercase comparison for addresses
  const isCurrentUserAnnotator = account?.address?.toLowerCase() === taskDetails.annotator?.toLowerCase();
  const canSubmit = [0, 1].includes(taskDetails.status); // Created or Claimed
  const canClaim = taskDetails.status === 3 && isCurrentUserAnnotator; // Verified and user is annotator


  // --- Display Task Details and Annotation Form ---
  return (
    <div className="space-y-5">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="bg-gray-600 hover:bg-gray-700 px-4 py-1.5 rounded text-sm font-medium transition duration-150 ease-in-out shadow hover:shadow-md"
      >
        &larr; Back to Task List
      </button>

      {/* Task Details Section */}
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-md space-y-3">
        <h3 className="text-xl font-semibold text-blue-300">Task Details (ID: {taskDetails.id.toString()})</h3>
        <div>
          <label className="block text-xs font-medium text-gray-400">Instructions:</label>
          <p className="text-sm text-gray-200 bg-gray-700 p-2 rounded mt-1 whitespace-pre-wrap">{taskDetails.instructions || "N/A"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400">Reward:</label>
          {/* Ensure rewardAmount is valid before formatting */}
          <p className="text-sm text-green-400">
              {taskDetails.rewardAmount ? ethers.utils.formatUnits(taskDetails.rewardAmount, 18) : '0'} $DATA
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400">Status:</label>
          <p className="text-sm text-yellow-400">{TASK_STATUS_MAP[taskDetails.status] ?? 'Unknown'}</p>
        </div>
        <div>
           <label className="block text-xs font-medium text-gray-400">Dataset CID:</label>
           <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm font-mono text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded text-xs truncate">{taskDetails.ipfsCid || "N/A"}</span>
              <button
                 onClick={handleDownload}
                 disabled={!taskDetails.ipfsCid}
                 className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-medium transition duration-150 ease-in-out shadow"
              >
                 Download
              </button>
           </div>
        </div>
         <div>
           <label className="block text-xs font-medium text-gray-400">Requestor:</label>
           <p className="text-sm font-mono text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded text-xs truncate">{taskDetails.requestor}</p>
         </div>
         {/* Display Annotator if task is claimed or beyond */}
         {taskDetails.status > 0 && taskDetails.annotator && taskDetails.annotator !== ethers.constants.AddressZero && (
             <div>
               <label className="block text-xs font-medium text-gray-400">Annotator:</label>
               <p className="text-sm font-mono text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded text-xs truncate">
                   {taskDetails.annotator}
                   {isCurrentUserAnnotator && " (You)"}
                </p>
             </div>
         )}
      </div>

      {/* Annotation Submission Section */}
      {/* Only show submission if task status allows (Created or Claimed) */}
      {/* TODO: Add logic for *claiming* the task first if status is 'Created' */}
      {canSubmit && (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-md space-y-3">
          <h3 className="text-xl font-semibold text-blue-300">Perform Annotation</h3>

          {/* Placeholder for actual annotation tools/interface */}
          <div className="my-4 p-4 border border-dashed border-gray-600 rounded min-h-[100px]">
            <p className="text-center text-gray-500 italic">
              (Annotation tools/interface would go here based on task type)
            </p>
          </div>

          {/* Input for Result CID (Placeholder - replace with actual upload logic) */}
          <div>
            <label htmlFor="resultCid" className="block text-sm font-medium text-gray-300 mb-1">
              Annotation Result IPFS CID:
            </label>
            <input
              type="text"
              id="resultCid"
              value={resultCid}
              onChange={(e) => setResultCid(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter IPFS CID of your result (e.g., Qm... or bafy...)"
            />
            <p className="text-xs text-gray-500 mt-1">For demo, paste a placeholder CID here after simulating upload.</p>
          </div>

          {/* Submit Button */}
          <TransactionButton
            transaction={prepareSubmitTx} // Pass the prepared transaction
            disabled={!resultCid} // Disable if no result CID is entered
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white transition duration-150 ease-in-out py-2 px-4 rounded font-medium shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
            onTransactionConfirmed={() => {
              alert("Annotation submitted successfully!");
              // Optionally clear state or navigate back
              setResultCid('');
              onBack(); // Go back to the list after successful submission
            }}
            onError={(error) => {
              console.error("Submission failed:", error);
              alert(`Submission failed: ${error.message}`);
            }}
          >
            Submit Annotation Result
          </TransactionButton>
        </div>
      )}

       {/* Section for Claiming Reward (if task is verified and user is annotator) */}
       {canClaim && (
         <div className="p-4 bg-green-900 bg-opacity-50 rounded-lg border border-green-700 shadow-md space-y-3">
            <h3 className="text-xl font-semibold text-green-300">Claim Reward</h3>
            <p className="text-sm text-green-200">Your annotation has been verified!</p>
            <TransactionButton
                transaction={prepareClaimRewardTx} // Pass the prepared claim reward tx
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white transition duration-150 ease-in-out py-2 px-4 rounded font-medium shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                onTransactionConfirmed={() => {
                  alert("Reward claimed successfully!");
                  // Optionally navigate back or update UI
                  onBack(); // Go back to list after claiming
                }}
                onError={(error) => {
                  console.error("Reward claim failed:", error);
                  alert(`Reward claim failed: ${error.message}`);
                }}
            >
               Claim {taskDetails.rewardAmount ? ethers.utils.formatUnits(taskDetails.rewardAmount, 18) : '0'} $DATA
            </TransactionButton>
         </div>
       )}

    </div>
  );
}