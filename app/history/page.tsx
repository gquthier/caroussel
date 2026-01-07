'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/lib/types';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, Clock, Image as ImageIcon, Mic, FileText } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/history?limit=50');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-muted-foreground">Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-white border-b border-stone px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold">Historique des Générations</h1>
            <p className="text-sm text-muted-foreground">{projects.length} projets</p>
          </div>
          <Link href="/" className="text-terracotta hover:underline">
            ← Retour
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/studio/${project.id}`}>
                <div className="bg-white rounded-lg border border-stone p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  {/* Title */}
                  <h3 className="font-serif text-lg font-semibold mb-2 line-clamp-2">
                    {project.title}
                  </h3>

                  {/* Concept */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.concept}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>{project.slides.filter((s: any) => s.imageStatus === 'completed').length}/{project.slides.length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Mic className="w-4 h-4 text-purple-600" />
                      <span>{project.slides.filter((s: any) => s.audioStatus === 'completed').length}/{project.slides.length}</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  {project.initialScenario && (
                    <div className="text-xs text-green-600 flex items-center gap-1 mb-2">
                      <FileText className="w-3 h-3" />
                      <span>Viral Sauce appliquée ✓</span>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-stone">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'generating' ? 'bg-blue-100 text-blue-700' :
                      project.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun projet dans l'historique</p>
            <Link href="/" className="text-terracotta hover:underline mt-4 inline-block">
              Créer votre premier carousel
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
