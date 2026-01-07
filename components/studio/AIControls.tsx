'use client';

import { Slide } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dices, Upload, Sparkles, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { VOICE_OPTIONS } from '@/lib/ai/elevenlabs';

interface AIControlsProps {
  slide: Slide | null;
  onRegenerateImage: () => void;
  onRegenerateAudio: (voiceId: string) => void;
  onUpdateImagePrompt: (prompt: string) => void;
  onUpdateVoiceoverText: (text: string) => void;
  onUploadImage?: (file: File) => void;
  isRegeneratingImage: boolean;
  isRegeneratingAudio: boolean;
}

export function AIControls({
  slide,
  onRegenerateImage,
  onRegenerateAudio,
  onUpdateImagePrompt,
  onUpdateVoiceoverText,
  onUploadImage,
  isRegeneratingImage,
  isRegeneratingAudio,
}: AIControlsProps) {
  const [imagePrompt, setImagePrompt] = useState(slide?.imagePrompt || '');
  const [voiceoverText, setVoiceoverText] = useState(slide?.voiceoverText || slide?.textContent || '');
  const [selectedVoice, setSelectedVoice] = useState(slide?.voiceId || VOICE_OPTIONS[0].id);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!slide) {
    return (
      <div className="h-full bg-white border-l border-stone flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-serif text-lg">Select a slide to edit</p>
        </div>
      </div>
    );
  }

  const handleImagePromptChange = (value: string) => {
    setImagePrompt(value);
    onUpdateImagePrompt(value);
  };

  const handleVoiceoverTextChange = (value: string) => {
    setVoiceoverText(value);
    onUpdateVoiceoverText(value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(file);
    }
  };

  return (
    <div className="h-full bg-white border-l border-stone overflow-y-auto">
      <div className="p-4 border-b border-stone">
        <h3 className="font-serif font-semibold text-lg">AI Inspector</h3>
        <p className="text-sm text-muted-foreground">Fine-tune this slide</p>
      </div>

      <div className="p-4">
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
            <TabsTrigger value="audio" className="flex-1">Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4 mt-4">
            {/* Image status */}
            <div className="rounded-lg bg-canvas p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
              <p className="text-sm capitalize">{slide.imageStatus}</p>
            </div>

            {/* Image prompt editor */}
            <div className="space-y-2">
              <Label htmlFor="image-prompt">Visual Prompt</Label>
              <Textarea
                id="image-prompt"
                value={imagePrompt}
                onChange={(e) => handleImagePromptChange(e.target.value)}
                placeholder="Describe the visual you want to generate..."
                className="min-h-[120px] font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Describe the scene, mood, and visual style
              </p>
            </div>

            <Separator />

            {/* Regenerate button */}
            <div className="space-y-2">
              <Button
                onClick={onRegenerateImage}
                disabled={isRegeneratingImage || slide.imageStatus === 'generating'}
                className="w-full"
                size="lg"
              >
                {isRegeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Dices className="w-4 h-4 mr-2" />
                    Regenerate Image
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                ~30-60 seconds per image
              </p>
            </div>

            {/* Upload custom image */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                id="image-upload"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Custom Image
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                PNG, JPG, WEBP (max 10MB)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4 mt-4">
            {/* Audio status */}
            <div className="rounded-lg bg-canvas p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
              <p className="text-sm capitalize">{slide.audioStatus}</p>
            </div>

            {/* Voiceover text editor */}
            <div className="space-y-2">
              <Label htmlFor="voiceover-text">Script</Label>
              <Textarea
                id="voiceover-text"
                value={voiceoverText}
                onChange={(e) => handleVoiceoverTextChange(e.target.value)}
                placeholder="Text to be spoken..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                This text will be converted to speech
              </p>
            </div>

            {/* Voice selector */}
            <div className="space-y-2">
              <Label htmlFor="voice-select">Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger id="voice-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div>
                        <p className="font-medium">{voice.name}</p>
                        <p className="text-xs text-muted-foreground">{voice.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Regenerate audio button */}
            <div className="space-y-2">
              <Button
                onClick={() => onRegenerateAudio(selectedVoice)}
                disabled={isRegeneratingAudio || slide.audioStatus === 'generating'}
                className="w-full"
                size="lg"
              >
                {isRegeneratingAudio ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Regenerate Audio
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                ~10-20 seconds per audio clip
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
