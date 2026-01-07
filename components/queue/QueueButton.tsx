'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Image, Mic, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface QueueProject {
  id: string;
  title: string;
  concept: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalSlides: number;
    completedImages: number;
    completedAudio: number;
    failedImages: number;
    failedAudio: number;
    overallProgress: number;
  };
  slides: Array<{
    id: string;
    order: number;
    role: string;
    imageStatus: string;
    audioStatus: string;
    textContent: string;
  }>;
}

export function QueueButton() {
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState<QueueProject[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/queue');
      setQueue(response.data.queue || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 3000); // Refresh every 3s
      return () => clearInterval(interval);
    }
  }, [open]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'generating': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg bg-terracotta text-white hover:bg-terracotta-dark"
        title="Queue Management - Voir les générations en cours"
      >
        <span className="font-bold text-xl">Q</span>
        {queue.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
            {queue.length}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-2">
              <Clock className="w-6 h-6 text-terracotta" />
              Queue Management
            </DialogTitle>
            <DialogDescription>
              Générations en cours et historique récent
            </DialogDescription>
          </DialogHeader>

          {loading && queue.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune génération en cours</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {queue.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border border-stone rounded-lg p-4 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.concept}
                        </p>
                      </div>
                      <Badge variant={project.status === 'generating' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression globale</span>
                        <span className="font-semibold">{project.stats.overallProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.stats.overallProgress}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-terracotta"
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Image className="w-4 h-4 text-blue-600" />
                        <span>{project.stats.completedImages}/{project.stats.totalSlides}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mic className="w-4 h-4 text-purple-600" />
                        <span>{project.stats.completedAudio}/{project.stats.totalSlides}</span>
                      </div>
                      {project.stats.failedImages > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>{project.stats.failedImages} failed</span>
                        </div>
                      )}
                      <div className="text-right text-muted-foreground">
                        {new Date(project.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Slides overview */}
                    <div className="flex gap-1 flex-wrap">
                      {project.slides.map((slide) => (
                        <div
                          key={slide.id}
                          className="relative w-8 h-8 rounded border border-stone flex items-center justify-center text-xs font-semibold"
                          title={`Slide ${slide.order + 1} - ${slide.role}`}
                        >
                          {slide.order + 1}
                          <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(slide.imageStatus)}`} title="Image" />
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(slide.audioStatus)}`} title="Audio" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-stone">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/studio/${project.id}`, '_blank')}
                      >
                        Ouvrir le studio
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchQueue()}
                      >
                        Rafraîchir
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-stone">
            <p className="text-xs text-center text-muted-foreground">
              🔄 Mise à jour automatique toutes les 3 secondes
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
