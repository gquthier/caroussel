'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type GenerationStage = 
  | 'idle' 
  | 'analyzing' 
  | 'scripting' 
  | 'generating_images' 
  | 'recording_audio' 
  | 'complete';

const STAGE_MESSAGES: Record<GenerationStage, string> = {
  idle: '',
  analyzing: 'Analyzing your concept...',
  scripting: 'Writing the screenplay...',
  generating_images: 'Developing visual frames...',
  recording_audio: 'Recording voiceovers...',
  complete: 'Your chapter is ready!',
};

export function StoryTrigger() {
  const router = useRouter();
  const [concept, setConcept] = useState('');
  const [generationStage, setGenerationStage] = useState<GenerationStage>('idle');
  const [progress, setProgress] = useState(0);

  const isGenerating = generationStage !== 'idle' && generationStage !== 'complete';

  const handleGenerate = async () => {
    if (!concept.trim()) return;

    try {
      // Stage 1: Analyzing
      setGenerationStage('analyzing');
      setProgress(10);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 2: Scripting
      setGenerationStage('scripting');
      setProgress(25);

      const response = await axios.post('/api/projects/generate', {
        concept,
      });

      const projectId = response.data.projectId;

      // Stage 3: Images generating
      setGenerationStage('generating_images');
      setProgress(50);

      // Poll for project completion
      const pollInterval = setInterval(async () => {
        try {
          const projectResponse = await axios.get(`/api/projects/${projectId}`);
          const project = projectResponse.data;

          const completedSlides = project.slides.filter(
            (s: any) => s.imageStatus === 'completed' && s.audioStatus === 'completed'
          ).length;
          const totalSlides = project.slides.length;

          const progressPercent = 50 + (completedSlides / totalSlides) * 40;
          setProgress(progressPercent);

          if (completedSlides >= totalSlides * 0.5) {
            setGenerationStage('recording_audio');
          }

          if (project.status === 'completed') {
            clearInterval(pollInterval);
            setGenerationStage('complete');
            setProgress(100);
            
            // Navigate to studio after a brief moment
            setTimeout(() => {
              router.push(`/studio/${projectId}`);
            }, 1500);
          }
        } catch (error) {
          console.error('Error polling project:', error);
        }
      }, 3000);

      // Safety timeout
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generationStage !== 'complete') {
          // Even if not complete, navigate to studio
          router.push(`/studio/${projectId}`);
        }
      }, 180000); // 3 minutes max
    } catch (error) {
      console.error('Error generating story:', error);
      setGenerationStage('idle');
      setProgress(0);
      alert('Failed to generate story. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <AnimatePresence mode="wait">
        {!isGenerating ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Main input */}
            <div className="text-center space-y-6">
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-anthracite">
                What's your story?
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Share your concept and we'll transform it into a viral "Greatness" style carousel
              </p>
              <p className="text-sm text-terracotta max-w-2xl mx-auto">
                ✨ Style Nike "Find Your Greatness" - Storytelling émotionnel et inspirant
              </p>
              
              <div className="max-w-3xl mx-auto">
                <Textarea
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ex: L'histoire d'un athlète ordinaire qui a surmonté l'impossible..."
                  className="min-h-[120px] text-lg resize-none"
                />
              </div>
            </div>

            {/* Generate button */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!concept.trim()}
                className="px-12 py-6 text-lg"
              >
                Write the Chapter
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8 py-16"
          >
            {/* Loading animation */}
            <div className="relative w-32 h-32 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-stone rounded-full border-t-terracotta"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-terracotta" />
              </div>
            </div>

            {/* Stage message */}
            <div className="space-y-4">
              <h2 className="font-serif text-3xl font-semibold">
                {STAGE_MESSAGES[generationStage]}
              </h2>
              <p className="text-muted-foreground">
                This may take 2-3 minutes. Grab a coffee ☕
              </p>
            </div>

            {/* Progress bar */}
            <div className="max-w-md mx-auto">
              <div className="w-full h-3 bg-stone rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-terracotta"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(progress)}% complete
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
