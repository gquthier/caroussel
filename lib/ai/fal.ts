import { FAL_IMAGE_SETTINGS } from '@/lib/prompts/original-n8n-prompts';

/**
 * Génération d'images via Fal.AI
 * Appelle Supabase Edge Function au lieu de Fal.AI directement
 * Cela permet de garder la clé FAL_KEY secrète côté serveur
 */
export async function generateImage(prompt: string): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  const response = await fetch(
    `${supabaseUrl}/functions/v1/generate-image`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt: prompt, // Prompt brut sans modification
        aspect_ratio: FAL_IMAGE_SETTINGS.aspect_ratio, // 9:16 comme n8n
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase Edge Function (generate-image) error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      url: `${supabaseUrl}/functions/v1/generate-image`
    });
    throw new Error(`Image generation failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.imageUrl;
}

export async function regenerateImage(prompt: string): Promise<string> {
  // Same as generateImage but with different seed for variation
  return generateImage(prompt);
}
