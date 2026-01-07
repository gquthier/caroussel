// ZIP export functionality
// This creates a downloadable ZIP with all project assets

import { Project } from '@/lib/types';

export interface ZipExportOptions {
  includeImages: boolean;
  includeAudio: boolean;
  includeMetadata: boolean;
}

/**
 * Export project as ZIP file with all assets
 * 
 * TODO: Implement with JSZip
 * - Fetch all image URLs
 * - Fetch all audio URLs
 * - Create folder structure
 * - Add metadata JSON
 * - Generate ZIP blob
 */
export async function exportAsZip(
  project: Project,
  options: ZipExportOptions
): Promise<Blob> {
  throw new Error('ZIP export not yet implemented. Coming soon!');
  
  // Future implementation with JSZip:
  // const JSZip = require('jszip');
  // const zip = new JSZip();
  // 
  // const folder = zip.folder(project.title);
  // 
  // // Add images
  // if (options.includeImages) {
  //   const imagesFolder = folder.folder('images');
  //   for (const slide of project.slides) {
  //     const response = await fetch(slide.imageUrl);
  //     const blob = await response.blob();
  //     imagesFolder.file(`slide-${slide.order + 1}.png`, blob);
  //   }
  // }
  // 
  // // Add audio
  // if (options.includeAudio) {
  //   const audioFolder = folder.folder('audio');
  //   for (const slide of project.slides) {
  //     const response = await fetch(slide.voiceoverUrl);
  //     const blob = await response.blob();
  //     audioFolder.file(`slide-${slide.order + 1}.mp3`, blob);
  //   }
  // }
  // 
  // // Add metadata
  // if (options.includeMetadata) {
  //   const metadata = {
  //     project: {
  //       id: project.id,
  //       title: project.title,
  //       concept: project.concept,
  //       vibe: project.vibe,
  //     },
  //     slides: project.slides.map(s => ({
  //       order: s.order,
  //       role: s.role,
  //       text: s.textContent,
  //       imagePrompt: s.imagePrompt,
  //     })),
  //   };
  //   folder.file('metadata.json', JSON.stringify(metadata, null, 2));
  // }
  // 
  // return await zip.generateAsync({ type: 'blob' });
}

/**
 * Trigger browser download of blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
