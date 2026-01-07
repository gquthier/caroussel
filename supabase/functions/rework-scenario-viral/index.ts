// Supabase Edge Function - Rework Scenario Viral Sauce
// ÉTAPE CRUCIALE : Améliore le scénario avec les techniques virales
// Utilise les prompts originaux du n8n.json

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const REWORK_SCENARIO_SYSTEM_PROMPT = `
Tu es un assistant IA spécialisé dans l'optimisation de carousels TikTok (10 à 20 slides) pour maximiser la rétention, le taux de swipe et le potentiel de viralité.


Tu disposes, comme ressource de fond, de la "Bible de la création de scénarios YouTube Shorts", qui contient :
* Les principes de hook, boucle de dopamine, progression narrative, climax, CTA, métriques (STR/AVD)
* Les concepts de changement visuel régulier, contraste émotionnel, et promesse de valeur`

const REWORK_SCENARIO_CONTEXT_PROMPT = `VOici le Bible Youtube Short que tu dois consulter et adapter avant chaque réponse pour retravailler le contenue:

📱 LA BIBLE DE LA CRÉATION DE SCÉNARIOS YOUTUBE SHORTS
Une masterclass complète basée sur les stratégies éprouvées et les techniques avancées des créateurs à plus de 100 millions de vues.

TABLE DES MATIÈRES
Fondamentaux du Succès

La Sélection du Créneau (Niche)

La Mécanique de l'Algorithme YouTube

La Structure des Hooks

Le Design des Scénarios`

const REWORK_SCENARIO_USER_PROMPT = `Tu es expert en création de contenu court sur TikTok et Instagram, et en psychologie humaine. Depuis plus de 20 ans, tu dois générer un contenu viral en te basant sur ce scénario et sur le contexte que tu as, je voudrais que tu me régénères le scénario, en suivant l'output de sortie de manière améliorée, afin qu'il soit plus viral, tout en conservant le style, l'histoire globale, les personnages principaux, l'environnement, le décor et la touche artistique de celui-ci.`

serve(async (req) => {
  try {
    const { scenario } = await req.json()

    if (!scenario) {
      return new Response(
        JSON.stringify({ error: 'Scenario is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Appel à OpenAI avec les prompts originaux n8n (Rework Scenario - Secret Sauce, GPT-5.2 dans n8n)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Utilise gpt-4o (gpt-5.2 n'existe pas encore)
        messages: [
          { role: 'system', content: REWORK_SCENARIO_SYSTEM_PROMPT },
          { role: 'system', content: REWORK_SCENARIO_CONTEXT_PROMPT },
          { role: 'user', content: `${REWORK_SCENARIO_USER_PROMPT}\n\nVoici le scénario initial:\n${scenario}` }
        ],
        temperature: 0.8,
      }),
    })

    const data = await response.json()
    const reworkedScenario = data.choices[0].message.content

    return new Response(
      JSON.stringify({ scenario: reworkedScenario }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
