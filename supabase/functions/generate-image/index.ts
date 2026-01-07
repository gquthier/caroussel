// Supabase Edge Function - Génération d'images via Fal.AI
// Utilise le même endpoint que n8n

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const FAL_API_KEY = Deno.env.get('FAL_KEY')
const FAL_API_URL = 'https://fal.run/fal-ai/flux-pro/v1.1-ultra'

serve(async (req) => {
  try {
    const { prompt, aspect_ratio = '9:16' } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!FAL_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'FAL_KEY is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Appel à Fal.AI avec les mêmes paramètres que n8n
    const response = await fetch(FAL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt, // Prompt brut sans modification
        aspect_ratio: aspect_ratio, // 9:16 par défaut comme n8n
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ error: `Fal.AI API error: ${response.statusText}`, details: errorText }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()

    if (!data.images || data.images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images generated' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Retourner l'URL de la première image (comme dans lib/ai/fal.ts)
    return new Response(
      JSON.stringify({ imageUrl: data.images[0].url }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

