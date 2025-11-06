'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React from 'react';

// Web3 imports
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';
import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { Web3Modal, Web3ModalProvider } from '@web3modal/wagmi/react';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Initialize WalletConnect
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Wagmi configuration with WalletConnect
const metadata = {
  name: 'Onchain Summer Booth',
  description: 'Create your Onchain Summer profile picture and mint it as an NFT.',
  url: 'https://onchain-summer-booth.vercel.app',
  icons: ['/favicon.ico']
};

const config = defaultWagmiConfig({
  chains: [base, baseSepolia],
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
});

// Initialize WalletConnect Modal
const modal = new Web3Modal({
  wagmiConfig: config,
  projectId,
  chains: [base, baseSepolia],
  defaultChain: base,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent-color': '#FF69B4',
    '--w3m-accent-fill-color': '#FFFFFF',
    '--w3m-border-radius': '12px'
  }
});

// Web3 Provider Component
function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3ModalProvider>
          {children}
        </Web3ModalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <html lang="en">
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
          </head>
          <body className="font-body antialiased">
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mb-4">
                  Please refresh the page and try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </body>
        </html>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Onchain Summer Booth</title>
        <meta name="description" content="Create your Onchain Summer profile picture." />
        <meta name="keywords" content="onchain summer, nft, base network, zora, web3, blockchain" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <Web3Provider>
            {children}
            <Toaster />
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}