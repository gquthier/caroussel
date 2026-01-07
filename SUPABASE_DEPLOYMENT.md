# Déploiement Supabase - Guide Complet

Ce guide explique comment déployer les Edge Functions et configurer les secrets dans Supabase.

## 🚀 Prérequis

1. **Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login Supabase**
   ```bash
   supabase login
   ```

## 📦 Structure des Edge Functions

```
supabase/
├── functions/
│   ├── generate-scenario/
│   │   └── index.ts
│   ├── generate-image-prompts/
│   │   └── index.ts
│   ├── generate-script/
│   │   └── index.ts
│   └── generate-voiceover/
│       └── index.ts
└── config.toml
```

## 🔐 Configuration des Secrets

### 1. Ajouter les secrets Supabase

```bash
# OpenAI API Key
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Fal.ai API Key
supabase secrets set FAL_KEY=...

# ElevenLabs API Key
supabase secrets set ELEVENLABS_API_KEY=sk_...

# Telegram Bot Token
supabase secrets set TELEGRAM_BOT_TOKEN=123:ABC...
```

### 2. Vérifier les secrets

```bash
supabase secrets list
```

## 📤 Déployer les Edge Functions

### 1. Lier votre projet

```bash
supabase link --project-ref mkjvatqtcswskxtqppnt
```

### 2. Déployer toutes les functions

```bash
supabase functions deploy generate-scenario
supabase functions deploy generate-image-prompts
```

### 3. Vérifier le déploiement

```bash
# Liste des functions déployées
supabase functions list

# Logs d'une function
supabase functions logs generate-scenario
```

## 🧪 Tester les Edge Functions

### Tester generate-scenario

```bash
curl -X POST \
  'https://mkjvatqtcswskxtqppnt.supabase.co/functions/v1/generate-scenario' \
  -H 'Authorization: Bearer sb_publishable_BocCDsZIeLC8OBZQt0ozXg_shjTq35n' \
  -H 'Content-Type: application/json' \
  -d '{"concept": "Un athlète qui n'"'"'abandonne jamais"}'
```

### Tester generate-image-prompts

```bash
curl -X POST \
  'https://mkjvatqtcswskxtqppnt.supabase.co/functions/v1/generate-image-prompts' \
  -H 'Authorization: Bearer sb_publishable_BocCDsZIeLC8OBZQt0ozXg_shjTq35n' \
  -H 'Content-Type: application/json' \
  -d '{"scenario": "Un coureur solitaire s'"'"'entraîne chaque matin..."}'
```

## 🔄 Migrer l'Application vers Edge Functions

### Option 1 : Utiliser les Edge Functions directement

Modifiez `lib/ai/openai.ts` pour appeler les Edge Functions :

```typescript
export async function generateScenario(concept: string): Promise<string> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-scenario`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ concept }),
    }
  );
  
  const data = await response.json();
  return data.scenario;
}
```

### Option 2 : Garder les appels directs (recommandé pour l'instant)

Les Edge Functions sont là comme backup et pour la scalabilité future. L'app fonctionne actuellement avec les appels directs.

## 📊 Avantages des Edge Functions

1. **Sécurité** : Les clés API sont côté serveur uniquement
2. **Performance** : Déployées sur le edge network (proche des utilisateurs)
3. **Scalabilité** : Auto-scaling automatique
4. **Monitoring** : Logs intégrés dans Supabase
5. **Cost** : Paiement à l'usage

## 🔍 Monitoring

### Voir les logs en temps réel

```bash
supabase functions logs --tail generate-scenario
```

### Dashboard Supabase

https://supabase.com/dashboard/project/mkjvatqtcswskxtqppnt/functions

## ⚠️ Important

- Les Edge Functions ont un timeout de 60 secondes par défaut
- Pour les générations longues (images), utilisez le pattern "fire and forget" avec webhooks
- Les secrets sont chiffrés et jamais exposés au client

## 🚀 Architecture Recommandée

```
Client (Web/Telegram)
        ↓
Next.js API Routes (gestion de session, validation)
        ↓
Supabase Edge Functions (appels AI sécurisés)
        ↓
OpenAI / Fal.ai / ElevenLabs
        ↓
Supabase Database (PostgreSQL)
```

## 📝 Notes

- Les Edge Functions sont déployées mais pas encore utilisées dans l'app
- L'app utilise actuellement les appels directs depuis Next.js API Routes
- Migration vers Edge Functions = facile à faire plus tard si nécessaire
