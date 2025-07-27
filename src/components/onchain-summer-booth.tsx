"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Download, ZoomIn, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EDITOR_WIDTH = 512;
const EDITOR_HEIGHT = 512;

// To change the background, replace the URL in the following line with your image URL.
const BACKGROUND_IMAGE_URL = 'https://i.ibb.co/6g3rWZn/onchain-summer-lagos.png';


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
            const circleRadius = EDITOR_WIDTH * 0.075; // This is half of the 15% width/height
            const circleCenterX = EDITOR_WIDTH / 2;
            const circleCenterY = EDITOR_HEIGHT * 0.72 + circleRadius; // Centered based on top

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
                            className="absolute w-[15%] h-[15%] rounded-full overflow-hidden border-2 border-pink-300/50 shadow-lg"
                            style={{ 
                              top: '72%', 
                              left: '50%', 
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
                        className="absolute w-[15%] h-[15%] rounded-full pointer-events-none border-2 border-pink-300/50 border-dashed"
                        style={{ 
                          top: '72%', 
                          left: '50%', 
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={generateAndDownload} disabled={!imageSrc}>
                      <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" disabled>
                        <ZoraIcon />
                        <span className="ml-2">Mint on Zora</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zora minting coming soon!</p>
                    </TooltipContent>
                  </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </TooltipProvider>
  );
}
