import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, createThirdwebClient, prepareContractCall } from "thirdweb";
import { approve, allowance } from "thirdweb/extensions/erc20";
import { upload } from "thirdweb/storage";

import {
  DATA_DEX_CONTRACT_ADDRESS,
  DATA_TOKEN_CONTRACT_ADDRESS,
  CHAIN,
  CLIENT_ID,
} from '../Landing';
import { DATA_DEX_ABI } from '../abis/DataDEX.abi.js';

export default function CreateTaskForm() {
  const account = useActiveAccount();
  const client = createThirdwebClient({ clientId: CLIENT_ID });

  const [instructions, setInstructions] = useState('');
  const [reward, setReward] = useState('');
  const [ipfsCid, setIpfsCid] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [checkingAllowance, setCheckingAllowance] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState(0n);
  const [rewardAmountWei, setRewardAmountWei] = useState(0n);
  const [walletBalance, setWalletBalance] = useState(0n);

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
      chain: CHAIN,
      address: DATA_TOKEN_CONTRACT_ADDRESS,
    });
  }, [client]);

  const handleRewardChange = (e) => {
    const value = e.target.value;
    setReward(value);
    setIsApproved(false);
    try {
      const amountInWei = ethers.parseUnits(value || "0", 18);
      setRewardAmountWei(amountInWei);
    } catch (error) {
      console.error("Invalid reward amount format:", error);
      setRewardAmountWei(0n);
    }
  };

  useEffect(() => {
    if (!account?.address || !tokenContract || rewardAmountWei === 0n) {
      setIsApproved(false);
      setAllowanceAmount(0n);
      setWalletBalance(0n);
      return;
    }

    const check = async () => {
      setCheckingAllowance(true);
      setIsApproved(false);
      try {
        const currentAllowance = await allowance({
          contract: tokenContract,
          owner: account.address,
          spender: DATA_DEX_CONTRACT_ADDRESS,
        });
        const balance = await tokenContract.read.balanceOf([account.address]);
        const allowanceBN = BigInt(currentAllowance);
        const balanceBN = BigInt(balance);
        setAllowanceAmount(allowanceBN);
        setWalletBalance(balanceBN);

        if (allowanceBN >= rewardAmountWei) {
          setIsApproved(true);
        }
      } catch (error) {
        console.error("Failed to check allowance or balance:", error);
        setAllowanceAmount(0n);
        setWalletBalance(0n);
      } finally {
        setCheckingAllowance(false);
      }
    };

    check();
  }, [account?.address, tokenContract, rewardAmountWei]);

  const prepareApprovalTx = useCallback(() => {
    if (isApproved || rewardAmountWei === 0n || !account || !tokenContract) return undefined;
    return approve({
      contract: tokenContract,
      spender: DATA_DEX_CONTRACT_ADDRESS,
      amountWei: rewardAmountWei,
    });
  }, [account, tokenContract, rewardAmountWei, isApproved]);

  const prepareCreateTaskTx = useCallback(() => {
    if (!isApproved || !ipfsCid || rewardAmountWei === 0n || !account || !dataDexContract) {
      return undefined;
    }

    const rewardString = rewardAmountWei.toString();
    return prepareContractCall({
      contract: dataDexContract,
      method: "createTask",
      params: [ipfsCid, rewardString, instructions || ""],
    });
  }, [account, dataDexContract, isApproved, ipfsCid, rewardAmountWei, instructions]);

  const uploadToIPFS = async (file) => {
    if (!file) return;
    try {
      const uris = await upload({
        client,
        files: [file],
      });
      const cidUrl = uris[0];
      const cid = cidUrl.replace('ipfs://', '');
      setIpfsCid(cid);
      alert('Image uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload image to IPFS', err);
      alert('Image upload failed: ' + err.message);
    }
  };
  

  return (
    <div className="space-y-5">
      <div className="mb-4">
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-300 mb-1">
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

      <div className="mb-4">
        <label htmlFor="datasetFile" className="block text-sm font-medium text-gray-300 mb-1">
          Upload Dataset Image:
        </label>
        <input
          type="file"
          id="datasetFile"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            uploadToIPFS(file);
          }}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
        {ipfsCid && (
          <p className="text-xs text-green-400 mt-1 break-all">
            Uploaded CID: {ipfsCid}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="reward" className="block text-sm font-medium text-gray-300 mb-1">
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
            Balance: {ethers.formatUnits(walletBalance, 18)} $DATA <br/>
            {checkingAllowance
              ? 'Checking allowance...'
              : isApproved
              ? `Allowance sufficient (${ethers.formatUnits(allowanceAmount, 18)} $DATA)`
              : `Needs approval. Current allowance: ${ethers.formatUnits(allowanceAmount, 18)} $DATA`}
          </p>
        )}
      </div>

      <div className="flex flex-col space-y-3 pt-2">
        {!isApproved && rewardAmountWei !== 0n && (
          <TransactionButton
            transaction={prepareApprovalTx}
            disabled={checkingAllowance}
            theme="light"
            className={`w-full px-4 py-2 rounded font-semibold ${checkingAllowance ? 'bg-gray-500 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 text-black'}`}
            onTransactionConfirmed={() => {
              setIsApproved(true);
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

        <TransactionButton
          transaction={prepareCreateTaskTx}
          disabled={!isApproved || !ipfsCid || rewardAmountWei === 0n || !account}
          theme="dark"
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed py-2.5 px-4 rounded font-semibold"
          onTransactionConfirmed={() => {
            alert("Task created successfully!");
            setInstructions('');
            setReward('');
            setIpfsCid('');
            setIsApproved(false);
            setRewardAmountWei(0n);
            setAllowanceAmount(0n);
            setWalletBalance(0n);
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
