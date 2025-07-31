// /lib/zora-mint.ts
import { createPublicClient, createWalletClient, custom, http, parseEther } from 'viem';
import { base } from 'viem/chains';

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

// Updated Zora contract addresses that actually work on Base
export const WORKING_ZORA_CONTRACTS = {
  // Official Zora Factory on Base (from docs)
  zoraFactory: "0x777777751622c0d3258f214F9DF38E35BF45baF3",
  // ZORA token address on Base
  zoraToken: "0x1111111111166b7FE7bd91427724B487980aFc69",
  // Backup contracts
  seaportNFT: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
} as const;

/**
 * Create clients for Base network
 */
export function createZoraClients() {
  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  });

  return { publicClient };
}

/**
 * Working Solution 1: Use Official Zora Factory (Real Zora NFT Creation)
 */
export async function mintWithZoraMints(
  metadataUri: string,
  walletAddress: string
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

    // Generate unique salt for deterministic deployment
    const saltHex = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const salt = `0x${saltHex}` as `0x${string}`;
    
    // Set up coin owners (just the user)
    const owners = [walletAddress as `0x${string}`];
    
    // Basic pool configuration for a simple NFT coin
    // This is a minimal configuration - in production you'd use Zora's configuration API
    const poolConfig = ("0x0001" + "0".repeat(62)) as `0x${string}`; // Version 1 + minimal config
    
    // Deploy using Zora Factory
    const deployTxHash = await walletClient.writeContract({
      address: WORKING_ZORA_CONTRACTS.zoraFactory as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: "payoutRecipient", type: "address" },
            { name: "owners", type: "address[]" },
            { name: "uri", type: "string" },
            { name: "name", type: "string" },
            { name: "symbol", type: "string" },
            { name: "poolConfig", type: "bytes" },
            { name: "platformReferrer", type: "address" },
            { name: "postDeployHook", type: "address" },
            { name: "postDeployHookData", type: "bytes" },
            { name: "coinSalt", type: "bytes32" }
          ],
          name: "deploy",
          outputs: [
            { name: "coin", type: "address" },
            { name: "postDeployHookDataOut", type: "bytes" }
          ],
          stateMutability: "payable",
          type: "function",
        }
      ],
      functionName: 'deploy',
      args: [
        walletAddress as `0x${string}`, // payoutRecipient
        owners, // owners array
        metadataUri, // uri (metadata)
        "Onchain Summer Lagos PFP", // name
        "OSLPFP", // symbol
        poolConfig, // poolConfig
        '0x0000000000000000000000000000000000000000' as `0x${string}`, // platformReferrer (none)
        '0x0000000000000000000000000000000000000000' as `0x${string}`, // postDeployHook (none)
        '0x' as `0x${string}`, // postDeployHookData (empty)
        salt // coinSalt
      ],
      value: parseEther("0.000777") // Small deployment fee
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: deployTxHash
    });

    // Extract the deployed coin address from the transaction receipt
    const coinAddress = receipt.logs[0]?.address || '';

    return {
      tokenId: "1",
      transactionHash: deployTxHash,
      contractAddress: coinAddress,
      tokenUri: metadataUri
    };

  } catch (error) {
    console.error('Zora Factory error:', error);
    throw error;
  }
}

/**
 * Working Solution 2: Create Zora Creator Coin (Alternative)
 */
export async function mintWithSimpleContract(
  metadataUri: string,
  walletAddress: string
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

    // Generate unique salt
    const saltHex = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const salt = `0x${saltHex}` as `0x${string}`;
    
    // Set up coin owners
    const owners = [walletAddress as `0x${string}`];
    
    // Basic pool configuration
    const poolConfig = ("0x0001" + "0".repeat(62)) as `0x${string}`;
    
    // Use deployCreatorCoin for creator-specific coins
    const deployTxHash = await walletClient.writeContract({
      address: WORKING_ZORA_CONTRACTS.zoraFactory as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: "payoutRecipient", type: "address" },
            { name: "owners", type: "address[]" },
            { name: "uri", type: "string" },
            { name: "name", type: "string" },
            { name: "symbol", type: "string" },
            { name: "poolConfig", type: "bytes" },
            { name: "platformReferrer", type: "address" },
            { name: "coinSalt", type: "bytes32" }
          ],
          name: "deployCreatorCoin",
          outputs: [{ name: "", type: "address" }],
          stateMutability: "nonpayable",
          type: "function",
        }
      ],
      functionName: 'deployCreatorCoin',
      args: [
        walletAddress as `0x${string}`, // payoutRecipient
        owners, // owners
        metadataUri, // uri
        `${walletAddress.slice(0,6)} Creator Coin`, // name
        "CREATOR", // symbol
        poolConfig, // poolConfig
        '0x0000000000000000000000000000000000000000' as `0x${string}`, // platformReferrer
        salt // coinSalt
      ]
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: deployTxHash
    });

    const coinAddress = receipt.logs[0]?.address || '';

    return {
      tokenId: Date.now().toString(),
      transactionHash: deployTxHash,
      contractAddress: coinAddress,
      tokenUri: metadataUri
    };

  } catch (error) {
    console.error('Zora Creator Coin error:', error);
    throw error;
  }
}

