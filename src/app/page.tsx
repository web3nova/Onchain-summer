import type { Metadata } from 'next';
import OnchainSummerBooth from '@/components/onchain-summer-booth';

// Metadata for the page (moved from layout.tsx since it's a client component now)
export const metadata: Metadata = {
  title: 'Onchain Summer Booth',
  description: 'Create your Onchain Summer profile picture and mint it as an NFT on Base Network.',
  keywords: 'onchain summer, nft, base network, zora, web3, blockchain, lagos, profile picture',
  authors: [{ name: 'Onchain Summer Lagos Team' }],
  openGraph: {
    title: 'Onchain Summer Booth',
    description: 'Create your Onchain Summer profile picture and mint it as an NFT on Base Network.',
    type: 'website',
    siteName: 'Onchain Summer Booth',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Onchain Summer Booth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onchain Summer Booth',
    description: 'Create your Onchain Summer profile picture and mint it as an NFT on Base Network.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header Section */}
      <div className="text-center mb-8 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
          Onchain Summer Lagos
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-2">
          Create your profile picture and mint it as an NFT
        </p>
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-semibold text-pink-500">Base Network</span> and <span className="font-semibold text-purple-500">Zora Protocol</span>
        </p>
      </div>

      {/* Main Component */}
      <OnchainSummerBooth />

      {/* Features Section */}
      <div className="mt-16 max-w-4xl w-full">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-card border rounded-lg p-6">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-semibold mb-2">Create</h3>
            <p className="text-sm text-muted-foreground">
              Upload your photo and customize your Onchain Summer profile picture
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-semibold mb-2">Connect</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to mint your creation as an NFT on Base Network
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">Mint</h3>
            <p className="text-sm text-muted-foreground">
              Mint your profile picture using Zora Protocol with low gas fees
            </p>
          </div>
        </div>
      </div>

      {/* Stats or Info Section */}
      <div className="mt-12 w-full max-w-4xl">
        <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-pink-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">
            Why Onchain Summer Lagos?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">✨ Free Minting:</span> Low gas fees on Base Network
            </div>
            <div>
              <span className="font-medium text-foreground">🔒 Permanent Storage:</span> Your images stored on IPFS forever
            </div>
            <div>
              <span className="font-medium text-foreground">🌍 Global Community:</span> Join the Lagos Web3 movement
            </div>
            <div>
              <span className="font-medium text-foreground">⚡ Instant Mint:</span> Powered by Zora's fast protocol
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        <a 
          href="https://base.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-500 transition-colors"
        >
          Base Network ↗
        </a>
        <a 
          href="https://zora.co" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-purple-500 transition-colors"
        >
          Zora Protocol ↗
        </a>
        <a 
          href="https://pinata.cloud" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-pink-500 transition-colors"
        >
          IPFS Storage ↗
        </a>
      </div>
    </main>
  );
}