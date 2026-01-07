'use client';

import { Slide } from '@/lib/types';
import { cn, getRoleColor } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface SlideRailProps {
  slides: Slide[];
  activeSlideId: string | null;
  onSelectSlide: (slideId: string) => void;
}

export function SlideRail({ slides, activeSlideId, onSelectSlide }: SlideRailProps) {
  return (
    <div className="h-full bg-white border-r border-stone overflow-y-auto">
      <div className="p-4 border-b border-stone">
        <h3 className="font-serif font-semibold text-lg">Slides</h3>
        <p className="text-sm text-muted-foreground">{slides.length} frames</p>
      </div>
      
      <div className="p-2 space-y-2">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectSlide(slide.id)}
            className={cn(
              'cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md',
              activeSlideId === slide.id
                ? 'border-terracotta bg-terracotta/5'
                : 'border-stone bg-white hover:border-stone-dark'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Slide number and role badge */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-stone flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <span
                  className={cn(
                    'mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-medium',
                    getRoleColor(slide.role)
                  )}
                >
                  {slide.role}
                </span>
              </div>

              {/* Preview content */}
              <div className="flex-1 min-w-0">
                {/* Image preview */}
                {slide.imageStatus === 'completed' && slide.imageUrl ? (
                  <div className="relative w-full aspect-[9/16] rounded overflow-hidden mb-2">
                    <Image
                      src={slide.imageUrl}
                      alt={`Slide ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[9/16] rounded bg-stone mb-2 flex items-center justify-center">
                    <div className="text-center text-xs text-muted-foreground">
                      {slide.imageStatus === 'generating' && (
                        <div className="animate-pulse">Generating...</div>
                      )}
                      {slide.imageStatus === 'pending' && <div>Pending</div>}
                      {slide.imageStatus === 'failed' && (
                        <div className="text-destructive">Failed</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Text preview */}
                <p className="text-xs line-clamp-2 text-anthracite">
                  {slide.textContent}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Audio Slide - Always at the end */}
        {slides.length > 0 && slides.some(s => s.voiceoverUrl) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: slides.length * 0.05 }}
            onClick={() => onSelectSlide('audio')}
            className={cn(
              'cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md',
              activeSlideId === 'audio'
                ? 'border-terracotta bg-terracotta/5'
                : 'border-stone bg-white hover:border-stone-dark'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center text-xs font-semibold text-white">
                  🎙️
                </div>
                <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-medium bg-terracotta/20 text-terracotta">
                  AUDIO
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="w-full aspect-[9/16] rounded bg-gradient-to-br from-terracotta/20 to-terracotta/5 mb-2 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎵</div>
                    <div className="text-xs text-muted-foreground">Voiceover</div>
                  </div>
                </div>
                <p className="text-xs line-clamp-2 text-anthracite">
                  Audio narration
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
