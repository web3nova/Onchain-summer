import type { Metadata } from 'next';
import OnchainSummerBooth from '@/components/onchain-summer-booth';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

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
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-purple-500/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Onchain Summer Lagos
            </span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Transform your photos into unique NFTs on Base Network. Join the Web3 revolution in Lagos.
          </p>


          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
            <a href="#create" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-12 px-8 bg-primary text-primary-foreground shadow hover:bg-primary/90">
              Start Creating →
            </a>
            <Button 
              onClick={() => open()}
              variant="outline" 
              className="h-12 px-8 bg-background/50 backdrop-blur-sm"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
            <a href="#learn-more" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-12 px-8 border border-input bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent hover:text-accent-foreground">
              Learn More
            </a>
          </div>
          
          {/* Stats/Quick Facts */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">3K+</div>
              <div className="text-sm text-muted-foreground">NFTs Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">2.5K</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">&lt;$0.01</div>
              <div className="text-sm text-muted-foreground">Average Gas Fee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Main Creation Section */}
      <section id="create" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Create Your NFT</h2>
            <p className="text-lg text-muted-foreground">
              Design your unique Onchain Summer profile picture and mint it on Base Network
            </p>
          </div>
          
          <OnchainSummerBooth />
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Features & Benefits</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create and mint your unique Onchain Summer profile picture
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Cards with Hover Effects */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-card border rounded-lg p-8 h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-semibold text-xl mb-3">Easy Creation</h3>
                <p className="text-muted-foreground">
                  Upload your photo, position it perfectly, and customize your Onchain Summer profile picture with our intuitive editor.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-card border rounded-lg p-8 h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-xl mb-3">Secure Storage</h3>
                <p className="text-muted-foreground">
                  Your images are stored permanently on IPFS, ensuring your NFTs remain accessible and secure forever.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-card border rounded-lg p-8 h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-xl mb-3">Instant Minting</h3>
                <p className="text-muted-foreground">
                  Mint your NFT instantly on Base Network using Zora Protocol with minimal gas fees.
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mt-24">
            <h3 className="text-2xl font-bold text-center mb-12">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Upload Photo</h4>
                <p className="text-sm text-muted-foreground">Choose your favorite photo to customize</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">2️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Customize</h4>
                <p className="text-sm text-muted-foreground">Position and adjust your image perfectly</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">3️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Connect Wallet</h4>
                <p className="text-sm text-muted-foreground">Connect your Web3 wallet to mint</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">4️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Mint NFT</h4>
                <p className="text-sm text-muted-foreground">Create your NFT on Base Network</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Join the Lagos Web3 Community</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join Lagos Web3 creators building the decentralized future. Create, mint, and own your digital identity on Base Network.
              </p>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="flex items-start gap-2">
                  <div className="mt-1">✨</div>
                  <div>
                    <div className="font-semibold">Free Minting</div>
                    <div className="text-muted-foreground">Minimal gas fees on Base</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">🔒</div>
                  <div>
                    <div className="font-semibold">Secure Storage</div>
                    <div className="text-muted-foreground">IPFS distributed storage</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">🌍</div>
                  <div>
                    <div className="font-semibold">Global Access</div>
                    <div className="text-muted-foreground">Connect from anywhere</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">⚡</div>
                  <div>
                    <div className="font-semibold">Fast Protocol</div>
                    <div className="text-muted-foreground">Powered by Zora and Base</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-75" />
              <div className="relative bg-card border rounded-lg p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                    <div className="flex-1">
                      <div className="h-2 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-2 w-32 bg-muted rounded mt-2 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-muted rounded animate-pulse" />
                    <div className="h-2 w-5/6 bg-muted rounded animate-pulse" />
                    <div className="h-2 w-4/6 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Onchain Summer Lagos</h3>
                <p className="text-sm text-muted-foreground">
                Transform photos into NFTs on Base Network.
                </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Base Network ↗
                  </a>
                </li>
                <li>
                  <a href="https://zora.co" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Zora Protocol ↗
                  </a>
                </li>
                <li>
                  <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    IPFS Storage ↗
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Onchain Summer Lagos. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}