# Onchain Summer Booth

A small, focused Next.js app to create a summer-themed profile picture and mint it as an NFT on Base Network using Zora and IPFS (Pinata gateway).

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
- Contributing
- License

## About

Onchain Summer Booth is a Next.js 15 application that lets users upload a photo, position and zoom it inside a circular frame over a summer-themed background, then either download the composed image or mint it on Base Network via Zora Protocol. Images and metadata are uploaded to IPFS using Pinata (gateway configurable).

The app was built with web3 UX in mind (RainbowKit for wallet connection, viem/wagmi for chain interactions) and uses a client-side canvas pipeline to compose and export the final PNG.

## Features

- Upload a photo and position/zoom it in a circular frame over the provided background.
- Download the composed PNG.
- Connect a wallet (RainbowKit) and mint the created image as an NFT on Base Network using the Zora Factory / creator flows with multiple fallback strategies.
- Upload image and metadata to Pinata/IPFS and use the resulting URI when minting.
- Minimal, mobile-friendly UI built with Tailwind + Radix UI primitives.

## Quick start

Prerequisites

- Node.js 20+ (recommended)
- pnpm / npm / yarn
- A browser wallet (e.g., MetaMask) for minting on Base
- Pinata JWT (for IPFS uploads) — see Environment variables below

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
- `npm run genkit:dev` — start Genkit dev flow (AI helpers, if you use Genkit integration)
- `npm run genkit:watch` — Genkit watcher
- `npm run build` — production build
- `npm run start` — start built app
- `npm run lint` — run Next.js lint
- `npm run typecheck` — TypeScript type check

## Environment variables

Create a `.env.local` file at the project root and provide the following variables (prefixed with NEXT_PUBLIC because some are used client-side):

- `NEXT_PUBLIC_PINATA_JWT` — Pinata JWT token used to authenticate pinning requests. Required for uploading images/metadata via Pinata.
- `NEXT_PUBLIC_PINATA_GATEWAY` — Pinata gateway hostname used to form HTTP gateway URLs (example: `gateway.pinata.cloud`)

Notes

- The project intentionally uses a client-side Pinata approach (Bearer JWT in client requests). If you prefer not to expose a JWT client-side, move uploads to an API route or server function and keep a server-side secret.

## How it works (high level)

1. User uploads an image file in the `OnchainSummerBooth` component (`src/components/onchain-summer-booth.tsx`).
2. The app renders a canvas (hidden) and composes the background + masked circular user image using the user-adjusted position and zoom.
3. The user can download the composed PNG, or click Mint to start the mint flow.
4. Mint flow (hooks in `src/hooks/useMintFlow.tsx`) will:
   - Generate the composed image blob (client-side)
   - Upload the image to IPFS via Pinata (see `src/lib/pinata.ts`)
   - Upload metadata JSON to IPFS via Pinata
   - Call Zora mint functions (implemented in `src/lib/zora-mint.ts`) which attempt multiple strategies (Zora Factory deploy, Creator Coin, Seaport fallback) on Base Network using `viem` for on-chain interactions.

Security note: the current implementation uses client-side PINATA JWT. For production, proxy the Pinata calls through a secure server endpoint and store secrets server-side.

## Project structure

- `src/app/` - Next.js app pages and layout
- `src/components/` - React components (UI + Onchain Summer Booth main component)
  - `onchain-summer-booth.tsx` — main UI for upload, edit, download, and mint
- `src/lib/` - small libraries
  - `pinata.ts` — helper functions to upload image/metadata to Pinata
  - `zora-mint.ts` — functions to create/mint NFTs on Base Network (Zora flows)
- `src/hooks/` - hooks (wallet integration, mint flow, toasts, etc.)
- `src/ai/` - Genkit/AI helper scripts; Genkit is included in dependencies and a couple of scripts are provided
- `docs/blueprint.md` - project blueprint and design notes

## Important files

- `next.config.ts` — Next.js configuration including allowed remote image patterns and minimal webpack fallbacks for web3 packages.
- `src/components/onchain-summer-booth.tsx` — the main client component that handles upload, positioning, canvas export and triggers the mint flow.
- `src/lib/pinata.ts` — REST-based Pinata uploader (uses NEXT_PUBLIC_PINATA_JWT and NEXT_PUBLIC_PINATA_GATEWAY).
- `src/lib/zora-mint.ts` — minting strategies for Zora on Base (uses viem and window.ethereum wallet interactions).

## Notes about minting and network

- Target chain: Base Network (chain id 8453). The code will automatically request a network switch using EIP-3326 wallet RPC (`wallet_switchEthereumChain` / `wallet_addEthereumChain`) if the wallet isn't connected to Base.
- On-chain calls are performed client-side through the connected wallet (MetaMask, etc.).
- The repo includes cautious fallback strategies for minting if the primary Zora Factory approach fails.

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

## License

This project is released under the LICENSE file in the repository.

---

If you'd like, I can also:
- Add example `.env.local.example` with the required env keys (non-secret placeholders).
- Add a short CONTRIBUTING.md with PR checklist.
