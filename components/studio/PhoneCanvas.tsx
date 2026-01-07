'use client';

import { Slide } from '@/lib/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play, Loader2, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PhoneCanvasProps {
  slide: Slide | null;
  onTextEdit: (text: string) => void;
  onToggleCaption?: (show: boolean) => void;
  activeSlideId?: string | null;
}

export function PhoneCanvas({ slide, onTextEdit, onToggleCaption, activeSlideId }: PhoneCanvasProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle audio slide (when activeSlideId is 'audio')
  if (activeSlideId === 'audio') {
    // Find the first slide with audio from the parent component
    const audioSlide = slide && 'voiceoverUrl' in slide && slide.voiceoverUrl 
      ? slide 
      : null;
    
    if (!audioSlide || !audioSlide.voiceoverUrl) {
      return (
        <div className="h-full flex items-center justify-center bg-canvas-dark">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-serif">Audio not available yet</p>
          </div>
        </div>
      );
    }

    // Audio player view
    return (
      <div className="h-full flex flex-col items-center justify-center bg-canvas-dark p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md"
        >
          <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl">
            <div className="relative phone-aspect rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-terracotta/30 to-terracotta/10 flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎵</div>
                <h2 className="text-2xl font-serif font-bold text-white mb-2">Audio Narration</h2>
                <p className="text-sm text-white/70 mb-6">Voiceover for the carousel</p>
                
                <Button
                  size="lg"
                  onClick={() => {
                    if (audioRef.current) {
                      if (isPlayingAudio) {
                        audioRef.current.pause();
                        setIsPlayingAudio(false);
                      } else {
                        audioRef.current.play();
                        setIsPlayingAudio(true);
                      }
                    }
                  }}
                  className="rounded-full px-8 py-6 text-lg"
                >
                  <Play className={cn('w-6 h-6 mr-2', isPlayingAudio ? 'animate-pulse' : '')} />
                  {isPlayingAudio ? 'Pause' : 'Play'}
                </Button>
              </div>
              
              <audio
                ref={audioRef}
                src={audioSlide.voiceoverUrl}
                onEnded={() => setIsPlayingAudio(false)}
              />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!slide) {
    return (
      <div className="h-full flex items-center justify-center bg-canvas-dark">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-serif">Select a slide to preview</p>
        </div>
      </div>
    );
  }

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    onTextEdit(text);
  };

  const handlePlayAudio = () => {
    if (audioRef.current && slide.voiceoverUrl) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const handleDownloadImage = async () => {
    if (!slide?.imageUrl) return;
    
    try {
      const response = await fetch(slide.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slide-${slide.order + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image');
    }
  };

  const handleToggleCaption = () => {
    if (onToggleCaption) {
      onToggleCaption(!slide?.showCaption);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-canvas-dark p-8">
      {/* Phone mockup container */}
      <motion.div
        key={slide.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md"
      >
        {/* Phone frame */}
        <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl">
          {/* Screen */}
          <div className="relative phone-aspect rounded-[2.5rem] overflow-hidden bg-black">
            {/* Image background */}
            {slide.imageStatus === 'completed' && slide.imageUrl ? (
              <Image
                src={slide.imageUrl}
                alt="Slide visual"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-stone flex items-center justify-center">
                {slide.imageStatus === 'generating' && (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-terracotta mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Generating image...</p>
                  </div>
                )}
                {slide.imageStatus === 'pending' && (
                  <p className="text-sm text-muted-foreground">Image pending...</p>
                )}
                {slide.imageStatus === 'failed' && (
                  <p className="text-sm text-destructive">Image generation failed</p>
                )}
              </div>
            )}

            {/* Text overlay - only show if showCaption is true */}
            {slide.showCaption && (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div
                  contentEditable={isEditingText}
                  onBlur={() => setIsEditingText(false)}
                  onInput={handleTextChange}
                  onClick={() => setIsEditingText(true)}
                  suppressContentEditableWarning
                  className="text-white text-2xl md:text-3xl font-bold text-center leading-tight shadow-2xl cursor-text"
                  style={{
                    textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6)',
                    WebkitTextStroke: '1px rgba(0,0,0,0.3)',
                  }}
                >
                  {slide.textContent}
                </div>
              </div>
            )}

            {/* Control buttons - Bottom right */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              {/* Toggle caption button */}
              <Button
                size="icon"
                variant="secondary"
                onClick={handleToggleCaption}
                className="rounded-full shadow-lg"
                title={slide.showCaption ? "Hide caption" : "Show caption"}
              >
                {slide.showCaption ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </Button>

              {/* Download image button */}
              {slide.imageUrl && (
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleDownloadImage}
                  className="rounded-full shadow-lg"
                  title="Download image as PNG"
                >
                  <Download className="w-5 h-5" />
                </Button>
              )}

              {/* Audio player button */}
              {slide.voiceoverUrl && (
                <Button
                  size="icon"
                  variant="default"
                  onClick={handlePlayAudio}
                  className="rounded-full shadow-lg"
                  title="Play audio"
                >
                  <Play className={cn('w-5 h-5', isPlayingAudio ? 'animate-pulse' : '')} />
                </Button>
              )}
            </div>

            {/* Hidden audio element */}
            {slide.voiceoverUrl && (
              <audio
                ref={audioRef}
                src={slide.voiceoverUrl}
                onEnded={() => setIsPlayingAudio(false)}
              />
            )}
          </div>

          {/* Phone notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
        </div>

        {/* Slide info below phone */}
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {slide.showCaption ? 'Click on text to edit' : 'Caption hidden'} • {slide.role}
          </p>
          <div className="flex gap-2 justify-center text-xs text-muted-foreground">
            <span title="Toggle caption visibility">👁️ Show/Hide</span>
            <span>•</span>
            <span title="Download image">⬇️ Download</span>
            {slide.voiceoverUrl && (
              <>
                <span>•</span>
                <span title="Play audio">▶️ Audio</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

