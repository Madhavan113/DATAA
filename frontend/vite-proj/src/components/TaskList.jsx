import React, { useState } from 'react';
import { ethers } from 'ethers';

// --- Thirdweb v5 Imports ---
import { useReadContract } from "thirdweb/react";
import { getContract, createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains"; // for CHAIN

// --- Import ABI ---
import { DATA_DEX_ABI } from '../abis/DataDEX.abi.js';

// --- Component for Annotation ---
import AnnotationView from './AnnotationView';

// --- Hardcoded Constants (NO import from Landing.js anymore) ---
const CLIENT_ID = "595d02ef4db520c332937163acaa1009";
const DATA_DEX_CONTRACT_ADDRESS = "0x72b5fc9eced3157674a187d30c7d36bdad950b9d";
const CHAIN = baseSepolia;

// --- Create Thirdweb Client ---
const client = createThirdwebClient({
  clientId: CLIENT_ID,
});

// --- Task Status Mapping ---
const TASK_STATUS_MAP = ['Created', 'Claimed', 'Submitted', 'Verified', 'Canceled', 'Rejected'];

export default function TaskList() {
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // --- Get the Contract Instance ---
  const contract = getContract({
    client,
    chain: CHAIN,
    address: DATA_DEX_CONTRACT_ADDRESS,
    abi: DATA_DEX_ABI,
  });

  // --- Read Available Tasks ---
  const {
    data: availableTasks,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useReadContract({
    contract: contract,
    method: "getAvailableTasks",
    params: [],
  });

  // --- Render if a Task is Selected ---
  if (selectedTaskId) {
    return (
      <AnnotationView
        taskId={selectedTaskId}
        onBack={() => setSelectedTaskId(null)}
      />
    );
  }

  // --- Main Render (Task List) ---
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

      {/* Tasks List */}
      {!isLoadingTasks && !tasksError && (
        <>
          {(!availableTasks || availableTasks.length === 0) ? (
            <div className="text-center text-gray-500 py-4">No tasks currently available for annotation.</div>
          ) : (
            <ul className="space-y-3">
              {availableTasks.map((task) => (
                <li key={task.id.toString()} className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow hover:bg-gray-700 transition duration-150 ease-in-out">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-semibold text-lg text-blue-300">Task ID: {task.id.toString()}</p>
                      <p className="text-sm text-green-400">
                        Reward: {ethers.formatUnits(task.rewardAmount, 18)} $DATA
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Status: {TASK_STATUS_MAP[task.status] || 'Unknown'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTaskId(task.id)}
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
