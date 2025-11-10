// /hooks/useMintFlow.ts
import { useState, useCallback } from 'react';
import React from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { uploadImageToPinata, uploadMetadataToPinata, type NFTMetadata } from '@/lib/pinata';
import { mintNFT, getUserPoints, switchToBase } from '@/lib/contract';

export interface FlierMetadata {
  name: string;
  description: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

export interface MintedNFT {
  tokenId: string;
  contractAddress: string;
  transactionHash: string;
  ipfsCid: string;
  metadataUri: string;
  mintedAt: Date;
  userPoints: number;
}

export interface MintFlowError extends Error {
  step: 'wallet' | 'network' | 'ipfs-image' | 'ipfs-metadata' | 'mint' | 'backend';
  originalError?: Error;
}

export interface UseMintFlowReturn {
  mintFlier: (imageBlob: Blob, metadata: FlierMetadata) => Promise<MintedNFT>;
  isLoading: boolean;
  error: MintFlowError | null;
  txHash: string | null;
  mintedNFT: MintedNFT | null;
  currentStep: string;
  progress: number;
  resetState: () => void;
}

const MINT_STEPS = {
  VALIDATING: 'Validating wallet connection...',
  NETWORK_CHECK: 'Checking network...',
  UPLOADING_IMAGE: 'Uploading image to IPFS...',
  CREATING_METADATA: 'Creating NFT metadata...',
  UPLOADING_METADATA: 'Uploading metadata to IPFS...',
  MINTING: 'Minting NFT on Base...',
  COMPLETE: 'Mint complete!'
} as const;

export function useMintFlow(): UseMintFlowReturn {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<MintFlowError | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mintedNFT, setMintedNFT] = useState<MintedNFT | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const createMintError = (step: MintFlowError['step'], message: string, originalError?: Error): MintFlowError => {
    const error = new Error(message) as MintFlowError;
    error.step = step;
    error.originalError = originalError;
    return error;
  };

  const updateProgress = (step: keyof typeof MINT_STEPS, progressValue: number) => {
    setCurrentStep(MINT_STEPS[step]);
    setProgress(progressValue);
  };

  const mintFlier = useCallback(async (
    imageBlob: Blob,
    metadata: FlierMetadata
  ): Promise<MintedNFT> => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    setMintedNFT(null);
    setProgress(0);

    try {
      // Step 1: Validate wallet connection
      updateProgress('VALIDATING', 10);
      if (!isConnected || !address) {
        throw createMintError('wallet', 'Please connect your wallet first');
      }

      // Step 2: Check/switch to correct network
      updateProgress('NETWORK_CHECK', 20);
      try {
        await switchToBase();
      } catch (networkError) {
        throw createMintError('network', 'Please switch to Base network', networkError as Error);
      }

      // Get wallet client for signing
      const walletClient = await window.ethereum;
      if (!walletClient) {
        throw createMintError('wallet', 'No wallet provider found');
      }

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      // Step 3: Upload image to IPFS
      updateProgress('UPLOADING_IMAGE', 30);
      let imageUploadResult;
      try {
        const fileName = `onchain-summer-lagos-${Date.now()}.png`;
        imageUploadResult = await uploadImageToPinata(imageBlob, fileName);
      } catch (ipfsError) {
        throw createMintError('ipfs-image', 'Failed to upload image to IPFS', ipfsError as Error);
      }

      // Step 4: Create complete metadata
      updateProgress('CREATING_METADATA', 50);
      const completeMetadata: NFTMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: imageUploadResult.ipfsUrl,
        attributes: [
          ...(metadata.attributes || []),
          {
            trait_type: 'IPFS Gateway',
            value: imageUploadResult.pinataUrl
          },
          {
            trait_type: 'Created At',
            value: new Date().toISOString()
          }
        ],
        external_url: metadata.external_url || 'https://onchain-summer-lagos.xyz',
        background_color: 'FF69B4' // Pink theme for Onchain Summer
      };

      // Step 5: Upload metadata to IPFS
      updateProgress('UPLOADING_METADATA', 60);
      let metadataUploadResult;
      try {
        const metadataFileName = `metadata-${Date.now()}.json`;
        metadataUploadResult = await uploadMetadataToPinata(completeMetadata, metadataFileName);
      } catch (metadataError) {
        throw createMintError('ipfs-metadata', 'Failed to upload metadata to IPFS', metadataError as Error);
      }

      // Step 6: Mint NFT on Base
      updateProgress('MINTING', 75);
      let mintResult;
      let userPoints = 0;
      try {
        const receipt = await mintNFT(
          signer,
          metadataUploadResult.ipfsUrl,
          metadata.name,
          'OSLPFP' // Symbol for Onchain Summer Lagos PFP
        );
        
        if (!receipt) {
          throw new Error('Transaction receipt not found');
        }
        
        setTxHash(receipt.hash);
        
        // Get user points after minting
        userPoints = await getUserPoints(provider, address);
        
        mintResult = {
          transactionHash: receipt.hash,
          contractAddress: receipt.contractAddress || '0x2C4581D4cE74EeE134a0129CB9dF36e6300F5812',
          // Parse token ID from logs if available
          tokenId: receipt.logs && receipt.logs.length > 0 
            ? (receipt.logs[0].topics[3] || 'N/A')
            : 'N/A'
        };
      } catch (mintError) {
        throw createMintError('mint', 'Failed to mint NFT on Base', mintError as Error);
      }

      // Step 7: Create final NFT object
      const finalNFT: MintedNFT = {
        ...mintResult,
        ipfsCid: imageUploadResult.ipfsHash,
        metadataUri: metadataUploadResult.ipfsUrl,
        mintedAt: new Date(),
        userPoints
      };

      // Step 8: Complete
      updateProgress('COMPLETE', 100);
      setMintedNFT(finalNFT);
      
      return finalNFT;

    } catch (error) {
      console.error('Mint flow error:', error);
      setError(error as MintFlowError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setTxHash(null);
    setMintedNFT(null);
    setCurrentStep('');
    setProgress(0);
  }, []);

  return {
    mintFlier,
    isLoading,
    error,
    txHash,
    mintedNFT,
    currentStep,
    progress,
    resetState
  };
}