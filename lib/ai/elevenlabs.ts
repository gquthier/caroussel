import axios from 'axios';
import { ELEVENLABS_VOICE_SETTINGS } from '@/lib/prompts/original-n8n-prompts';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voice ID from n8n.json
const DEFAULT_VOICE_ID = ELEVENLABS_VOICE_SETTINGS.voice_id;

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export async function generateVoiceover(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<string> {
  console.log('🎙️ Appel Supabase Edge Function: generate-audio-elevenlabs');
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-audio-elevenlabs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voiceId }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.audioUrl;
  } catch (error) {
    console.error('ElevenLabs API Error:', error);
    throw new Error(`Voiceover generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getAvailableVoices() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  try {
    const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    return response.data.voices;
  } catch (error) {
    console.error('Failed to fetch voices:', error);
    return [];
  }
}

// Voice from n8n.json (NOpBlnGInO9m6vDvFkFC)
export const VOICE_OPTIONS = [
  { id: ELEVENLABS_VOICE_SETTINGS.voice_id, name: 'N8N Voice', description: 'Original voice from workflow' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Professional, clear' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Strong, confident' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft, warm' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Deep, narrative' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Young, energetic' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Casual, friendly' },
];
