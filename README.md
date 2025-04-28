# DataDEX - Decentralized Data Annotation Exchange

DataDEX is a blockchain-powered marketplace where AI projects can seamlessly connect with annotators in a trustless environment. The platform enables data requestors to create annotation tasks with clear instructions and rewards, while annotators can claim, complete, and earn tokens for their contributions.

![DataDEX Screenshot](https://ipfs.io/ipfs/bafkreihjjfzkzpr6ua537gp5wkthqxnjgpbzt5lbcgpmkx2y56dt7rqgcm)

## Features

### For Data Requestors
- Upload datasets to IPFS for secure, decentralized storage
- Create annotation tasks with customizable instructions
- Set DATA token rewards for completed tasks
- Verify and approve annotations for quality assurance
- Access a global network of skilled annotators

### For Annotators
- Browse and claim available annotation tasks
- Submit completed annotations securely via IPFS
- Earn DATA tokens for verified contributions
- Build reputation through a transparent rating system

## Technology Stack

### Frontend
- React 19 with Vite for fast development and optimized builds
- Thirdweb v5 SDK for web3 integration and wallet connections
- Tailwind CSS for responsive design
- IPFS for decentralized storage of datasets and annotations

### Backend / Blockchain
- Solidity smart contracts deployed on ZKSync Era
- Hardhat development environment
- OpenZeppelin contracts for security and standards compliance
- ERC20 token integration for rewards

## Getting Started

### Prerequisites
- Node.js v16+ and npm/yarn
- A compatible web3 wallet (MetaMask, Coinbase Wallet, Rainbow, etc.)
- TEST DATA tokens for creating tasks (on Base Sepolia testnet)

### Installation and Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/datadex.git
cd datadex
```

2. Install frontend dependencies
```bash
cd frontend/vite-proj
npm install
```

3. Install backend/contract dependencies
```bash
cd ../../backend
npm install
```

4. Start the development server
```bash
# In the frontend/vite-proj directory
npm run dev
```

### Smart Contract Deployment

1. Configure your environment variables
   - Create a `.env` file in the backend directory with:
   ```
   PRIVATE_KEY=your_wallet_private_key
   ZKSYNC_API_KEY=your_zksync_api_key
   ```

2. Deploy the contract
```bash
# In the backend directory
npm run deploy
```

3. Verify your contract on ZKSync Explorer
```bash
# Update the contract address in scripts/verify/my-contract.js
npx hardhat run scripts/verify/my-contract.js --network zkSyncSepoliaTestnet
```

## Usage

### For Requestors
1. Connect your wallet to the dApp
2. Select "Request Annotations" from the role selection screen
3. Fill in task instructions and upload your dataset image
4. Approve DATA tokens for the smart contract to use
5. Create your annotation task
6. Review submissions and approve or reject them

### For Annotators
1. Connect your wallet to the dApp
2. Select "Perform Annotations" from the role selection screen
3. Browse available tasks and claim one that matches your skills
4. Download the dataset and complete the annotation
5. Upload your completed work and submit
6. Claim your reward after the requestor verifies your submission

## Configuration

The main configuration settings are in `src/Landing.jsx`:

```javascript
export const DATA_DEX_CONTRACT_ADDRESS = "0x72b5fC9ECed3157674A187d30c7D36bdAD950B9d";
export const DATA_TOKEN_CONTRACT_ADDRESS = "0x9028ACe5350461A50e2F1A810Ec71d10C9eBB3D0";
export const CHAIN = baseSepolia;
export const CLIENT_ID = "595d02ef4db520c332937163acaa1009";
```

Update these values to match your deployed contract addresses and Thirdweb client ID.

## Project Structure

```
backend/
├── contracts/         # Solidity smart contracts
├── scripts/           # Deployment and verification scripts
├── hardhat.config.js  # Hardhat configuration
frontend/vite-proj/
├── src/
│   ├── abis/          # Smart contract ABIs
│   ├── assets/        # Static assets
│   ├── components/    # React components
│   └── main.jsx       # App entry point
└── public/            # Public assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thirdweb for the web3 development toolkit
- OpenZeppelin for secure contract libraries
- ZKSync Era for the efficient L2 blockchain platform
