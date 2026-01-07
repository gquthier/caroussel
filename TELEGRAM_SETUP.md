# Configuration Telegram pour Chapters

Ce guide explique comment configurer le bot Telegram pour recevoir des messages vocaux et envoyer les carousels générés.

## 🤖 Configuration du Bot

### Votre Bot Telegram
- **Username**: @chaptersapp_bot
- **Token**: `TELEGRAM_BOT_TOKEN` (à mettre en variable d'environnement, ne pas committer)
- **Bot ID**: 8236207346

Le token doit être fourni via variable d'environnement `TELEGRAM_BOT_TOKEN` (sur Vercel: Project Settings → Environment Variables).

## 🌐 Configuration du Webhook

### Option 1: Développement Local avec ngrok

1. **Installer ngrok** (si pas déjà fait)
   ```bash
   # macOS
   brew install ngrok
   
   # Linux/Windows
   # Télécharger depuis https://ngrok.com/download
   ```

2. **Lancer ngrok**
   ```bash
   ngrok http 3000
   ```
   
   Vous obtiendrez une URL comme : `https://abc123.ngrok.io`

3. **Configurer le webhook**
   ```bash
   curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://abc123.ngrok.io/api/telegram/webhook"}'
   ```

4. **Vérifier le webhook**
   ```bash
   curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
   ```

### Option 2: Production (Vercel/Déployé)

1. **Déployer sur Vercel**
   ```bash
   vercel --prod
   ```

2. **Configurer le webhook avec votre domaine**
   ```bash
   curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://votre-domaine.vercel.app/api/telegram/webhook"}'
   ```

## 📱 Utilisation du Bot

### 1. Envoyer un Message Vocal

1. Ouvrez Telegram et cherchez `@chaptersapp_bot`
2. Appuyez sur `/start`
3. Enregistrez un message vocal avec votre idée de carousel
4. Envoyez le message vocal

**Le bot va automatiquement :**
- 🎙 Transcrire votre vocal avec Whisper
- 📝 Envoyer la transcription
- 🎬 Générer le carousel (2-5 minutes)
- 📸 Envoyer les images générées
- 🔗 Envoyer le lien vers le Studio

### 2. Envoyer un Message Texte

Vous pouvez aussi simplement écrire votre concept en texte :

```
L'histoire d'un coureur ordinaire qui a couru son premier marathon
```

Le bot générera le carousel directement.

## 🎨 Flow Complet

```
┌─────────────────────────────────────────────────────┐
│  UTILISATEUR TELEGRAM                               │
│  Envoie un vocal ou texte                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  WEBHOOK /api/telegram/webhook                      │
│  Reçoit le message                                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Si VOCAL : Transcription Whisper                   │
│  Envoie : "📝 Transcription: [texte]"              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  GÉNÉRATION DU CAROUSEL (Background)                │
│  1. Scenario (OpenAI avec prompts n8n)              │
│  2. Image Prompts (OpenAI)                          │
│  3. Script Voiceover (OpenAI)                       │
│  4. Normalisation Script                            │
│  5. Génération Images (Fal.ai) - batch de 3         │
│  6. Génération Audio (ElevenLabs)                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  ENVOI SUR TELEGRAM                                 │
│  - Message : "✅ Carousel terminé !"                │
│  - Groupe de photos (max 10 par message)            │
│  - Lien vers le Studio                              │
└─────────────────────────────────────────────────────┘
```

## 🎯 Bouton "Q" - Queue Management

Un bouton **Q** flottant est visible sur toutes les pages de l'application.

### Fonctionnalités

- 📊 **Vue en temps réel** des générations en cours
- 🔄 **Mise à jour automatique** toutes les 3 secondes
- 📈 **Progression détaillée** :
  - Nombre d'images générées vs total
  - Nombre d'audios générés vs total
  - Pourcentage de progression global
  - Statut de chaque slide (pending/generating/completed/failed)
- 🔗 **Lien direct** vers le Studio pour chaque projet
- ⚠️ **Alertes** pour les échecs de génération

### Comment utiliser

1. Cliquez sur le bouton **Q** (en haut à droite)
2. Consultez les projets en cours
3. Cliquez sur "Ouvrir le studio" pour éditer un projet
4. Surveillez la progression en temps réel

## 🧪 Tests

### Test 1: Message Vocal Simple

1. Enregistrez un vocal de 10-20 secondes
2. Dites : "Un jeune athlète qui n'a jamais abandonné son rêve"
3. Envoyez sur Telegram
4. Vérifiez :
   - ✅ Transcription reçue
   - ✅ Message "Génération en cours"
   - ✅ Carousel complet après 2-5 min

### Test 2: Message Texte

1. Écrivez : "L'histoire d'une startup qui a failli échouer"
2. Vérifiez :
   - ✅ Message "Génération en cours"
   - ✅ Carousel complet après 2-5 min

### Test 3: Bouton Q

1. Lancez une génération
2. Cliquez sur le bouton **Q** pendant la génération
3. Vérifiez :
   - ✅ Projet visible dans la queue
   - ✅ Progression en temps réel
   - ✅ Statuts des slides (pending → generating → completed)

## 🔧 Dépannage

### Le webhook ne fonctionne pas

**Problème** : Les messages Telegram ne sont pas reçus

**Solution** :
```bash
# 1. Vérifier que ngrok tourne
curl https://votre-url-ngrok.io/api/telegram/webhook

# 2. Vérifier le webhook Telegram
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"

# 3. Réinitialiser le webhook
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=https://votre-nouvelle-url.ngrok.io/api/telegram/webhook"
```

### La transcription ne fonctionne pas

**Problème** : Erreur lors de la transcription Whisper

**Solution** :
- Vérifiez que `OPENAI_API_KEY` est configurée
- Vérifiez que le format audio est supporté (Telegram envoie en `.ogg`)
- Regardez les logs du serveur

### Les images ne se génèrent pas

**Problème** : Images en statut "failed"

**Solution** :
- Vérifiez `FAL_KEY` dans `.env`
- Vérifiez les crédits Fal.ai sur votre compte
- Regardez les logs d'erreur dans le terminal

### L'audio ne se génère pas

**Problème** : Audio en statut "failed"

**Solution** :
- Vérifiez `ELEVENLABS_API_KEY` dans `.env`
- Vérifiez le quota ElevenLabs (10,000 chars/mois gratuit)
- Regardez les logs d'erreur

## 📊 Monitoring

### Voir les logs en temps réel

```bash
# Terminal 1: Serveur Next.js
npm run dev

# Terminal 2: Logs Telegram
tail -f logs/telegram.log  # Si vous configurez un fichier de logs
```

### Voir la base de données

```bash
npx prisma studio
# Ouvre http://localhost:5555
```

## 🚀 Mise en Production

### Variables d'environnement Vercel

Configurez ces variables sur Vercel :

```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.deepseek.com
FAL_KEY=...
ELEVENLABS_API_KEY=sk_...
TELEGRAM_BOT_TOKEN=123:ABC...
NEXTAUTH_URL=https://votre-domaine.vercel.app
```

### Configuration du webhook permanent

Une fois déployé sur Vercel, configurez le webhook définitivement :

```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://votre-domaine.vercel.app/api/telegram/webhook"}'
```

## 🎓 Exemples de Concepts

Voici des exemples de concepts qui fonctionnent bien avec le style "Greatness" :

1. **Sport & Dépassement**
   - "Un coureur qui a couru son premier marathon à 50 ans"
   - "L'histoire d'un boxeur qui s'entraîne chaque jour à 5h du matin"

2. **Entrepreneuriat**
   - "Une startup qui a survécu à 3 échecs avant de réussir"
   - "Comment j'ai lancé mon business avec 100€"

3. **Vie Quotidienne**
   - "Un père célibataire qui élève seul ses enfants"
   - "Une étudiante qui travaille la nuit pour payer ses études"

4. **Transformation Personnelle**
   - "J'ai perdu 30kg en 1 an"
   - "Comment j'ai surmonté ma peur de parler en public"

## 📝 Notes Importantes

- ⏱️ **Temps de génération** : 2-5 minutes pour un carousel de 10 slides
- 💰 **Coûts** : ~$1-1.50 par carousel complet
- 🎨 **Style fixe** : Toujours style "Nike Greatness" (prompts du n8n.json)
- 🔒 **Sécurité** : Le bot ne répond qu'aux messages, pas aux commandes admin
- 📱 **Format** : Images 9:16 (720x1280) optimisées pour TikTok/Reels

---

**🎉 Votre bot Telegram est prêt à transformer des vocaux en carousels viraux !**
