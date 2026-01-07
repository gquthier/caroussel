export type SlideRole = 'HOOK' | 'CONTEXT' | 'DOPAMINE' | 'CLIMAX' | 'CTA';

export type VibeType = 
  | 'nike_greatness' 
  | 'horror_thread' 
  | 'educational' 
  | 'business_case'
  | 'luxury_brand'
  | 'tech_reveal';

export interface Slide {
  id: string;
  order: number;
  role: SlideRole;
  textContent: string;
  showCaption: boolean;
  imageUrl?: string;
  imagePrompt: string;
  imageStatus: 'pending' | 'generating' | 'completed' | 'failed';
  voiceoverUrl?: string;
  voiceoverText?: string;
  voiceId?: string;
  audioStatus: 'pending' | 'generating' | 'completed' | 'failed';
}

export interface Project {
  id: string;
  title: string;
  concept: string;
  vibe: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  slides: Slide[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryGenerationRequest {
  concept: string;
  vibe: VibeType;
}

export interface StoryGenerationResponse {
  projectId: string;
  title: string;
  slides: Array<{
    role: SlideRole;
    textContent: string;
    imagePrompt: string;
  }>;
}
