import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x2C4581D4cE74EeE134a0129CB9dF36e6300F5812";
export const BASE_CHAIN_ID = 8453;

export const CONTRACT_ABI = [
  "function mintMeme(string metadataUrl, string _name, string _symbol) external",
  "function getPoints(address user) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function POINTS_PER_MINT() external view returns (uint256)",
];

// Get contract instance
export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

// Mint NFT function
export async function mintNFT(
  signer: ethers.Signer,
  metadataUrl: string,
  name: string,
  symbol: string
): Promise<ethers.ContractTransactionReceipt | null> {
  const contract = getContract(signer);
  const tx = await contract.mintMeme(metadataUrl, name, symbol);
  const receipt = await tx.wait();
  return receipt;
}

// Get user points
export async function getUserPoints(
  provider: ethers.Provider,
  userAddress: string
): Promise<number> {
  const contract = getContract(provider);
  const points = await contract.getPoints(userAddress);
  return Number(points);
}

// Get total supply
export async function getTotalSupply(provider: ethers.Provider): Promise<number> {
  const contract = getContract(provider);
  const supply = await contract.totalSupply();
  return Number(supply);
}

// Get points per mint
export async function getPointsPerMint(provider: ethers.Provider): Promise<number> {
  const contract = getContract(provider);
  const points = await contract.POINTS_PER_MINT();
  return Number(points);
}

// Check and switch to Base network
export async function switchToBase() {
  if (!window.ethereum) throw new Error("No wallet found");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }], // Base mainnet (8453 in hex)
    });
  } catch (error: any) {
    // Chain not added, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x2105",
            chainName: "Base",
            nativeCurrency: {
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

// Get Base network config for wagmi/web3modal
export const baseMainnet = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
} as const;
