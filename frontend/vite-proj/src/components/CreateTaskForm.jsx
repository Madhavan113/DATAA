import React, { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import {
  getContract,
  createThirdwebClient,
  prepareContractCall,
} from "thirdweb";
import {
  allowance,
  balanceOf,          // 🔹 NEW: ERC-20 helper for balances
} from "thirdweb/extensions/erc20";
import { upload } from "thirdweb/storage";
import { defineChain } from "thirdweb/chains";

import {
  DATA_DEX_CONTRACT_ADDRESS,
  CHAIN,
  CLIENT_ID,
} from "../Landing";
import { DATA_DEX_ABI } from "../abis/DataDEX.abi.js";
import { DATA_TOKEN_ABI } from "../abis/DataTOKEN.abi.js";

export default function CreateTaskForm() {
  const account = useActiveAccount();
  const client = createThirdwebClient({ clientId: CLIENT_ID });

  const [instructions, setInstructions] = useState("");
  const [reward, setReward] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [checkingAllowance, setCheckingAllowance] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState(0n);
  const [rewardAmountWei, setRewardAmountWei] = useState(0n);
  const [walletBalance, setWalletBalance] = useState(0n);

  /* ------------------------------------------------------------------ */
  /* Contracts                                                           */
  /* ------------------------------------------------------------------ */

  const dataDexContract = React.useMemo(() => {
    if (!client) return null;
    return getContract({
      client,
      chain: CHAIN,
      address: DATA_DEX_CONTRACT_ADDRESS,
      abi: DATA_DEX_ABI,
    });
  }, [client]);

  const tokenContract = React.useMemo(() => {
    if (!client) return null;
    return getContract({
      client,
      chain: defineChain(11155111),          // Base Sepolia
      address: "0x9028ACe5350461A50e2F1A810Ec71d10C9eBB3D0",
      abi: DATA_TOKEN_ABI,
    });
  }, [client]);

  /* ------------------------------------------------------------------ */
  /* Handlers                                                            */
  /* ------------------------------------------------------------------ */

  const handleRewardChange = (e) => {
    const value = e.target.value;
    setReward(value);
    setIsApproved(false);

    try {
      setRewardAmountWei(ethers.parseUnits(value || "0", 18));
    } catch (err) {
      console.error("Invalid reward amount:", err);
      setRewardAmountWei(0n);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Allowance + balance watcher                                         */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!account?.address || !tokenContract || rewardAmountWei === 0n) {
      setIsApproved(false);
      setAllowanceAmount(0n);
      setWalletBalance(0n);
      return;
    }

    const checkAllowanceAndBalance = async () => {
      setCheckingAllowance(true);
      setIsApproved(false);

      try {
        // --- allowance ---
        const currentAllowance = await allowance({
          contract: tokenContract,
          owner: account.address,
          spender: DATA_DEX_CONTRACT_ADDRESS,
        });

        // --- balance ---
        const balance = await balanceOf({
          contract: tokenContract,
          address: account.address,
        });

        /* cast to bigint */
        const allowanceBN = BigInt(currentAllowance);
        const balanceBN = BigInt(balance);

        setAllowanceAmount(allowanceBN);
        setWalletBalance(balanceBN);

        if (allowanceBN >= rewardAmountWei) setIsApproved(true);
      } catch (err) {
        console.error("🔥 Failed allowance/balance check:", err);
        setAllowanceAmount(0n);
        setWalletBalance(0n);
      } finally {
        setCheckingAllowance(false);
      }
    };

    checkAllowanceAndBalance();
  }, [account?.address, tokenContract, rewardAmountWei]);

  /* ------------------------------------------------------------------ */
  /* Transactions                                                        */
  /* ------------------------------------------------------------------ */

  const prepareApprovalTx = useCallback(() => {
    if (
      isApproved ||
      rewardAmountWei === 0n ||
      !account ||
      !tokenContract
    )
      return;

    return prepareContractCall({
      contract: tokenContract,
      method:
        "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
      params: [DATA_DEX_CONTRACT_ADDRESS, rewardAmountWei],
    });
  }, [account, tokenContract, rewardAmountWei, isApproved]);

  const prepareCreateTaskTx = useCallback(() => {
    if (
      !isApproved ||
      !ipfsCid ||
      rewardAmountWei === 0n ||
      !account ||
      !dataDexContract
    )
      return;

    return prepareContractCall({
      contract: dataDexContract,
      method: "createTask",
      params: [ipfsCid, rewardAmountWei.toString(), instructions || ""],
    });
  }, [
    account,
    dataDexContract,
    isApproved,
    ipfsCid,
    rewardAmountWei,
    instructions,
  ]);

  /* ------------------------------------------------------------------ */
  /* IPFS upload                                                         */
  /* ------------------------------------------------------------------ */

  const uploadToIPFS = async (file) => {
    if (!file) return;
    try {
      const [uri] = await upload({ client, files: [file] });
      setIpfsCid(uri.replace("ipfs://", ""));
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error("IPFS upload failed:", err);
      alert(`Image upload failed: ${err.message}`);
    }
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                  */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-5">
      {/* Instructions */}
      <div className="mb-4">
        <label
          htmlFor="instructions"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Task Instructions:
        </label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
          rows={4}
          placeholder="Provide clear instructions for the annotator..."
        />
      </div>

      {/* File upload */}
      <div className="mb-4">
        <label
          htmlFor="datasetFile"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Upload Dataset Image:
        </label>
        <input
          type="file"
          id="datasetFile"
          accept="image/*"
          onChange={(e) => uploadToIPFS(e.target.files?.[0])}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
        {ipfsCid && (
          <p className="text-xs text-green-400 mt-1 break-all">
            Uploaded CID: {ipfsCid}
          </p>
        )}
      </div>

      {/* Reward */}
      <div className="mb-4">
        <label
          htmlFor="reward"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Reward Amount ($DATA):
        </label>
        <input
          type="number"
          id="reward"
          value={reward}
          onChange={handleRewardChange}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
          placeholder="e.g., 100"
          min="0"
          step="any"
        />
        {account && rewardAmountWei !== 0n && (
          <p className="text-xs mt-1 text-gray-400">
            Balance: {ethers.formatUnits(walletBalance, 18)} $DATA <br />
            {checkingAllowance
              ? "Checking allowance..."
              : isApproved
              ? `Allowance sufficient (${ethers.formatUnits(
                  allowanceAmount,
                  18
                )} $DATA)`
              : `Needs approval. Current allowance: ${ethers.formatUnits(
                  allowanceAmount,
                  18
                )} $DATA`}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col space-y-3 pt-2">
        {!isApproved && rewardAmountWei !== 0n && (
          <TransactionButton
            transaction={prepareApprovalTx}
            disabled={checkingAllowance}
            theme="light"
            className={`w-full px-4 py-2 rounded font-semibold ${
              checkingAllowance
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700 text-black"
            }`}
            onTransactionConfirmed={() => {
              setIsApproved(true);
              setAllowanceAmount(rewardAmountWei);
              alert("Approval successful! You can now create the task.");
            }}
            onError={(err) => {
              console.error("Approval failed:", err);
              alert(`Approval failed: ${err.message}`);
            }}
          >
            {checkingAllowance ? "Checking..." : `1. Approve ${reward || "0"} $DATA`}
          </TransactionButton>
        )}

        <TransactionButton
          transaction={prepareCreateTaskTx}
          disabled={!isApproved || !ipfsCid || rewardAmountWei === 0n || !account}
          theme="dark"
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed py-2.5 px-4 rounded font-semibold"
          onTransactionConfirmed={() => {
            alert("Task created successfully!");
            setInstructions("");
            setReward("");
            setIpfsCid("");
            setIsApproved(false);
            setRewardAmountWei(0n);
            setAllowanceAmount(0n);
            setWalletBalance(0n);
          }}
          onError={(err) => {
            console.error("Task creation failed:", err);
            alert(`Task creation failed: ${err.message}`);
          }}
        >
          {isApproved ? "2. Create Task" : "Create Task (Approval Needed)"}
        </TransactionButton>
      </div>
    </div>
  );
}
