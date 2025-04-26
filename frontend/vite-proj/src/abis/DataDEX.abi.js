export const DATA_DEX_ABI = [[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_dataTokenAddress",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "taskId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "annotator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "rewardAmount",
          "type": "uint256"
        }
      ],
      "name": "RewardClaimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "taskId",
          "type": "uint256"
        }
      ],
      "name": "TaskCanceled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "taskId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "annotator",
          "type": "address"
        }
      ],
      "name": "TaskClaimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "taskId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "requestor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "rewardAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "ipfsCid",
          "type": "string"
        }
      ],
      "name": "TaskCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "taskId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "annotator",
          "type": "address"
        }
      ],
      "name": "TaskRejected",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "taskId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "annotator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "resultIpfsCid",
          "type": "string"
        }
      ],
      "name": "TaskSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "taskId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "annotator",
          "type": "address"
        }
      ],
      "name": "TaskVerified",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        }
      ],
      "name": "cancelTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        }
      ],
      "name": "claimTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_ipfsCid",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_rewardAmount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_instructions",
          "type": "string"
        }
      ],
      "name": "createTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "dataToken",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAvailableTasks",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "requestor",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "ipfsCid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "instructions",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "rewardAmount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "annotator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "resultIpfsCid",
              "type": "string"
            },
            {
              "internalType": "enum DataDEX.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "creationTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "completionTime",
              "type": "uint256"
            }
          ],
          "internalType": "struct DataDEX.Task[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_annotator",
          "type": "address"
        }
      ],
      "name": "getSubmittedTasksByAnnotator",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "requestor",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "ipfsCid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "instructions",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "rewardAmount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "annotator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "resultIpfsCid",
              "type": "string"
            },
            {
              "internalType": "enum DataDEX.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "creationTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "completionTime",
              "type": "uint256"
            }
          ],
          "internalType": "struct DataDEX.Task[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        }
      ],
      "name": "getTaskDetails",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "requestor",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "ipfsCid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "instructions",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "rewardAmount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "annotator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "resultIpfsCid",
              "type": "string"
            },
            {
              "internalType": "enum DataDEX.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "creationTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "completionTime",
              "type": "uint256"
            }
          ],
          "internalType": "struct DataDEX.Task",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_requestor",
          "type": "address"
        }
      ],
      "name": "getTasksByRequestor",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "requestor",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "ipfsCid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "instructions",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "rewardAmount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "annotator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "resultIpfsCid",
              "type": "string"
            },
            {
              "internalType": "enum DataDEX.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "creationTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "completionTime",
              "type": "uint256"
            }
          ],
          "internalType": "struct DataDEX.Task[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_resultIpfsCid",
          "type": "string"
        }
      ],
      "name": "submitAnnotation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tasks",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "requestor",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "ipfsCid",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "instructions",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "rewardAmount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "annotator",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "resultIpfsCid",
          "type": "string"
        },
        {
          "internalType": "enum DataDEX.Status",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "creationTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "completionTime",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "_approved",
          "type": "bool"
        }
      ],
      "name": "verifyTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdrawStuckNative",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdrawStuckTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
];