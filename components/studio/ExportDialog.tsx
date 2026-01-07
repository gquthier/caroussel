'use client';

import { useState } from 'react';
import { Project } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileJson, FileArchive, Film, ExternalLink } from 'lucide-react';
import axios from 'axios';

interface ExportDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ project, open, onOpenChange }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const response = await axios.get(`/api/projects/${project.id}/export?format=json`);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      });
      downloadBlob(blob, `${project.title}-data.json`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportZIP = () => {
    alert('ZIP export coming soon! This will include all images and audio files.');
  };

  const handleExportVideo = () => {
    alert('Video export coming soon! This will create an MP4 with all slides and audio.');
  };

  const handleOpenInBrowser = () => {
    window.open(`/studio/${project.id}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Export Chapter</DialogTitle>
          <DialogDescription>
            Choose how you want to export your story
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="files" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4 mt-4">
            {/* JSON Export */}
            <div className="border border-stone rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileJson className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">JSON Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Export project data with all text, prompts, and asset URLs
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleExportJSON}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
              </div>
            </div>

            {/* ZIP Export */}
            <div className="border border-stone rounded-lg p-4 opacity-60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileArchive className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    ZIP Archive
                    <span className="ml-2 text-xs bg-stone px-2 py-0.5 rounded-full">Coming Soon</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download all images and audio files in a compressed archive
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleExportZIP}
                    disabled
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download ZIP
                  </Button>
                </div>
              </div>
            </div>

            {/* Video Export */}
            <div className="border border-stone rounded-lg p-4 opacity-60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Film className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    MP4 Video
                    <span className="ml-2 text-xs bg-stone px-2 py-0.5 rounded-full">Coming Soon</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Render a complete video with images, text, and audio
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleExportVideo}
                    disabled
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Render Video
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publish" className="space-y-4 mt-4">
            {/* Share Link */}
            <div className="border border-stone rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Share Link</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Open your chapter in a new tab to share or present
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleOpenInBrowser}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>

            {/* TikTok */}
            <div className="border border-stone rounded-lg p-4 opacity-60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">TT</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    TikTok
                    <span className="ml-2 text-xs bg-stone px-2 py-0.5 rounded-full">Coming Soon</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Publish directly to TikTok as a photo carousel
                  </p>
                  <Button variant="outline" disabled>
                    Connect TikTok
                  </Button>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="border border-stone rounded-lg p-4 opacity-60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">IG</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    Instagram Reels
                    <span className="ml-2 text-xs bg-stone px-2 py-0.5 rounded-full">Coming Soon</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Publish directly to Instagram as a Reel
                  </p>
                  <Button variant="outline" disabled>
                    Connect Instagram
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-stone">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: For best results, manually upload to social platforms using the JSON export and asset URLs
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
