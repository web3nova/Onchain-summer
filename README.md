# Onchain Summer Booth

A Next.js app to create a summer-themed profile picture and mint it as an NFT on Base Network using a custom smart contract and IPFS (Pinata).

## Table of contents
- About
- Features
- Quick start
  - Prerequisites
  - Local development
  - Build & start
- Environment variables
- How it works (high level)
- Project structure
- Scripts
- Smart Contract
- Contributing
- License

## About

Onchain Summer Booth is a Next.js 15 application that lets users upload a photo, position and zoom it inside a circular frame over a summer-themed background, then either download the composed image or mint it on Base Network. Images and metadata are uploaded to IPFS using Pinata.

The app uses ReWon AppKit (WalletConnect) for wallet connection and ethers.js for blockchain interactions. Users earn points for each NFT they mint.

## Features

- Upload a photo and position/zoom it in a circular frame over the provided background.
- Download the composed PNG.
- Connect a wallet (WalletConnect/ReWon AppKit) and mint the created image as an NFT on Base Network.
- Upload image and metadata to Pinata/IPFS and use the resulting URI when minting.
- View your total points and NFT count.
- Minimal, mobile-friendly UI built with Tailwind + Radix UI primitives.

## Quick start

Prerequisites

- Node.js 20+ (recommended)
- pnpm / npm / yarn
- A browser wallet (e.g., MetaMask) for minting on Base
- Pinata JWT (for IPFS uploads) — see Environment variables below
- WalletConnect Project ID — see Environment variables below

Install

```pwsh
# from repository root
npm install
```

Run dev server (local)

```pwsh
npm run dev
# this starts Next.js on port 9002 by default (script uses: `next dev --turbopack -p 9002`)
```

Useful scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start built app
- `npm run lint` — run Next.js lint
- `npm run typecheck` — TypeScript type check

## Environment variables

Create a `.env.local` file at the project root and provide the following variables:

```env
# Pinata IPFS Configuration
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### Getting API Keys

1. **Pinata JWT**: 
   - Go to https://app.pinata.cloud/developers/api-keys
   - Create new API key with upload permissions
   - Copy JWT token to `.env.local`

2. **WalletConnect Project ID**:
   - Go to https://cloud.walletconnect.com
   - Create a new project
   - Copy the Project ID to `.env.local`

See `.env.example` for reference.

## How it works (high level)

1. User uploads an image file in the `OnchainSummerBooth` component (`src/components/onchain-summer-booth.tsx`).
2. The app renders a canvas (hidden) and composes the background + masked circular user image using the user-adjusted position and zoom.
3. The user can download the composed PNG, or click Mint to start the mint flow.
4. Mint flow (hooks in `src/hooks/useMintFlow.ts`) will:
   - Generate the composed image blob (client-side)
   - Upload the image to IPFS via Pinata (see `src/lib/pinata.ts`)
   - Upload metadata JSON to IPFS via Pinata
   - Call the smart contract's `mintMeme` function on Base Network
   - Award 2 points to the user on-chain
5. User can view their total points and NFT count in the UI.

## Smart Contract

- **Contract Address**: `0x2C4581D4cE74EeE134a0129CB9dF36e6300F5812`
- **Network**: Base Mainnet (Chain ID: 8453)
- **Features**:
  - Mint NFTs with custom metadata, name, and symbol
  - Earn 2 points per NFT minted
  - Query user points with `getPoints(address)`
  - View total supply with `totalSupply()`

The contract implementation is in `src/lib/contract.ts`.

## Project structure

- `src/app/` - Next.js app pages and layout
  - `page.tsx` - Main landing page with hero section, features, and booth
  - `layout.tsx` - App layout with Web3Modal provider
- `src/components/` - React components (UI + Onchain Summer Booth main component)
  - `onchain-summer-booth.tsx` — main UI for upload, edit, download, and mint
  - `ui/` - Radix UI components
- `src/lib/` - utility libraries
  - `pinata.ts` — helper functions to upload image/metadata to Pinata IPFS
  - `contract.ts` — smart contract interaction functions (mint, get points, switch network)
  - `utils.ts` - utility functions
- `src/hooks/` - React hooks
  - `useMintFlow.ts` - Main hook for NFT minting flow with progress tracking
  - `use-toast.ts` - Toast notifications hook
- `public/` - Static assets
  - `Frame.png` - Onchain Summer background frame

## Important files

- `src/components/onchain-summer-booth.tsx` — the main client component that handles upload, positioning, canvas export and triggers the mint flow.
- `src/lib/pinata.ts` — REST-based Pinata uploader (uses NEXT_PUBLIC_PINATA_JWT and NEXT_PUBLIC_PINATA_GATEWAY).
- `src/lib/contract.ts` — smart contract interaction functions for minting and querying points.
- `src/hooks/useMintFlow.ts` - Hook that orchestrates the entire minting process with progress tracking.

## Notes about minting and network

- Target chain: Base Network (chain id 8453). The code will automatically request a network switch using EIP-3326 wallet RPC (`wallet_switchEthereumChain` / `wallet_addEthereumChain`) if the wallet isn't connected to Base.
- On-chain calls are performed client-side through the connected wallet (MetaMask, etc.).
- Each successful mint awards 2 points to the user's address.
- Points and NFT count are displayed in real-time after minting.

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository or create a branch on the main repo.
2. Run the dev server locally and make changes.
3. Submit a pull request with a clear description of the change.

Guidelines

- Avoid exposing secrets. If you add server-side endpoints that require secrets, use environment variables stored securely and do not commit them.
- Add tests for non-UI logic where possible. Keep UI changes tested manually or with component tests.

## Troubleshooting

- If uploads to Pinata fail, verify `NEXT_PUBLIC_PINATA_JWT` and `NEXT_PUBLIC_PINATA_GATEWAY` are set and valid.
- If minting fails, check the browser console for errors, ensure your wallet is connected to Base Network, and check `basescan.org` with the transaction hash when available.
- If wallet connection fails, verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly.

## License

This project is released under the LICENSE file in the repository.
