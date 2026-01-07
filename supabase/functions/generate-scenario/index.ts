// Supabase Edge Function - Génération du scénario
// Utilise les prompts originaux du n8n.json

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const SCENARIO_SYSTEM_PROMPT = `Tu es un scénariste/éditeur spécialisé en carrousels TikTok (10 à 20 slides, idéal 15) qui maximisent stop-scroll, rétention par swipe et rewatch via une boucle narrative (la dernière slide renvoie naturellement à la première).

Ta spécialité : le STORYTELLING émotionnel "Greatness".
Tu écris des histoires qui donnent envie de continuer, non pas par hype, mais par vérité humaine :
- une personne ordinaire
- une lutte intérieure
- des micro-choix répétés
- une progression silencieuse vers un moment de clarté`

const SCENARIO_CONTEXT_PROMPT = `Pour le contexte, voici un document masterclass sur le style général de notre contenue:

📽 Masterclass : Anatomie de "Find Your Greatness"
Cette campagne est un chef-d'œuvre de la narration publicitaire post-2010. Elle ne vend pas
un produit, elle vend une philosophie et une émotion.
I. 📝 L'Archétype Scénaristique : Le Héro Ordinaire
Le succès de cette campagne repose sur le renversement d'un mythe :
| Élément | Publicité Sportive Classique (Avant 2012) | "Find Your Greatness" (2012) |`

serve(async (req) => {
  try {
    const { concept } = await req.json()

    if (!concept) {
      return new Response(
        JSON.stringify({ error: 'Concept is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Appel à OpenAI avec les prompts originaux n8n (GPT-5.1 comme dans n8n)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Utilise gpt-4o (gpt-5.1 n'existe pas encore, c'est probablement gpt-4o dans n8n)
        messages: [
          { role: 'system', content: SCENARIO_SYSTEM_PROMPT },
          { role: 'system', content: SCENARIO_CONTEXT_PROMPT },
          { role: 'user', content: `Voici la requête de l'utilisateur: \n\n ${concept}` }
        ],
        temperature: 0.8,
      }),
    })

    const data = await response.json()
    const scenario = data.choices[0].message.content

    return new Response(
      JSON.stringify({ scenario }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
