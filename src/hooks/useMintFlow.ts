// /hooks/useMintFlow.ts
import { useState, useCallback } from 'react';
import React from 'react'; // Add missing React import
import { useAccount } from 'wagmi';
import { uploadImageToPinata, uploadMetadataToPinata, type NFTMetadata } from '@/lib/pinata';
import { createAndMintNFT, ensureCorrectNetwork, type MintResult } from '@/lib/zora-mint';

export interface FlierMetadata {
  name: string;
  description: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

export interface MintedNFT extends MintResult {
  ipfsCid: string;
  metadataUri: string;
  mintedAt: Date;
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
  MINTING: 'Minting NFT on Zora...',
  SAVING_BACKEND: 'Saving to database...',
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

  const saveToBackend = async (nftData: MintedNFT): Promise<void> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!backendUrl) {
        console.warn('No backend URL configured, skipping database save');
        return;
      }

      const response = await fetch(`${backendUrl}/api/nfts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          ipfsCid: nftData.ipfsCid,
          metadataUri: nftData.metadataUri,
          tokenId: nftData.tokenId,
          contractAddress: nftData.contractAddress,
          transactionHash: nftData.transactionHash,
          eventData: {
            eventName: 'Onchain Summer Lagos',
            mintedAt: nftData.mintedAt.toISOString(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend save failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Successfully saved to backend:', result);
    } catch (error) {
      console.error('Backend save error (non-critical):', error);
      // Don't throw here - backend save failure shouldn't fail the entire mint
    }
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
        await ensureCorrectNetwork();
      } catch (networkError) {
        throw createMintError('network', 'Please switch to Base network', networkError as Error);
      }

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

      // Step 6: Mint NFT on Zora
      updateProgress('MINTING', 75);
      let mintResult;
      try {
        mintResult = await createAndMintNFT(
          metadataUploadResult.ipfsUrl,
          address,
          'Onchain Summer Lagos PFP',
          'OSLPFP'
        );
        setTxHash(mintResult.transactionHash);
      } catch (mintError) {
        throw createMintError('mint', 'Failed to mint NFT on Zora', mintError as Error);
      }

      // Step 7: Create final NFT object
      const finalNFT: MintedNFT = {
        ...mintResult,
        ipfsCid: imageUploadResult.ipfsHash,
        metadataUri: metadataUploadResult.ipfsUrl,
        mintedAt: new Date()
      };

      // Step 8: Save to backend (non-critical)
      updateProgress('SAVING_BACKEND', 90);
      try {
        await saveToBackend(finalNFT);
      } catch (backendError) {
        // Log but don't fail the mint
        console.warn('Backend save failed (non-critical):', backendError);
      }

      // Step 9: Complete
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

// Hook for fetching user's previously minted NFTs
export function useUserNFTs(walletAddress?: string) {
  const [nfts, setNfts] = useState<MintedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNFTs = useCallback(async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/nfts/${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
      }

      const data = await response.json();
      setNfts(data.nfts || []);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Auto-fetch when wallet address changes
  React.useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  return {
    nfts,
    isLoading,
    error,
    refetch: fetchNFTs
  };
}