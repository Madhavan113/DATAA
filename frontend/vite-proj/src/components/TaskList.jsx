import React, { useState } from 'react';
import { ethers } from 'ethers'; // For formatting token amounts

// --- Thirdweb v5 Imports ---
import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";

// Import configuration from LandingPage or a dedicated config file
import { DATA_DEX_CONTRACT_ADDRESS, CHAIN, CLIENT_ID } from '../Landing'; // Adjust path if needed

// Import the component to view/perform annotation (we'll create this next)
import AnnotationView from './AnnotationView';

// --- Helper: Define the ABI fragment for the functions we'll read ---
// You need to provide the correct ABI definition for your contract functions
// This tells the SDK how to encode/decode the data for these functions.
// Get this from your compiled contract artifacts (e.g., in hardhat/artifacts/...)

// Mapping for Task Status Enum (ensure order matches your Solidity enum)
const TASK_STATUS_MAP = ['Created', 'Claimed', 'Submitted', 'Verified', 'Canceled', 'Rejected'];
import { DATA_DEX_ABI } from '../abis/DataDEX.abi.js'; // Adjust path if needed


/**
 * TaskList Component
 * Fetches and displays available annotation tasks from the DataDEX smart contract.
 * Allows selection of a task to view details and perform annotation.
 */
export default function TaskList() {
  // State to store the ID of the task selected by the user
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Get the DataDEX contract instance
  const contract = getContract({
    client: { clientId: CLIENT_ID }, // Pass client config
    chain: CHAIN,
    address: DATA_DEX_CONTRACT_ADDRESS,
    // Provide the ABI for the contract if not using standard extensions
    abi: DATA_DEX_ABI,
  });

  // Read available tasks from the contract using useReadContract hook
  const {
    data: availableTasks, // The data returned by the contract function
    isLoading: isLoadingTasks, // Boolean indicating if data is loading
    error: tasksError, // Error object if the read fails
  } = useReadContract({
    contract: contract,
    method: "getAvailableTasks", // The name of the function in your ABI
    params: [], // Arguments for the function (empty for getAvailableTasks)
  });

  // --- Render Logic ---

  // If a task is selected, render the AnnotationView component
  if (selectedTaskId) {
    return (
      <AnnotationView
        taskId={selectedTaskId}
        // Pass a function to allow AnnotationView to go back to the list
        onBack={() => setSelectedTaskId(null)}
      />
    );
  }

  // --- Display Task List ---
  return (
    <div className="space-y-4">
      {/* Loading State */}
      {isLoadingTasks && (
        <div className="text-center text-gray-400 py-4">Loading available tasks...</div>
      )}

      {/* Error State */}
      {tasksError && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> Could not load tasks. {tasksError.message}</span>
        </div>
      )}

      {/* Success State (Tasks Loaded) */}
      {!isLoadingTasks && !tasksError && (
        <>
          {/* Check if there are any tasks */}
          {(!availableTasks || availableTasks.length === 0) ? (
            <div className="text-center text-gray-500 py-4">No tasks currently available for annotation.</div>
          ) : (
            // Render the list of tasks
            <ul className="space-y-3">
              {availableTasks.map((task) => (
                <li key={task.id.toString()} className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow hover:bg-gray-700 transition duration-150 ease-in-out">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    {/* Task Info */}
                    <div className="mb-2 sm:mb-0">
                      <p className="font-semibold text-lg text-blue-300">Task ID: {task.id.toString()}</p>
                      {/* Format reward amount using ethers.js (assuming 18 decimals) */}
                      <p className="text-sm text-green-400">
                        Reward: {ethers.utils.formatUnits(task.rewardAmount, 18)} $DATA
                      </p>
                      {/* Display status using the map */}
                      <p className="text-xs text-gray-400 mt-1">
                        Status: {TASK_STATUS_MAP[task.status] || 'Unknown'}
                      </p>
                       {/* Optionally display instructions snippet */}
                       {/* <p className="text-xs text-gray-400 mt-1 truncate w-64">Instructions: {task.instructions}</p> */}
                    </div>
                    {/* Action Button */}
                    <button
                      onClick={() => setSelectedTaskId(task.id)} // Set the selected task ID on click
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition duration-150 ease-in-out shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 w-full sm:w-auto"
                    >
                      View & Annotate
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
