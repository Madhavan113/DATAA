import React, { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useReadContract, useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, createThirdwebClient } from "thirdweb";
import { DATA_DEX_CONTRACT_ADDRESS, CHAIN, CLIENT_ID } from '../Landing';
import { DATA_DEX_ABI } from '../abis/DataDEX.abi.js';

const TASK_STATUS_MAP = ['Created', 'Claimed', 'Submitted', 'Verified', 'Canceled', 'Rejected'];

export default function AnnotationView({ taskId, onBack }) {
  const account = useActiveAccount();
  const client = createThirdwebClient({ clientId: CLIENT_ID });

  const [resultCid, setResultCid] = useState('');

  const contract = useMemo(() => {
    if (!client) return null;
    return getContract({
      client,
      chain: CHAIN,
      address: DATA_DEX_CONTRACT_ADDRESS,
      abi: DATA_DEX_ABI,
    });
  }, [client]);

  const { data: taskDetails, isLoading: isLoadingDetails, error: detailsError } = useReadContract({
    contract,
    method: "getTaskDetails",
    params: [taskId],
  });

  const handleDownload = () => {
    if (taskDetails?.ipfsCid) {
      const url = `https://ipfs.io/ipfs/${taskDetails.ipfsCid}`;
      window.open(url, '_blank');
    } else {
      alert("Dataset IPFS CID not available.");
    }
  };

  const prepareSubmitTx = useCallback(() => {
    if (!account || !taskId || !resultCid || !contract) return undefined;
    return prepareContractCall({
      contract,
      method: "submitAnnotation",
      params: [taskId, resultCid]
    });
  }, [account, taskId, resultCid, contract]);

  const prepareClaimRewardTx = useCallback(() => {
    if (!account || !taskId || !contract || taskDetails?.status !== 3 || taskDetails?.annotator !== account?.address) return undefined;
    return prepareContractCall({
      contract,
      method: "claimReward",
      params: [taskId]
    });
  }, [account, taskId, contract, taskDetails?.status, taskDetails?.annotator]);

  const prepareClaimTaskTx = useCallback(() => {
    if (!account || !taskId || !contract) return undefined;
    return prepareContractCall({
      contract,
      method: "claimTask",
      params: [taskId]
    });
  }, [account, taskId, contract]);

  if (isLoadingDetails) return <div className="p-4 text-center text-gray-400">Loading task details...</div>;
  if (detailsError) return (
    <div className="m-4 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded" role="alert">
      <strong className="font-bold">Error loading details:</strong>
      <span className="block sm:inline"> {detailsError.message}</span>
      <button onClick={onBack} className="ml-4 text-sm underline">Back to list</button>
    </div>
  );
  if (!contract) return <div className="p-4 text-center text-gray-400">Initializing contract...</div>;
  if (!taskDetails || !taskDetails.id || ethers.BigNumber.from(taskDetails.id).isZero()) return (
    <div className="p-4 text-center text-gray-500">
      Task not found or invalid Task ID.
      <button onClick={onBack} className="block mx-auto mt-2 text-sm text-blue-400 underline">Back to list</button>
    </div>
  );

  const isCurrentUserAnnotator = account?.address?.toLowerCase() === taskDetails.annotator?.toLowerCase();
  const canSubmit = [0, 1].includes(taskDetails.status);
  const canClaim = taskDetails.status === 3 && isCurrentUserAnnotator;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 px-4 py-1.5 rounded text-sm font-medium">&larr; Back to Task List</button>

      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-md space-y-3">
        <h3 className="text-xl font-semibold text-blue-300">Task Details (ID: {taskDetails.id.toString()})</h3>
        <div><label className="block text-xs font-medium text-gray-400">Instructions:</label><p className="text-sm text-gray-200 bg-gray-700 p-2 rounded mt-1 whitespace-pre-wrap">{taskDetails.instructions || "N/A"}</p></div>
        <div><label className="block text-xs font-medium text-gray-400">Reward:</label><p className="text-sm text-green-400">{taskDetails.rewardAmount ? ethers.utils.formatUnits(taskDetails.rewardAmount, 18) : '0'} $DATA</p></div>
        <div><label className="block text-xs font-medium text-gray-400">Status:</label><p className="text-sm text-yellow-400">{TASK_STATUS_MAP[taskDetails.status] ?? 'Unknown'}</p></div>
        <div><label className="block text-xs font-medium text-gray-400">Dataset CID:</label><div className="flex items-center space-x-2 mt-1"><span className="text-sm font-mono text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded text-xs truncate">{taskDetails.ipfsCid || "N/A"}</span><button onClick={handleDownload} disabled={!taskDetails.ipfsCid} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-3 py-1 rounded text-xs">Download</button></div></div>
        <div><label className="block text-xs font-medium text-gray-400">Requestor:</label><p className="text-sm font-mono text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded text-xs truncate">{taskDetails.requestor}</p></div>
        {taskDetails.status > 0 && taskDetails.annotator && taskDetails.annotator !== ethers.constants.AddressZero && (
          <div><label className="block text-xs font-medium text-gray-400">Annotator:</label><p className="text-sm font-mono text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded text-xs truncate">{taskDetails.annotator}{isCurrentUserAnnotator && " (You)"}</p></div>
        )}
      </div>

      {canSubmit && (
        <>
          {taskDetails.status === 0 && (
            <div className="p-4 bg-yellow-900 rounded-lg border border-yellow-700 shadow-md space-y-3">
              <h3 className="text-xl font-semibold text-yellow-300">Claim This Task</h3>
              <p className="text-sm text-yellow-200">This task is unclaimed. Claim it before submitting.</p>
              <TransactionButton transaction={prepareClaimTaskTx} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded">
                Claim Task
              </TransactionButton>
            </div>
          )}

          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-md space-y-3">
            <h3 className="text-xl font-semibold text-blue-300">Perform Annotation</h3>
            <div className="my-4 p-4 border border-dashed border-gray-600 rounded min-h-[100px] text-center text-gray-500 italic">(Annotation tools/interface would go here)</div>
            <div>
              <label htmlFor="annotationFile" className="block text-sm font-medium text-gray-300 mb-1">Upload Annotation File:</label>
              <input
                type="file"
                id="annotationFile"
                accept="*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !client) return;
                  try {
                    const uris = await client.storage.upload({ files: [file] });
                    const cidUrl = uris[0];
                    const cid = cidUrl.replace('ipfs://', '');
                    setResultCid(cid);
                  } catch (err) {
                    console.error("Failed to upload to IPFS", err);
                    alert("Upload failed: " + err.message);
                  }
                }}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
              />
            </div>
            <TransactionButton
              transaction={prepareSubmitTx}
              disabled={!resultCid}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
              onTransactionConfirmed={() => { alert("Annotation submitted successfully!"); setResultCid(''); onBack(); }}
              onError={(error) => { console.error("Submission failed:", error); alert(`Submission failed: ${error.message}`); }}
            >
              Submit Annotation Result
            </TransactionButton>
          </div>
        </>
      )}

      {canClaim && (
        <div className="p-4 bg-green-900 bg-opacity-50 rounded-lg border border-green-700 shadow-md space-y-3">
          <h3 className="text-xl font-semibold text-green-300">Claim Reward</h3>
          <TransactionButton
            transaction={prepareClaimRewardTx}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            onTransactionConfirmed={() => { alert("Reward claimed successfully!"); onBack(); }}
            onError={(error) => { console.error("Reward claim failed:", error); alert(`Reward claim failed: ${error.message}`); }}
          >
            Claim {taskDetails.rewardAmount ? ethers.utils.formatUnits(taskDetails.rewardAmount, 18) : '0'} $DATA
          </TransactionButton>
        </div>
      )}
    </div>
  );
}
