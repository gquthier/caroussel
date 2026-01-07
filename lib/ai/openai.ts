import OpenAI from 'openai';
import { SlideRole } from '@/lib/types';
import {
  SCENARIO_SYSTEM_PROMPT,
  SCENARIO_CONTEXT_PROMPT,
  REWORK_SCENARIO_SYSTEM_PROMPT,
  REWORK_SCENARIO_CONTEXT_PROMPT,
  REWORK_SCENARIO_USER_PROMPT,
  SCRIPT_SYSTEM_PROMPT,
  SCRIPT_CONTEXT_PROMPT,
  SCRIPT_USER_PROMPT,
  SCRIPT_CONSTRAINTS,
  IMAGE_PROMPT_SYSTEM_PROMPT,
  IMAGE_PROMPT_USER_PROMPT,
  SCRIPT_NORMALIZATION_PROMPT
} from '@/lib/prompts/original-n8n-prompts';

// Client OpenAI (utilise la vraie clé OpenAI pour TOUT)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
});

interface ScriptSlide {
  numero: number;
  prompt: string;
}

interface ImagePromptResponse {
  images: ScriptSlide[];
}

interface ScenarioSlide {
  role: SlideRole;
  textContent: string;
  imagePrompt: string;
}

/**
 * ÉTAPE 1: Génération du scénario (comme n8n "Scenario")
 * Appelle Supabase Edge Function au lieu d'OpenAI directement
 */
export async function generateScenario(userConcept: string): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  const response = await fetch(
    `${supabaseUrl}/functions/v1/generate-scenario`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ concept: userConcept }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase Edge Function error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      url: `${supabaseUrl}/functions/v1/generate-scenario`,
      keyPrefix: supabaseKey?.substring(0, 20)
    });
    
    // Si erreur 401, c'est probablement un problème de clé
    if (response.status === 401) {
      throw new Error(`Authentification Supabase échouée. Vérifiez que NEXT_PUBLIC_SUPABASE_ANON_KEY est une clé JWT valide (format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...). La clé "sb_publishable_" n'est pas compatible avec les Edge Functions. Récupérez la vraie clé depuis le dashboard Supabase: Settings > API > anon/public key`);
    }
    
    throw new Error(`Scenario generation failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.scenario;
}

/**
 * ÉTAPE 2: Rework Scenario - "Secret Sauce" / "Viral Sauce" (comme n8n "Rework Scenar Viral Sauce")
 * Appelle Supabase Edge Function au lieu d'OpenAI directement
 */
export async function reworkScenarioViralSauce(initialScenario: string): Promise<string> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/rework-scenario-viral`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scenario: initialScenario }),
    }
  );

  if (!response.ok) {
    throw new Error(`Rework scenario failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.scenario;
}

/**
 * ÉTAPE 3: Génération des prompts d'images (comme n8n "Image Prompt")
 * Appelle Supabase Edge Function qui utilise DeepSeek (comme dans n8n)
 */
export async function generateImagePrompts(scenario: string): Promise<ImagePromptResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-image-prompts`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scenario }),
    }
  );

  if (!response.ok) {
    throw new Error(`Image prompts generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * ÉTAPE 4: Génération du script voiceover (comme n8n "Script")
 * Appelle Supabase Edge Function au lieu d'OpenAI directement
 * Utilise à la fois le scénario initial et le scénario reworké (comme dans n8n)
 */
export async function generateVoiceoverScript(reworkedScenario: string, initialScenario?: string): Promise<string> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-script`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        scenario: reworkedScenario,
        initialScenario: initialScenario 
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Script generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.script;
}

/**
 * ÉTAPE 5: Normalisation du script (comme n8n "Message a model")
 * Enlève les guillemets et retours à la ligne
 */
export async function normalizeScript(script: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // GPT-3.5 pour normalisation (moins cher)
    messages: [
      { role: 'user', content: `${SCRIPT_NORMALIZATION_PROMPT}\n\nVoici le script:\n${script}` }
    ],
    temperature: 0.3,
  });

  return completion.choices[0].message.content || '';
}

/**
 * FLOW COMPLET: Génère tout le carousel (remplace generateStoryScript)
 * Suit exactement le workflow n8n avec la "Viral Sauce"
 * IMPORTANT: Tout passe par Supabase Edge Functions
 */
export async function generateStoryScript(concept: string): Promise<{
  title: string;
  slides: ScenarioSlide[];
  metadata?: {
    initialScenario: string;
    reworkedScenario: string;
    rawScript: string;
    normalizedScript: string;
  };
}> {
  const { telegramLogger } = await import('@/lib/logging/telegram-logger');
  
  await telegramLogger.stage('scenario', 'Génération du scénario initial...');
  const initialScenario = await generateScenario(concept);
  await telegramLogger.success('Scénario initial généré');
  
  await telegramLogger.stage('rework', 'Application de la VIRAL SAUCE (optimisation)...');
  const reworkedScenario = await reworkScenarioViralSauce(initialScenario);
  await telegramLogger.success('Scénario optimisé pour la viralité');
  
  // EN PARALLÈLE: Script + Image Prompts (comme dans n8n)
  // Le script utilise à la fois le scénario initial et le scénario reworké
  await telegramLogger.stage('parallel', 'Génération en parallèle: Script + Prompts images...');
  const [imagePromptsData, rawScript] = await Promise.all([
    generateImagePrompts(reworkedScenario),
    generateVoiceoverScript(reworkedScenario, initialScenario)
  ]);
  await telegramLogger.success(`${imagePromptsData.images.length} prompts visuels créés`);
  await telegramLogger.success('Script voiceover généré');
  
  await telegramLogger.stage('normalization', 'Normalisation du script...');
  const normalizedScript = await normalizeScript(rawScript);
  await telegramLogger.success('Script normalisé et prêt');
  
  // Diviser le script normalisé en phrases (10-15 phrases selon le prompt)
  const sentences = normalizedScript
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, 15); // Max 15 phrases

  // Associer chaque image à une phrase
  const slides: ScenarioSlide[] = imagePromptsData.images.map((img, index) => {
    // Déterminer le rôle selon la position
    let role: SlideRole = 'DOPAMINE';
    if (index === 0) role = 'HOOK';
    else if (index === 1 || index === 2) role = 'CONTEXT';
    else if (index >= imagePromptsData.images.length - 2) role = index === imagePromptsData.images.length - 1 ? 'CTA' : 'CLIMAX';

    return {
      role,
      textContent: sentences[index] || sentences[sentences.length - 1], // Texte de la phrase
      imagePrompt: img.prompt
    };
  });

  // Générer un titre basé sur le concept (premier mot + essence)
  const title = concept.split(' ').slice(0, 5).join(' ');

  return {
    title,
    slides,
    metadata: {
      initialScenario,
      reworkedScenario,
      rawScript,
      normalizedScript,
    }
  };
}

/**
 * Transcription audio Whisper (pour Telegram)
 * Utilise l'API OpenAI standard (Whisper n'existe pas sur DeepSeek)
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  // OpenAI SDK expects a web File/Blob. Convert Node Buffer to Uint8Array to satisfy TS (BlobPart).
  const file = new File([new Uint8Array(audioBuffer)], 'audio.ogg', { type: 'audio/ogg' });
  
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
  });

  return transcription.text;
}
