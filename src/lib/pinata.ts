// /lib/pinata.ts

// We'll use REST API directly since SDK methods are inconsistent
export interface PinataUploadResponse {
  ipfsHash: string;
  ipfsUrl: string;
  pinataUrl: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  background_color?: string;
}

/**
 * Upload an image file to IPFS via Pinata
 */
export async function uploadImageToPinata(
  imageBlob: Blob,
  fileName: string = "onchain-summer-pfp.png"
): Promise<PinataUploadResponse> {
  try {
    // Use REST API approach for more reliable uploads
    const formData = new FormData();
    formData.append('file', imageBlob, fileName);
    
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        type: "profile-picture",
        event: "onchain-summer-lagos",
        year: "2025"
      }
    });
    formData.append('pinataMetadata', metadata);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const ipfsHash = result.IpfsHash;
    const ipfsUrl = `ipfs://${ipfsHash}`;
    const pinataUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipfsHash}`;

    return {
      ipfsHash,
      ipfsUrl,
      pinataUrl
    };
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    throw new Error(`Failed to upload image to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload NFT metadata to IPFS via Pinata
 */
export async function uploadMetadataToPinata(
  metadata: NFTMetadata,
  fileName: string = "metadata.json"
): Promise<PinataUploadResponse> {
  try {
    // Use REST API for JSON uploads
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: fileName,
          keyvalues: {
            type: "nft-metadata",
            event: "onchain-summer-lagos",
            year: "2025"
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const ipfsHash = result.IpfsHash;
    const ipfsUrl = `ipfs://${ipfsHash}`;
    const pinataUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipfsHash}`;

    return {
      ipfsHash,
      ipfsUrl,
      pinataUrl
    };
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test Pinata connection
 */
export async function testPinataConnection(): Promise<boolean> {
  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Pinata connection test failed:", error);
    return false;
  }
}

/**
 * Get file from IPFS via Pinata gateway
 */
export function getIPFSUrl(hash: string): string {
  return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${hash}`;
}

/**
 * Pin existing IPFS content by hash - Using REST API fallback
 */
export async function pinByHash(ipfsHash: string, name?: string): Promise<void> {
  try {
    // Fallback to REST API since SDK might not support this method
    const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: JSON.stringify({
        hashToPin: ipfsHash,
        pinataMetadata: {
          name: name || `pinned-${ipfsHash.slice(0, 8)}`,
          keyvalues: {
            type: "external-pin",
            event: "onchain-summer-lagos"
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error pinning by hash:", error);
    throw new Error(`Failed to pin content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}