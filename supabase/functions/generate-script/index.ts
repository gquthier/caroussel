// Supabase Edge Function - Génération du script voiceover
// Utilise les prompts originaux du n8n.json
// IMPORTANT: Prend en input le scénario REWORKÉ (après viral sauce)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const SCRIPT_SYSTEM_PROMPT = `You're a specialist into copywriting, and a billion dollar brand marketing specilist that write script to give emotion. 

Your working for a brand that vision is the following: 

Push people to pursue greatness. Every human being should strive for self-fulfillment by doing exceptional things.

Make sure they never give up on the idea that they can do exceptional things.

The world would be better if people didn't settle for a simple, ordinary life.

THE MAN WHO CAN'T BE MOVED`

const SCRIPT_CONTEXT_PROMPT = `Example Script

Greatness. It's just something we made up. Somehow we've come to believe that greatness
is a gift reserved for a chosen few, for prodigies, for superstars. And the rest of us can only
stand by watching. You can forget that greatness is not some rare DNA strand. It's not some
precious thing. Greatness is no more unique to us than breathing. We're all capable of it. All
of us. Some people are told they were born with greatness. [Music]
Some people tell themselves. Some just know.`

const SCRIPT_USER_PROMPT = `Ok, tu es un storyteller expert en rédaction de script pour du voiceover sur des carousels TikTok et des shortforms.
Tu dois suivre toutes les instructions système pour générer un script qui permette de couvrir la bande audio de ce carousel.
Le script doit être cohérent dans la continuité par rapport aux scénarios et par rapport aux étapes du carousel, mais ne doit pas refléter exactement ce scénario.
En gros, ça doit être assez large pour que les gens puissent s'identifier sans forcément qu'on parle de ce scénario spécifique.

Essaye juste de faire en sorte que la première phrase soit cohérente en termes de hook par rapport à l'image. Tu dois vraiment faire en sorte que la première phrase soit la plus top scrolling possible, tout en restant cohérent avec le reste du script. 

Aussi, tu dois t'assurer que le texte ne fasse pas plus de 15 phrases. 15 phrases est la limite maximale.

Idéalement, tu dois générer entre 10 et 15 phrases. 

Tu dois exclusivement renvoyer les scripts en anglais.`

serve(async (req) => {
  try {
    const { scenario, initialScenario } = await req.json()

    if (!scenario) {
      return new Response(
        JSON.stringify({ error: 'Scenario (reworked) is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Dans n8n, le script utilise à la fois le scénario initial et le scénario reworké
    const scriptPrompt = initialScenario 
      ? `${SCRIPT_USER_PROMPT}\n\n1. Tu peux te baser sur le scénario initial de la requête d'utilisateurs:\n\n${initialScenario}\n\n2. Tu peux te baser sur le scénario définitif de la boucle de carousel\n\n${scenario}\n\nRenvoie uniquement et exclusivement le script, et rien d'autre. Tu dois exclusivement renvoyer les scripts en anglais et uniquement en anglais.`
      : `${SCRIPT_USER_PROMPT}\n\nVoici le scénario:\n${scenario}\n\nRenvoie uniquement et exclusivement le script, et rien d'autre. Tu dois exclusivement renvoyer les scripts en anglais et uniquement en anglais.`

    // Appel à OpenAI avec les prompts originaux n8n (GPT-4o pour remplacer gpt-5.2)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Utilise gpt-4o (gpt-5.2 n'existe pas encore)
        messages: [
          { role: 'system', content: SCRIPT_SYSTEM_PROMPT },
          { role: 'system', content: SCRIPT_CONTEXT_PROMPT },
          { role: 'user', content: scriptPrompt }
        ],
        temperature: 0.8,
      }),
    })

    const data = await response.json()
    const script = data.choices[0].message.content

    return new Response(
      JSON.stringify({ script }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
