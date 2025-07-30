"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Download, ZoomIn, RotateCcw, Loader2, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMintFlow } from '@/hooks/useMintFlow';

const EDITOR_WIDTH = 512;
const EDITOR_HEIGHT = 512;

// To change the background, replace the URL in the following line with your image URL.
const BACKGROUND_IMAGE_URL = '/Frame.png';

const FRAME_SIZE_PERCENT = 0.30; // 30%
const FRAME_TOP_PERCENT = 0.76; // 76% from top
const FRAME_LEFT_PERCENT = 0.50; // 50% from left

const ZoraIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
    </svg>
);

export default function OnchainSummerBooth() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Web3 hooks
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { mintFlier, isLoading: isMinting, error: mintError, txHash, mintedNFT, currentStep, progress } = useMintFlow();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
      setImageSrc(URL.createObjectURL(file));
      setPosition({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && imageContainerRef.current) {
      const x = e.clientX - dragStart.x;
      const y = e.clientY - dragStart.y;
      setPosition({ x, y });
    }
  }, [isDragging, dragStart.x, dragStart.y]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newZoom = zoom - e.deltaY * 0.001;
    setZoom(Math.max(0.5, Math.min(newZoom, 3)));
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const resetTransform = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Generate image blob for minting
  const generateImageBlob = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        resolve(null);
        return;
      }

      canvas.width = EDITOR_WIDTH;
      canvas.height = EDITOR_HEIGHT;

      const bgImage = new window.Image();
      bgImage.crossOrigin = 'anonymous';
      bgImage.src = BACKGROUND_IMAGE_URL;

      bgImage.onload = () => {
        ctx.drawImage(bgImage, 0, 0, EDITOR_WIDTH, EDITOR_HEIGHT);

        if (imageSrc) {
          const userImage = new window.Image();
          userImage.crossOrigin = 'anonymous';
          userImage.src = imageSrc;
          
          userImage.onload = () => {
            ctx.save();
            const circleRadius = (EDITOR_WIDTH * FRAME_SIZE_PERCENT) / 2;
            const circleCenterX = EDITOR_WIDTH * FRAME_LEFT_PERCENT;
            const circleCenterY = EDITOR_HEIGHT * FRAME_TOP_PERCENT;

            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            
            const scaledWidth = userImage.width * zoom;
            const scaledHeight = userImage.height * zoom;
            
            const imgX = circleCenterX - scaledWidth / 2 + position.x;
            const imgY = circleCenterY - scaledHeight / 2 + position.y;
            
            ctx.drawImage(userImage, imgX, imgY, scaledWidth, scaledHeight);
            ctx.restore();

            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/png');
          };

          userImage.onerror = () => {
            resolve(null);
          };
        } else {
          // If no user image, just return background
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        }
      };

      bgImage.onerror = () => {
        resolve(null);
      };
    });
  };
  
  const generateAndDownload = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.width = EDITOR_WIDTH;
    canvas.height = EDITOR_HEIGHT;

    const bgImage = new window.Image();
    bgImage.crossOrigin = 'anonymous';
    bgImage.src = BACKGROUND_IMAGE_URL;

    bgImage.onload = () => {
      ctx.drawImage(bgImage, 0, 0, EDITOR_WIDTH, EDITOR_HEIGHT);

      if (imageSrc) {
        const userImage = new window.Image();
        userImage.crossOrigin = 'anonymous';
        userImage.src = imageSrc;
        
        userImage.onload = () => {
            ctx.save();
            const circleRadius = (EDITOR_WIDTH * FRAME_SIZE_PERCENT) / 2;
            const circleCenterX = EDITOR_WIDTH * FRAME_LEFT_PERCENT;
            const circleCenterY = EDITOR_HEIGHT * FRAME_TOP_PERCENT;

            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            
            const scaledWidth = userImage.width * zoom;
            const scaledHeight = userImage.height * zoom;
            
            const imgX = circleCenterX - scaledWidth / 2 + position.x;
            const imgY = circleCenterY - scaledHeight / 2 + position.y;
            
            ctx.drawImage(userImage, imgX, imgY, scaledWidth, scaledHeight);
            ctx.restore();

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'onchain-summer-booth.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
      } else {
         // If no user image, just download background
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'onchain-summer-bg.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
  };

  // Handle minting to Zora
  const handleMintToZora = async () => {
    if (!imageSrc || !address) return;
    
    try {
      // Generate the image blob
      const imageBlob = await generateImageBlob();
      if (!imageBlob) {
        throw new Error('Failed to generate image');
      }
      
      // Mint with metadata
      await mintFlier(imageBlob, {
        name: "Onchain Summer Lagos PFP",
        description: "Profile picture generated at Onchain Summer Lagos 2025 event. A celebration of web3 and blockchain technology in Nigeria.",
        attributes: [
          { trait_type: "Event", value: "Onchain Summer Lagos" },
          { trait_type: "Year", value: "2025" },
          { trait_type: "Location", value: "Lagos, Nigeria" },
          { trait_type: "Type", value: "Profile Picture" }
        ]
      });
    } catch (error) {
      console.error('Minting failed:', error);
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-2xl w-full">
            <CardContent className="p-4">
                <div 
                    ref={imageContainerRef}
                    className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-200"
                    onMouseDown={handleMouseDown}
                    onWheel={handleWheel}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    <Image
                        src={BACKGROUND_IMAGE_URL}
                        alt="Onchain Summer background"
                        layout="fill"
                        objectFit="cover"
                        priority
                        data-ai-hint="vibrant summer"
                    />
                    {imageSrc && (
                        <div
                            className="absolute rounded-full overflow-hidden border-2 border-pink-300/50 shadow-lg"
                            style={{ 
                              width: `${FRAME_SIZE_PERCENT * 100}%`,
                              height: `${FRAME_SIZE_PERCENT * 100}%`,
                              top: `${FRAME_TOP_PERCENT * 100}%`, 
                              left: `${FRAME_LEFT_PERCENT * 100}%`, 
                              transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <img
                                src={imageSrc}
                                alt="User uploaded"
                                className="w-full h-full object-cover"
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                }}
                            />
                        </div>
                    )}
                     <div 
                        className="absolute rounded-full pointer-events-none border-2 border-pink-300/50 border-dashed"
                        style={{ 
                          width: `${FRAME_SIZE_PERCENT * 100}%`,
                          height: `${FRAME_SIZE_PERCENT * 100}%`,
                          top: `${FRAME_TOP_PERCENT * 100}%`, 
                          left: `${FRAME_LEFT_PERCENT * 100}%`, 
                          transform: 'translate(-50%, -50%)' 
                        }}
                     />
                </div>
            </CardContent>
        </Card>
        
        <div className="flex flex-col gap-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-3xl text-primary">Onchain Summer Lagos</CardTitle>
              <CardDescription>Create your profile picture for Onchain Summer. Upload your photo and position it in the frame.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                <Upload className="mr-2 h-4 w-4" /> Upload Photo
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <Label htmlFor="zoom-slider" className="flex items-center gap-2">
                        <ZoomIn className="h-4 w-4" /> Zoom
                    </Label>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetTransform}>
                        <RotateCcw className="h-4 w-4" />
                        <span className="sr-only">Reset</span>
                    </Button>
                </div>
                <Slider
                  id="zoom-slider"
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={0.5}
                  max={3}
                  step={0.01}
                  disabled={!imageSrc}
                />
              </div>

              {/* Wallet Connection Section */}
              <div className="space-y-3">
                <Label>Wallet Connection</Label>
                <div className="flex flex-col gap-2">
                  <ConnectButton />
                  {isConnected && address && (
                    <div className="text-xs text-muted-foreground">
                      Connected: {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Minting Progress */}
              {isMinting && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{currentStep}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    {progress}% Complete
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={generateAndDownload} disabled={!imageSrc || isMinting}>
                      <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  
                  {!isConnected ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" disabled>
                          <ZoraIcon />
                          <span className="ml-2">Mint on Zora</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Connect wallet to mint NFT</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button 
                      onClick={handleMintToZora} 
                      disabled={!imageSrc || isMinting}
                      variant="outline"
                    >
                      {isMinting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ZoraIcon />
                      )}
                      <span className="ml-2">
                        {isMinting ? 'Minting...' : 'Mint on Zora'}
                      </span>
                    </Button>
                  )}
              </div>

              {/* Status Messages */}
              {txHash && (
                <div className="space-y-2">
                  <div className="text-sm text-green-600 font-medium">
                    ✅ Minted successfully!
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => window.open(`https://basescan.org/tx/${txHash}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  {mintedNFT && (
                    <div className="text-xs text-gray-600">
                      Token ID: {mintedNFT.tokenId}
                    </div>
                  )}
                </div>
              )}

              {mintError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <div className="font-medium">Minting failed:</div>
                  <div className="text-xs mt-1">{mintError.message}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </TooltipProvider>
  );
}