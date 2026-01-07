'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StudioLayout } from '@/components/studio/StudioLayout';
import { Project } from '@/lib/types';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function StudioPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();

    // Poll for updates while assets are generating
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (err) {
        console.error('Error polling project:', err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [projectId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-canvas">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-terracotta mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen flex items-center justify-center bg-canvas">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">{error || 'Project not found'}</p>
          <a href="/" className="text-terracotta hover:underline">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return <StudioLayout project={project} onProjectUpdate={setProject} />;
}
