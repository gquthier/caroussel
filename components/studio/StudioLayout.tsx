'use client';

import { Project, Slide } from '@/lib/types';
import { SlideRail } from './SlideRail';
import { PhoneCanvas } from './PhoneCanvas';
import { AIControls } from './AIControls';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ExportDialog } from './ExportDialog';

interface StudioLayoutProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export function StudioLayout({ project, onProjectUpdate }: StudioLayoutProps) {
  const router = useRouter();
  const [activeSlideId, setActiveSlideId] = useState<string | null>(
    project.slides[0]?.id || null
  );
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [isRegeneratingAudio, setIsRegeneratingAudio] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Handle audio slide selection - find first slide with audio
  const audioSlide = project.slides.find(s => s.voiceoverUrl);
  const activeSlide = activeSlideId === 'audio' 
    ? (audioSlide ? { ...audioSlide, id: 'audio', role: 'AUDIO' as any } : null)
    : project.slides.find((s) => s.id === activeSlideId) || null;

  const handleTextEdit = async (text: string) => {
    if (!activeSlide) return;

    try {
      await axios.patch(`/api/slides/${activeSlide.id}`, {
        textContent: text,
      });

      // Update local state
      const updatedProject = {
        ...project,
        slides: project.slides.map((s) =>
          s.id === activeSlide.id ? { ...s, textContent: text } : s
        ),
      };
      onProjectUpdate(updatedProject);
    } catch (error) {
      console.error('Failed to update text:', error);
    }
  };

  const handleToggleCaption = async (show: boolean) => {
    if (!activeSlide) return;

    try {
      await axios.patch(`/api/slides/${activeSlide.id}`, {
        showCaption: show,
      });

      // Update local state
      const updatedProject = {
        ...project,
        slides: project.slides.map((s) =>
          s.id === activeSlide.id ? { ...s, showCaption: show } : s
        ),
      };
      onProjectUpdate(updatedProject);
    } catch (error) {
      console.error('Failed to toggle caption:', error);
    }
  };

  const handleRegenerateImage = async () => {
    if (!activeSlide) return;

    setIsRegeneratingImage(true);
    try {
      const response = await axios.post(`/api/slides/${activeSlide.id}/regenerate-image`);
      
      // Update local state
      const updatedProject = {
        ...project,
        slides: project.slides.map((s) =>
          s.id === activeSlide.id ? response.data : s
        ),
      };
      onProjectUpdate(updatedProject);
    } catch (error) {
      console.error('Failed to regenerate image:', error);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  const handleRegenerateAudio = async (voiceId: string) => {
    if (!activeSlide) return;

    setIsRegeneratingAudio(true);
    try {
      const response = await axios.post(`/api/slides/${activeSlide.id}/regenerate-audio`, {
        voiceId,
      });
      
      // Update local state
      const updatedProject = {
        ...project,
        slides: project.slides.map((s) =>
          s.id === activeSlide.id ? response.data : s
        ),
      };
      onProjectUpdate(updatedProject);
    } catch (error) {
      console.error('Failed to regenerate audio:', error);
    } finally {
      setIsRegeneratingAudio(false);
    }
  };

  const handleUpdateImagePrompt = async (prompt: string) => {
    if (!activeSlide) return;

    try {
      await axios.patch(`/api/slides/${activeSlide.id}`, {
        imagePrompt: prompt,
      });

      // Update local state
      const updatedProject = {
        ...project,
        slides: project.slides.map((s) =>
          s.id === activeSlide.id ? { ...s, imagePrompt: prompt } : s
        ),
      };
      onProjectUpdate(updatedProject);
    } catch (error) {
      console.error('Failed to update image prompt:', error);
    }
  };

  const handleUpdateVoiceoverText = async (text: string) => {
    if (!activeSlide) return;

    try {
      await axios.patch(`/api/slides/${activeSlide.id}`, {
        voiceoverText: text,
      });

      // Update local state
      const updatedProject = {
        ...project,
        slides: project.slides.map((s) =>
          s.id === activeSlide.id ? { ...s, voiceoverText: text } : s
        ),
      };
      onProjectUpdate(updatedProject);
    } catch (error) {
      console.error('Failed to update voiceover text:', error);
    }
  };

  const handleUploadImage = async (file: File) => {
    if (!activeSlide) return;

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        await axios.patch(`/api/slides/${activeSlide.id}`, {
          imageUrl: base64Image,
        });

        // Update local state
        const updatedProject = {
          ...project,
          slides: project.slides.map((s) =>
            s.id === activeSlide.id ? { ...s, imageUrl: base64Image, imageStatus: 'completed' as const } : s
          ),
        };
        onProjectUpdate(updatedProject);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    }
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-canvas">
      {/* Header */}
      <header className="bg-white border-b border-stone px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-serif text-xl font-semibold">{project.title}</h1>
            <p className="text-sm text-muted-foreground">
              {project.slides.length} slides • {project.vibe}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button disabled>
            <Share2 className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="flex-1 grid grid-cols-[280px_1fr_360px] overflow-hidden">
        {/* Left: Slide Rail */}
        <SlideRail
          slides={project.slides}
          activeSlideId={activeSlideId}
          onSelectSlide={setActiveSlideId}
        />

        {/* Center: Phone Canvas */}
        <PhoneCanvas
          slide={activeSlide}
          onTextEdit={handleTextEdit}
          onToggleCaption={handleToggleCaption}
          activeSlideId={activeSlideId}
        />

        {/* Right: AI Controls */}
        <AIControls
          slide={activeSlide}
          onRegenerateImage={handleRegenerateImage}
          onRegenerateAudio={handleRegenerateAudio}
          onUpdateImagePrompt={handleUpdateImagePrompt}
          onUpdateVoiceoverText={handleUpdateVoiceoverText}
          onUploadImage={handleUploadImage}
          isRegeneratingImage={isRegeneratingImage}
          isRegeneratingAudio={isRegeneratingAudio}
        />
      </div>

      {/* Export Dialog */}
      <ExportDialog
        project={project}
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
    </div>
  );
}
