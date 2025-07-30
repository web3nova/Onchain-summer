// /lib/zora-mint.ts
import { createPublicClient, createWalletClient, custom, http, type PublicClient } from 'viem';
import { base } from 'viem/chains';

// Zora Protocol addresses on Base
export const ZORA_CONTRACTS = {
  // Zora ERC721 Drop Factory on Base
  erc721DropFactory: "0x58C3ccB2dcb9384E5AB9111CD1a5DEA916B0f33c",
  // Zora Protocol Rewards on Base  
  protocolRewards: "0x7777777F279eba3d3Ad8F4E708545291A6fDBA8B",
  // Zora 1155 Factory on Base
  erc1155Factory: "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021"
} as const;

export const BASE_CHAIN_CONFIG = {
  id: 8453,
  name: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org'
} as const;

export interface MintResult {
  tokenId: string;
  transactionHash: string;
  contractAddress: string;
  tokenUri?: string;
}

// Simplified ABI for Zora 1155 Factory
const ZORA_1155_FACTORY_ABI = [
  {
    inputs: [
      {
        name: "newContract",
        type: "string",
      },
      {
        name: "contractURI",
        type: "string",
      },
      {
        name: "defaultRoyalty",
        type: "tuple",
        components: [
          { name: "royaltyRecipient", type: "address" },
          { name: "royaltyBPS", type: "uint16" }
        ]
      },
      {
        name: "defaultAdmin",
        type: "address",
      },
      {
        name: "setupActions",
        type: "bytes[]",
      }
    ],
    name: "createContract",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Simplified ABI for ERC1155 contract
const ERC1155_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "quantity", type: "uint256" },
      { name: "data", type: "bytes" }
    ],
    name: "adminMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "uri", type: "string" },
      { name: "maxSupply", type: "uint256" },
      { name: "createReferral", type: "address" }
    ],
    name: "setupNewToken",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  }
] as const;

/**
 * Create Zora clients for interacting with the protocol
 */
export function createZoraClients() {
  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  }) as PublicClient;

  return { publicClient };
}

/**
 * Create and mint in one transaction (recommended for single NFTs)
 */
export async function createAndMintNFT(
  metadataUri: string,
  walletAddress: string,
  collectionName: string = "Onchain Summer Lagos PFP",
  collectionSymbol: string = "OSLPFP"
): Promise<MintResult> {
  try {
    if (!window.ethereum) {
      throw new Error('No wallet found');
    }

    const walletClient = createWalletClient({
      chain: base,
      transport: custom(window.ethereum),
      account: walletAddress as `0x${string}`
    });

    const { publicClient } = createZoraClients();

    // Step 1: Create a new 1155 contract
    const createTxHash = await walletClient.writeContract({
      address: ZORA_CONTRACTS.erc1155Factory as `0x${string}`,
      abi: ZORA_1155_FACTORY_ABI,
      functionName: 'createContract',
      args: [
        collectionName, // contract name
        metadataUri, // contract URI
        {
          royaltyRecipient: walletAddress as `0x${string}`,
          royaltyBPS: 500 // 5% royalty
        },
        walletAddress as `0x${string}`, // default admin
        [] // no setup actions
      ],
    });

    // Wait for contract creation
    const createReceipt = await publicClient.waitForTransactionReceipt({
      hash: createTxHash
    });

    // Extract contract address from logs
    const contractAddress = createReceipt.contractAddress || createReceipt.logs[0]?.address || '';
    
    if (!contractAddress) {
      throw new Error('Failed to get contract address from transaction');
    }

    // Step 2: Setup new token with metadata
    const setupTxHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: ERC1155_ABI,
      functionName: 'setupNewToken',
      args: [
        metadataUri,
        BigInt(1000), // max supply
        walletAddress as `0x${string}` // create referral
      ],
    });

    await publicClient.waitForTransactionReceipt({
      hash: setupTxHash
    });

    // Step 3: Mint the token to the user
    const mintTxHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: ERC1155_ABI,
      functionName: 'adminMint',
      args: [
        walletAddress as `0x${string}`,
        BigInt(1), // token ID (first token)
        BigInt(1), // quantity
        '0x' as `0x${string}` // empty data
      ],
    });

    // Wait for mint confirmation
    await publicClient.waitForTransactionReceipt({
      hash: mintTxHash
    });

    return {
      tokenId: "1",
      transactionHash: mintTxHash,
      contractAddress,
      tokenUri: metadataUri
    };
  } catch (error) {
    console.error('Error creating and minting NFT:', error);
    throw new Error(`Failed to create and mint NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Alternative: Simple mint using existing Zora contract
 */
export async function simpleZoraMint(
  metadataUri: string,
  walletAddress: string
): Promise<MintResult> {
  try {
    if (!window.ethereum) {
      throw new Error('No wallet found');
    }

    // Use a well-known Zora contract for minting
    const ZORA_MINTS_CONTRACT = "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021";
    
    const walletClient = createWalletClient({
      chain: base,
      transport: custom(window.ethereum),
      account: walletAddress as `0x${string}`
    });

    const { publicClient } = createZoraClients();

    // Simple mint call (you may need to adjust based on actual Zora contract)
    const txHash = await walletClient.writeContract({
      address: ZORA_MINTS_CONTRACT as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: "to", type: "address" },
            { name: "tokenURI", type: "string" }
          ],
          name: "mint",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        }
      ],
      functionName: 'mint',
      args: [walletAddress as `0x${string}`, metadataUri],
      value: BigInt(0) // Free mint
    });

    await publicClient.waitForTransactionReceipt({
      hash: txHash
    });

    return {
      tokenId: "1",
      transactionHash: txHash,
      contractAddress: ZORA_MINTS_CONTRACT,
      tokenUri: metadataUri
    };
  } catch (error) {
    console.error('Error with simple Zora mint:', error);
    throw new Error(`Failed to mint NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if user is on the correct network (Base)
 */
export async function ensureCorrectNetwork(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('No wallet found');
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (parseInt(chainId, 16) !== BASE_CHAIN_CONFIG.id) {
      // Request network switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_CHAIN_CONFIG.id.toString(16)}` }],
      });
    }
  } catch (switchError: any) {
    // If the chain hasn't been added to the user's wallet
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${BASE_CHAIN_CONFIG.id.toString(16)}`,
          chainName: BASE_CHAIN_CONFIG.name,
          rpcUrls: [BASE_CHAIN_CONFIG.rpcUrl],
          blockExplorerUrls: [BASE_CHAIN_CONFIG.blockExplorer],
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        }],
      });
    } else {
      throw switchError;
    }
  }
}

/**
 * Get NFT details from contract
 */
export async function getZoraNFTDetails(
  contractAddress: string,
  tokenId: string
): Promise<{
  tokenUri: string;
  owner: string;
  metadata?: any;
}> {
  try {
    const { publicClient } = createZoraClients();

    const tokenUri = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: [
        {
          inputs: [{ name: 'tokenId', type: 'uint256' }],
          name: 'uri',
          outputs: [{ name: '', type: 'string' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'uri',
      args: [BigInt(tokenId)],
    });

    return {
      tokenUri: tokenUri as string,
      owner: '', // Would need additional contract calls
      metadata: undefined
    };
  } catch (error) {
    console.error('Error getting NFT details:', error);
    throw new Error(`Failed to get NFT details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}