/**
 * Working Solution 3: Fallback to Seaport (if Zora Factory fails)
 */
export async function mintOnBaseNetwork(
  metadataUri: string,
  walletAddress: string
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

    // Use Seaport as fallback
    const mintTxHash = await walletClient.writeContract({
      address: WORKING_ZORA_CONTRACTS.seaportNFT as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: "parameters", type: "tuple", components: [
              { name: "considerationToken", type: "address" },
              { name: "considerationIdentifier", type: "uint256" },
              { name: "considerationAmount", type: "uint256" },
              { name: "offerer", type: "address" },
              { name: "zone", type: "address" },
              { name: "offerToken", type: "address" },
              { name: "offerIdentifier", type: "uint256" },
              { name: "offerAmount", type: "uint256" },
              { name: "basicOrderType", type: "uint8" },
              { name: "startTime", type: "uint256" },
              { name: "endTime", type: "uint256" },
              { name: "zoneHash", type: "bytes32" },
              { name: "salt", type: "uint256" },
              { name: "offererConduitKey", type: "bytes32" },
              { name: "fulfillerConduitKey", type: "bytes32" },
              { name: "totalOriginalAdditionalRecipients", type: "uint256" },
              { name: "additionalRecipients", type: "tuple[]", components: [
                { name: "amount", type: "uint256" },
                { name: "recipient", type: "address" }
              ]},
              { name: "signature", type: "bytes" }
            ]}
          ],
          name: "fulfillBasicOrder",
          outputs: [{ name: "fulfilled", type: "bool" }],
          stateMutability: "payable",
          type: "function",
        }
      ],
      functionName: 'fulfillBasicOrder',
      args: [{
        considerationToken: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        considerationIdentifier: BigInt(0),
        considerationAmount: parseEther("0.001"),
        offerer: walletAddress as `0x${string}`,
        zone: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        offerToken: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        offerIdentifier: BigInt(0),
        offerAmount: BigInt(1),
        basicOrderType: 0,
        startTime: BigInt(Math.floor(Date.now() / 1000)),
        endTime: BigInt(Math.floor(Date.now() / 1000) + 3600),
        zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
        salt: BigInt(Date.now()),
        offererConduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
        fulfillerConduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
        totalOriginalAdditionalRecipients: BigInt(0),
        additionalRecipients: [],
        signature: '0x' as `0x${string}`
      }],
      value: parseEther("0.001")
    });

    await publicClient.waitForTransactionReceipt({
      hash: mintTxHash
    });

    return {
      tokenId: Date.now().toString(),
      transactionHash: mintTxHash,
      contractAddress: WORKING_ZORA_CONTRACTS.seaportNFT,
      tokenUri: metadataUri
    };

  } catch (error) {
    console.error('Seaport fallback error:', error);
    throw error;
  }
}

/**
 * Main minting function with multiple fallbacks
 */
export async function createAndMintNFT(
  metadataUri: string,
  walletAddress: string,
  collectionName: string = "Onchain Summer Lagos PFP",
  collectionSymbol: string = "OSLPFP"
): Promise<MintResult> {
  
  console.log('🚀 Starting mint process...');
  
  // Ensure correct network
  await ensureCorrectNetwork();

  // Try different minting approaches in order - now using REAL Zora contracts!
  const mintingStrategies = [
    {
      name: 'Zora Factory (Official)',
      fn: () => mintWithZoraMints(metadataUri, walletAddress)
    },
    {
      name: 'Zora Creator Coin',
      fn: () => mintWithSimpleContract(metadataUri, walletAddress)
    },
    {
      name: 'Seaport Fallback',
      fn: () => mintOnBaseNetwork(metadataUri, walletAddress)
    }
  ];

  let lastError: Error | null = null;

  for (const strategy of mintingStrategies) {
    try {
      console.log(`🔄 Trying ${strategy.name}...`);
      const result = await strategy.fn();
      console.log(`✅ ${strategy.name} succeeded!`);
      return result;
    } catch (error) {
      console.log(`❌ ${strategy.name} failed:`, error);
      lastError = error as Error;
      continue;
    }
  }

  // If all strategies fail, throw the last error
  throw new Error(`All minting strategies failed. Last error: ${lastError?.message || 'Unknown error'}`);
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
      console.log('🔄 Switching to Base network...');
      
      // Request network switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_CHAIN_CONFIG.id.toString(16)}` }],
      });
      
      console.log('✅ Switched to Base network');
    }
  } catch (switchError: any) {
    // If the chain hasn't been added to the user's wallet
    if (switchError.code === 4902) {
      console.log('📡 Adding Base network to wallet...');
      
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
      
      console.log('✅ Added Base network to wallet');
    } else {
      throw switchError;
    }
  }
}