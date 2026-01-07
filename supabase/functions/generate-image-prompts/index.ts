// Supabase Edge Function - Génération des prompts d'images
// Utilise les prompts originaux du n8n.json

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const IMAGE_PROMPT_SYSTEM_PROMPT = `À ne surtout pas faire. Tu dois constamment garder de la cohérence entre les différentes images sur le prompt et le style.

Avec le même personnage, à peu près sur le même âge, le même environnement, le même univers.

Tu dois t'assurer que chacun des prompts respecte cette cohérence entre les différents personnages. 

Je ne dois jamais écrire de texte, ni faire apparaître un logo, un texte, ou peu importe sur l'image.

Je veux strictement les images au format 9:16.`

const IMAGE_PROMPT_USER_PROMPT = `Ok, tu es expert en génération de prompt d'image en 9:16 (format vertical). Réaliste pour des modèles comme Stable Diffusion, Midjourney ou Gemini Pro. 

Ton rôle est de me générer un prompt spécifique qui représente l'ensemble des scénarios, enfin l'ensemble des images de ce carrousel.

Je voudrais avoir une image par moment du scénario qui représente exactement le moment. Le style doit être réaliste, lumineux.

Dans chaque prompt, tu dois préciser que le format attendu est le 9:16 et qu'il n'y a aucun texte, aucun logo.

Return a JSON object with this structure:
{
  "images": [
    {
      "numero": 1,
      "prompt": "Semi-realistic cinematic illustration, 9:16 aspect ratio, no text, no logos..."
    }
  ]
}`

serve(async (req) => {
  try {
    const { scenario } = await req.json()

    if (!scenario) {
      return new Response(
        JSON.stringify({ error: 'Scenario is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // IMPORTANT: Utilise DeepSeek pour les image prompts (comme dans n8n)
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not configured')
    }
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner', // Utilise deepseek-reasoner comme dans n8n
        messages: [
          { role: 'system', content: IMAGE_PROMPT_SYSTEM_PROMPT + '\n\nIMPORTANT: You MUST respond with valid JSON format. Output format: {"images": [{"numero": 1, "prompt": "..."}]}' },
          { role: 'user', content: `${IMAGE_PROMPT_USER_PROMPT}\n\nVoici le scénario:\n${scenario}\n\nRespond in JSON format with the exact structure: {"images": [{"numero": 1, "prompt": "..."}]}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      }),
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    const imagePrompts = JSON.parse(content)

    return new Response(
      JSON.stringify(imagePrompts),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
